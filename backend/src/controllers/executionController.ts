import type { Request, Response } from 'express'
import mongoose from 'mongoose'
import { executeUserQuery } from '../services/executionService.js'
import { saveAttempt } from '../services/attemptService.js'
import {
  compareResults,
  getReferenceQueryResult,
  type JudgeVerdict,
} from '../services/judgeService.js'
import Assignment from '../models/Assignment.js'
import { logger } from '../utils/logger.js'
import { acquireExecutionSlot } from '../services/concurrencyGuard.js'
import { checkDialectCompatibility } from '../services/dialectLinter.js'
import { metrics } from '../services/metricsService.js'

export const handleExecution = async (req: Request, res: Response): Promise<void> => {
  const userId = req.userId || 'anonymous'
  const userKey = userId !== 'anonymous' ? userId : req.ip || 'anonymous'
  const slot = acquireExecutionSlot(userKey)

  if (!slot.allowed) {
    metrics.recordConcurrencyRejected()
    res.status(429).json({
      success: false,
      message: 'A query is already executing for your account. Please wait for it to complete.',
    })
    return
  }

  try {
    const { assignmentId, sql } = req.body || {}

    if (typeof sql !== 'string' || !sql.trim()) {
      res.status(400).json({ success: false, message: 'SQL query is required and must be a valid string' })
      return
    }

    if (!assignmentId || !mongoose.Types.ObjectId.isValid(assignmentId)) {
      res.status(400).json({ success: false, message: 'A valid assignmentId is required' })
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
      metrics.recordExecutionError()
      const msg = execError instanceof Error ? execError.message : String(execError)
      const dialectCheck = checkDialectCompatibility(sql)
      const dialectHint = dialectCheck.hasDialectIssue ? dialectCheck.hints.join(' ') : undefined

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

      res.status(400).json({ success: false, message: msg, hint: dialectHint })
      return
    }

    metrics.recordExecutionSuccess()

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

    metrics.recordVerdict(verdict.correct)

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
    res.status(500).json({ success: false, message: 'Internal server error executing query' })
  } finally {
    slot.release()
  }
}