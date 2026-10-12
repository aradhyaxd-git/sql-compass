import type { Request, Response } from 'express'
import { Command } from '@langchain/langgraph'
import { compiledGeneratorGraph } from '../graphs/generatorGraph.js'
import { formatSchemaTextForPrompt } from '../services/schemaService.js'

export const generateAssignments = async (req: Request, res: Response): Promise<void> => {
  try {
    const { topic, count = 3, difficulty = 'medium', tableNames = ['employees'] } = req.body

    const runId = `gen_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`

    let schemaDetails = ''
    try {
      schemaDetails = await formatSchemaTextForPrompt(tableNames)
    } catch {
      schemaDetails = 'Standard relational schema'
    }

    const state = await compiledGeneratorGraph.invoke(
      {
        topic: topic || 'SQL Joins and Aggregations',
        count: Number(count) || 3,
        difficulty: (difficulty as 'easy' | 'medium' | 'hard') || 'medium',
        tableNames,
        schemaDetails,
      },
      {
        configurable: {
          thread_id: runId,
        },
      }
    )

    res.status(200).json({
      success: true,
      data: {
        runId,
        status: state.status,
        candidates: state.survivors,
      },
    })
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    res.status(500).json({ success: false, message: msg })
  }
}

export const resumeAssignmentGeneration = async (req: Request, res: Response): Promise<void> => {
  try {
    const { runId } = req.params
    const { approve = true } = req.body

    if (!runId) {
      res.status(400).json({ success: false, message: 'runId parameter is required' })
      return
    }

    const resumedState = await compiledGeneratorGraph.invoke(
      new Command({
        resume: { approved: Boolean(approve) },
      }),
      {
        configurable: {
          thread_id: runId,
        },
      }
    )

    res.status(200).json({
      success: true,
      data: {
        runId,
        status: resumedState.status,
        approvedAssignments: resumedState.approvedAssignments,
      },
    })
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    res.status(500).json({ success: false, message: msg })
  }
}
