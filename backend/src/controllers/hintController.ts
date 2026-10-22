import type { Request, Response } from 'express'
import mongoose from 'mongoose'
import { generateHint } from '../services/llmService.js'
import { formatSchemaTextForPrompt } from '../services/schemaService.js'
import { compiledHintGraph } from '../graphs/hintGraph.js'
import { hintCache } from '../services/hintCacheService.js'
import Assignment from '../models/Assignment.js'
import { logger } from '../utils/logger.js'
import { metrics } from '../services/metricsService.js'

export const getAssignmentHint = async (req: Request, res: Response): Promise<void> => {
  try {
    const { assignmentId, currentQuery } = req.body || {}
    const userId = req.userId || 'anonymous'

    if (!assignmentId || !mongoose.Types.ObjectId.isValid(assignmentId)) {
      res.status(400).json({ success: false, message: 'A valid assignmentId is required' })
      return
    }

    const queryStr = typeof currentQuery === 'string' ? currentQuery : ''

    const cached = hintCache.get(assignmentId, queryStr, 1)
    if (cached) {
      metrics.recordHintRequest(true)
      res.status(200).json({
        success: true,
        data: {
          hint: cached.hint,
          level: cached.level,
          errorClass: cached.errorClass,
          concept: cached.concept,
          fromCache: true,
        },
      })
      return
    }

    const assignment = await Assignment.findById(assignmentId)
      .select('description schemaDetails tableNames referenceSql orderMatters tags')
      .lean()

    if (!assignment) {
      res.status(404).json({ success: false, message: 'Assignment not found' })
      return
    }

    let schemaText = assignment.schemaDetails
    try {
      if (assignment.tableNames && assignment.tableNames.length > 0) {
        schemaText = await formatSchemaTextForPrompt(assignment.tableNames)
      }
    } catch {
      // Fallback to static schemaDetails if live Postgres query fails
    }

    const useHintGraph =
      process.env.HINT_GRAPH === 'true' ||
      process.env.HINT_GRAPH === 'on' ||
      process.env.HINT_GRAPH === '1'

    if (useHintGraph && assignment.referenceSql) {
      try {
        const threadId = `${userId}:${assignmentId}`
        const graphResult = await compiledHintGraph.invoke(
          {
            userId,
            assignmentId,
            description: assignment.description,
            tags: assignment.tags || [],
            schemaText,
            studentQuery: queryStr,
            referenceSql: assignment.referenceSql,
            orderMatters: assignment.orderMatters ?? false,
          },
          { configurable: { thread_id: threadId } }
        )

        if (graphResult.hint) {
          metrics.recordHintRequest(false)
          hintCache.set(assignmentId, queryStr, graphResult.level || 1, {
            hint: graphResult.hint,
            errorClass: graphResult.errorClass,
            concept: graphResult.concept,
          })

          res.status(200).json({
            success: true,
            data: {
              hint: graphResult.hint,
              level: graphResult.level,
              errorClass: graphResult.errorClass,
              concept: graphResult.concept,
              fromCache: false,
            },
          })
          return
        }
      } catch (graphErr) {
        logger.warn('LangGraph execution failed, falling back to legacy hint generation', {
          event: 'hint_graph_fallback',
          error: graphErr instanceof Error ? graphErr.message : String(graphErr),
        })
      }
    }

    const hint = await generateHint(
      assignment.description,
      schemaText,
      queryStr
    )

    metrics.recordHintRequest(false)
    hintCache.set(assignmentId, queryStr, 1, {
      hint,
      errorClass: null,
      concept: null,
    })

    res.status(200).json({
      success: true,
      data: {
        hint,
        level: 1,
        fromCache: false,
      },
    })
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    logger.error('Unhandled hint controller error', {
      event: 'hint_controller_failure',
      error: msg,
    })
    res.status(500).json({ success: false, message: 'Internal server error generating hint' })
  }
}