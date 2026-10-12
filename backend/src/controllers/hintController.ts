import type { Request, Response } from 'express'
import { generateHint } from '../services/llmService.js'
import { formatSchemaTextForPrompt } from '../services/schemaService.js'
import { compiledHintGraph } from '../graphs/hintGraph.js'
import { hintCache } from '../services/hintCacheService.js'
import Assignment from '../models/Assignment.js'
import { logger } from '../utils/logger.js'
import type { HintRequestBody } from '../types/index.js'

export const getAssignmentHint = async (req: Request, res: Response): Promise<void> => {
  try {
    const { assignmentId, currentQuery } = req.body as HintRequestBody
    const userId = req.userId || 'anonymous'

    if (!assignmentId) {
      res.status(400).json({ success: false, message: 'assignmentId is required' })
      return
    }

    // Check hint cache first (assuming level 1 for quick lookup if query identical)
    const cached = hintCache.get(assignmentId, currentQuery ?? '', 1)
    if (cached) {
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
      // Fallback to static schemaDetails if live Postgres schema query is unavailable
    }

    const useHintGraph =
      process.env.HINT_GRAPH === 'true' ||
      process.env.HINT_GRAPH === 'on' ||
      process.env.HINT_GRAPH === '1'

    if (useHintGraph && assignment.referenceSql) {
      try {
        const graphResult = await compiledHintGraph.invoke(
          {
            userId,
            assignmentId,
            studentQuery: currentQuery ?? '',
            description: assignment.description,
            tags: assignment.tags || [],
            schemaText,
            referenceSql: assignment.referenceSql,
            orderMatters: assignment.orderMatters ?? false,
            staticFallback: assignment.schemaDetails,
          },
          {
            configurable: {
              thread_id: `${userId}:${assignmentId}`,
            },
          }
        )

        // Store guard-approved hints in cache
        if (graphResult.hint && !graphResult.leakDetected) {
          hintCache.set(assignmentId, currentQuery ?? '', graphResult.level || 1, {
            hint: graphResult.hint,
            errorClass: graphResult.errorClass,
            concept: graphResult.concept,
          })
        }

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
      } catch (graphErr) {
        logger.warn('LangGraph execution failed, falling back to legacy hint generation', {
          event: 'hint_graph_fallback',
          error: graphErr instanceof Error ? graphErr.message : String(graphErr),
        })
      }
    }

    // Fallback to legacy single call
    const hint = await generateHint(
      assignment.description,
      schemaText,
      currentQuery ?? ''
    )

    hintCache.set(assignmentId, currentQuery ?? '', 1, {
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
    res.status(500).json({ success: false, message: msg })
  }
}

export const streamAssignmentHint = async (req: Request, res: Response): Promise<void> => {
  try {
    const { assignmentId, currentQuery } = req.body as HintRequestBody
    const userId = req.userId || 'anonymous'

    if (!assignmentId) {
      res.status(400).json({ success: false, message: 'assignmentId is required' })
      return
    }

    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Connection', 'keep-alive')

    const sendEvent = (event: string, data: Record<string, unknown>) => {
      res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
    }

    // Check Cache
    const cached = hintCache.get(assignmentId, currentQuery ?? '', 1)
    if (cached) {
      sendEvent('progress', { stage: 'cache', message: 'Serving hint from cache' })
      sendEvent('done', {
        hint: cached.hint,
        level: cached.level,
        errorClass: cached.errorClass,
        concept: cached.concept,
        fromCache: true,
      })
      res.end()
      return
    }

    const assignment = await Assignment.findById(assignmentId)
      .select('description schemaDetails tableNames referenceSql orderMatters tags')
      .lean()

    if (!assignment) {
      sendEvent('error', { message: 'Assignment not found' })
      res.end()
      return
    }

    sendEvent('progress', { stage: 'judging', message: 'Evaluating query in database sandbox...' })

    let schemaText = assignment.schemaDetails
    try {
      if (assignment.tableNames && assignment.tableNames.length > 0) {
        schemaText = await formatSchemaTextForPrompt(assignment.tableNames)
      }
    } catch {
      // Fallback
    }

    sendEvent('progress', { stage: 'classifying', message: 'Analyzing error pattern against schema...' })

    const graphResult = await compiledHintGraph.invoke(
      {
        userId,
        assignmentId,
        studentQuery: currentQuery ?? '',
        description: assignment.description,
        tags: assignment.tags || [],
        schemaText,
        referenceSql: assignment.referenceSql,
        orderMatters: assignment.orderMatters ?? false,
        staticFallback: assignment.schemaDetails,
      },
      {
        configurable: {
          thread_id: `${userId}:${assignmentId}`,
        },
      }
    )

    sendEvent('progress', { stage: 'guarding', message: 'Verifying hint against solution leak guard...' })

    if (graphResult.hint && !graphResult.leakDetected) {
      hintCache.set(assignmentId, currentQuery ?? '', graphResult.level || 1, {
        hint: graphResult.hint,
        errorClass: graphResult.errorClass,
        concept: graphResult.concept,
      })
    }

    // For Level 1 hints: stream word by word for interactive feel
    const words = (graphResult.hint || '').split(' ')
    for (const word of words) {
      sendEvent('token', { token: `${word} ` })
    }

    sendEvent('done', {
      hint: graphResult.hint,
      level: graphResult.level,
      errorClass: graphResult.errorClass,
      concept: graphResult.concept,
      fromCache: false,
    })

    res.end()
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: msg })
    } else {
      res.write(`event: error\ndata: ${JSON.stringify({ message: msg })}\n\n`)
      res.end()
    }
  }
}