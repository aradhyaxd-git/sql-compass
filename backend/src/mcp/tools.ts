import mongoose from 'mongoose'
import Assignment from '../models/Assignment.js'
import { sampleAssignments } from '../seed.js'
import { executeUserQuery } from '../services/executionService.js'
import { getReferenceQueryResult, compareResults } from '../services/judgeService.js'
import { formatSchemaTextForPrompt, getSchemaForTables } from '../services/schemaService.js'
import { generateHint } from '../services/llmService.js'
import { checkDialectCompatibility } from '../services/dialectLinter.js'

export interface McpToolDefinition {
  name: string
  description: string
  inputSchema: {
    type: 'object'
    properties: Record<string, unknown>
    required?: string[]
  }
}

export const MCP_TOOLS: McpToolDefinition[] = [
  {
    name: 'list_challenges',
    description: 'List available SQL challenges in SQL Compass filtered by optional difficulty and topic tag',
    inputSchema: {
      type: 'object',
      properties: {
        difficulty: {
          type: 'string',
          enum: ['easy', 'medium', 'hard'],
          description: 'Filter by difficulty tier',
        },
        tag: {
          type: 'string',
          description: 'Filter by SQL concept tag (e.g. JOIN, GROUP BY, Subquery)',
        },
      },
    },
  },
  {
    name: 'get_schema',
    description: 'Retrieve database table schemas, column data types, and sample rows for a challenge',
    inputSchema: {
      type: 'object',
      properties: {
        assignmentId: {
          type: 'string',
          description: 'The assignment ID or title',
        },
      },
      required: ['assignmentId'],
    },
  },
  {
    name: 'run_sandbox_query',
    description: 'Execute a raw SQL query inside the isolated PostgreSQL sandbox (read-only and ephemeral write transactions)',
    inputSchema: {
      type: 'object',
      properties: {
        sql: {
          type: 'string',
          description: 'The SQL query to execute',
        },
      },
      required: ['sql'],
    },
  },
  {
    name: 'evaluate_submission',
    description: 'Execute and automatically judge a student SQL query against the challenge hidden reference answer',
    inputSchema: {
      type: 'object',
      properties: {
        assignmentId: {
          type: 'string',
          description: 'The assignment ID',
        },
        sql: {
          type: 'string',
          description: 'The SQL solution query to evaluate',
        },
      },
      required: ['assignmentId', 'sql'],
    },
  },
  {
    name: 'request_guidance',
    description: 'Request progressive pedagogical AI hints and syntax diagnostics for a query attempt',
    inputSchema: {
      type: 'object',
      properties: {
        assignmentId: {
          type: 'string',
          description: 'The assignment ID',
        },
        currentQuery: {
          type: 'string',
          description: 'The student current draft SQL query',
        },
      },
      required: ['assignmentId'],
    },
  },
]

async function findAssignment(assignmentId: string) {
  if (mongoose.connection.readyState === 1) {
    try {
      const doc = await Assignment.findById(assignmentId).lean()
      if (doc) return doc
    } catch {
      // not a valid ObjectId or query failure
    }
  }
  return (
    sampleAssignments.find(
      (s, idx) =>
        `sample_${idx + 1}` === assignmentId ||
        s.title.toLowerCase().includes(assignmentId.toLowerCase())
    ) || null
  )
}

export async function executeMcpTool(name: string, args: Record<string, unknown>): Promise<string> {
  switch (name) {
    case 'list_challenges': {
      let challenges: Array<{ _id: string; title: string; difficulty: string; tags: string[]; description: string }>
      if (mongoose.connection.readyState === 1) {
        try {
          const docs = await Assignment.find()
            .select('_id title difficulty tags description')
            .lean()
          if (docs.length > 0) {
            challenges = docs.map((d) => ({
              _id: String(d._id),
              title: d.title,
              difficulty: d.difficulty,
              tags: d.tags || [],
              description: d.description,
            }))
          } else {
            challenges = sampleAssignments.map((s, idx) => ({
              _id: `sample_${idx + 1}`,
              title: s.title,
              difficulty: s.difficulty,
              tags: s.tags,
              description: s.description,
            }))
          }
        } catch {
          challenges = sampleAssignments.map((s, idx) => ({
            _id: `sample_${idx + 1}`,
            title: s.title,
            difficulty: s.difficulty,
            tags: s.tags,
            description: s.description,
          }))
        }
      } else {
        challenges = sampleAssignments.map((s, idx) => ({
          _id: `sample_${idx + 1}`,
          title: s.title,
          difficulty: s.difficulty,
          tags: s.tags,
          description: s.description,
        }))
      }

      if (args.difficulty) {
        challenges = challenges.filter((c) => c.difficulty === args.difficulty)
      }
      if (args.tag) {
        const tagFilter = String(args.tag).toLowerCase()
        challenges = challenges.filter((c) => c.tags.some((t) => t.toLowerCase().includes(tagFilter)))
      }

      return JSON.stringify(challenges, null, 2)
    }

    case 'get_schema': {
      const assignmentId = String(args.assignmentId || '')
      const assignment = await findAssignment(assignmentId)

      if (!assignment) {
        throw new Error(`Assignment not found: ${assignmentId}`)
      }

      if (assignment.tableNames && assignment.tableNames.length > 0) {
        try {
          const schema = await getSchemaForTables(assignment.tableNames)
          return JSON.stringify({ title: assignment.title, schema }, null, 2)
        } catch {
          return JSON.stringify({ title: assignment.title, schemaDetails: assignment.schemaDetails }, null, 2)
        }
      }

      return JSON.stringify({ title: assignment.title, schemaDetails: assignment.schemaDetails }, null, 2)
    }

    case 'run_sandbox_query': {
      const sql = String(args.sql || '')
      if (!sql.trim()) {
        throw new Error('Query cannot be empty')
      }
      const result = await executeUserQuery(sql, { allowWriteSandbox: true })
      return JSON.stringify(
        {
          columns: result.columns,
          rowCount: result.rowCount,
          durationMs: result.duration,
          executionPlan: result.executionPlan,
          rows: result.rows.slice(0, 50),
        },
        null,
        2
      )
    }

    case 'evaluate_submission': {
      const assignmentId = String(args.assignmentId || '')
      const sql = String(args.sql || '')

      const assignment = await findAssignment(assignmentId)

      if (!assignment || !assignment.referenceSql) {
        throw new Error(`Assignment or reference SQL not found for ${assignmentId}`)
      }

      const userResult = await executeUserQuery(sql, { allowWriteSandbox: true })
      const refResult = await getReferenceQueryResult(assignment.referenceSql)
      const verdict = compareResults(userResult, refResult, assignment.orderMatters ?? false)

      return JSON.stringify(
        {
          assignment: assignment.title,
          verdict: verdict.correct ? 'ACCEPTED' : 'REJECTED',
          reason: verdict.reason,
          message: verdict.message,
          diff: verdict.diff,
          userRowCount: userResult.rowCount,
          durationMs: userResult.duration,
        },
        null,
        2
      )
    }

    case 'request_guidance': {
      const assignmentId = String(args.assignmentId || '')
      const currentQuery = String(args.currentQuery || '')

      const dialectCheck = checkDialectCompatibility(currentQuery)
      if (dialectCheck.hasDialectIssue) {
        return JSON.stringify(
          {
            type: 'dialect_hint',
            message: dialectCheck.hints.join(' '),
          },
          null,
          2
        )
      }

      const assignment = await findAssignment(assignmentId)

      if (!assignment) {
        throw new Error(`Assignment not found: ${assignmentId}`)
      }

      let schemaText = assignment.schemaDetails || ''
      if (assignment.tableNames && assignment.tableNames.length > 0) {
        try {
          schemaText = await formatSchemaTextForPrompt(assignment.tableNames)
        } catch {
          // fallback
        }
      }

      const hint = await generateHint(assignment.description, schemaText, currentQuery)
      return JSON.stringify({ type: 'ai_guidance', hint }, null, 2)
    }

    default:
      throw new Error(`Unknown MCP tool: ${name}`)
  }
}
