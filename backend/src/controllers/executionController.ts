import type { Request, Response } from 'express'
import { executeUserQuery } from '../services/executionService.js'
import { saveAttempt } from '../services/attemptService.js'
import {
  compareResults,
  getReferenceQueryResult,
  type JudgeVerdict,
} from '../services/judgeService.js'
import Assignment from '../models/Assignment.js'
import type { ExecuteRequestBody } from '../types/index.js' 

import { logger } from '../utils/logger.js'

export const handleExecution = async (req: Request, res: Response): Promise<void> => {
  try {
    const { assignmentId, sql } = req.body as ExecuteRequestBody
    const userId = req.userId! 

    if (!sql || !sql.trim()) {
      res.status(400).json({ success: false, message: 'SQL query is required' })
      return
    }

    if (!assignmentId) {
      res.status(400).json({ success: false, message: 'assignmentId is required' })
      return
    }

    const assignment = await Assignment.findById(assignmentId)
      .select('title referenceSql orderMatters')
      .lean()

    if (!assignment) {
      res.status(404).json({ success: false, message: 'Assignment not found' })
      return
    }

    let result
    try {
      result = await executeUserQuery(sql)
    } catch (execError) {
      const msg = execError instanceof Error ? execError.message : String(execError)
      await saveAttempt({
        userId,
        assignmentId,
        assignmentTitle: assignment.title,
        query: sql,
        status: 'error',
        correct: false,
        verdictReason: 'execution_error',
        rowCount: 0,
        errorMessage: msg,
      }).catch((saveErr) => {
        logger.error('Error saving failed attempt to database', {
          event: 'save_attempt_error',
          error: String(saveErr),
        })
      })  

      res.status(400).json({ success: false, message: msg })
      return
    }

    let verdict: JudgeVerdict
    try {
      if (assignment.referenceSql) {
        const refResult = await getReferenceQueryResult(assignment.referenceSql)
        verdict = compareResults(result, refResult, assignment.orderMatters ?? false)
      } else {
        verdict = {
          correct: false,
          reason: 'execution_error',
          message: 'No reference query configured for this assignment.',
        }
      }
    } catch (refError) {
      const msg = refError instanceof Error ? refError.message : String(refError)
      logger.error('Error evaluating reference query', {
        event: 'reference_query_error',
        assignmentId,
        error: msg,
      })
      verdict = {
        correct: false,
        reason: 'execution_error',
        message: 'Internal error checking answer against reference.',
      }
    }

    const { xpEarned } = await saveAttempt({
      userId,
      assignmentId,
      assignmentTitle: assignment.title,
      query: sql,
      status: 'success',
      correct: verdict.correct,
      verdictReason: verdict.reason,
      diffSummary: verdict.diff as unknown as Record<string, unknown>,
      rowCount: result.rowCount,
    }).catch((saveErr) => {
      logger.error('Error saving successful attempt to database', {
        event: 'save_attempt_error',
        error: String(saveErr),
      })
      return { xpEarned: 0 }
    })

    logger.info('User query evaluated and scored', {
      event: 'query_evaluated',
      assignmentId,
      correct: verdict.correct,
      reason: verdict.reason,
      xpEarned,
      rowCount: result.rowCount,
      durationMs: result.duration,
    })

    res.status(200).json({
      success: true,
      data: {
        ...result,
        verdict,
        xpEarned,
      },
    })
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    logger.error('Unhandled execution controller error', {
      event: 'execution_controller_failure',
      error: msg,
    })
    res.status(500).json({ success: false, message: msg })
  }
}