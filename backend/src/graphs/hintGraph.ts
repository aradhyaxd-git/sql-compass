import { Annotation, StateGraph, START, END, MemorySaver } from '@langchain/langgraph'
import { z } from 'zod'
import { getModel } from './model.js'
import {
  CLASSIFY_ERROR_PROMPT,
  GENERATE_HINT_PROMPT,
  LEVEL_RULES,
  LEAK_GUARD_NEGATIVE_CONSTRAINT,
} from '../prompts/hintPrompts.js'
import {
  compareResults,
  getReferenceQueryResult,
  type JudgeVerdict,
} from '../services/judgeService.js'
import { executeUserQuery } from '../services/executionService.js'
import { logger } from '../utils/logger.js'

export const ErrorClassEnum = z.enum([
  'syntax_error',
  'wrong_columns',
  'wrong_filter',
  'missing_join_or_aggregation',
  'nearly_correct',
  'empty_or_unrelated',
])

function safeReplace(template: string, replacements: Record<string, string>): string {
  const keys = Object.keys(replacements)
  if (keys.length === 0) return template
  const pattern = new RegExp(keys.map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|'), 'g')
  return template.replace(pattern, (matched) => replacements[matched] ?? matched)
}

export const HintState = Annotation.Root({
  userId: Annotation<string>(),
  assignmentId: Annotation<string>(),
  studentQuery: Annotation<string>(),
  description: Annotation<string>(),
  tags: Annotation<string[]>({
    default: () => [],
    reducer: (_, next) => next,
  }),
  schemaText: Annotation<string>(),
  referenceSql: Annotation<string>(),
  orderMatters: Annotation<boolean>({
    default: () => false,
    reducer: (_, next) => next,
  }),
  verdict: Annotation<JudgeVerdict | null>({
    default: () => null,
    reducer: (_, next) => next,
  }),
  errorClass: Annotation<string | null>({
    default: () => null,
    reducer: (_, next) => next,
  }),
  concept: Annotation<string | null>({
    default: () => null,
    reducer: (_, next) => next,
  }),
  level: Annotation<1 | 2 | 3>({
    default: () => 1,
    reducer: (_, next) => next,
  }),
  hint: Annotation<string | null>({
    default: () => null,
    reducer: (_, next) => next,
  }),
  leakRetries: Annotation<number>({
    default: () => 0,
    reducer: (_, next) => (next !== undefined ? next : 0),
  }),
  leakDetected: Annotation<boolean>({
    default: () => false,
    reducer: (_, next) => next,
  }),
  staticFallback: Annotation<string | null>({
    default: () => null,
    reducer: (_, next) => next,
  }),
})

export type HintStateType = typeof HintState.State

export async function judgeNode(state: HintStateType): Promise<Partial<HintStateType>> {
  const query = state.studentQuery?.trim()
  if (!query) {
    return {
      verdict: {
        correct: false,
        reason: 'execution_error',
        message: 'No SQL query entered yet.',
      },
    }
  }

  try {
    const studentResult = await executeUserQuery(query)
    const refResult = await getReferenceQueryResult(state.referenceSql)
    const verdict = compareResults(studentResult, refResult, state.orderMatters)
    return { verdict }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return {
      verdict: {
        correct: false,
        reason: 'execution_error',
        message: msg,
      },
    }
  }
}

export async function classifyErrorNode(state: HintStateType): Promise<Partial<HintStateType>> {
  const query = state.studentQuery?.trim() || ''

  if (!query) {
    return {
      errorClass: 'empty_or_unrelated',
      concept: 'Initial Query Construction',
    }
  }

  const prompt = safeReplace(CLASSIFY_ERROR_PROMPT, {
    '{description}': state.description,
    '{tags}': state.tags.join(', ') || 'None',
    '{studentQuery}': query,
    '{verdictStatus}': state.verdict?.correct ? 'CORRECT' : 'INCORRECT',
    '{verdictReason}': state.verdict?.reason || 'None',
    '{verdictMessage}': state.verdict?.message || 'None',
  })

  try {
    const model = getModel('classify')
    const structuredModel = model.withStructuredOutput(
      z.object({
        errorClass: ErrorClassEnum,
        concept: z.string(),
      })
    )

    const result = await structuredModel.invoke(prompt)
    return {
      errorClass: result.errorClass,
      concept: result.concept,
    }
  } catch {
    return {
      errorClass: 'nearly_correct',
      concept: 'General SQL syntax and filtering',
    }
  }
}

export async function pickLevelNode(state: HintStateType): Promise<Partial<HintStateType>> {
  const current = state.level || 1
  let nextLevel: 1 | 2 | 3 = 1
  if (state.hint) {
    nextLevel = current === 1 ? 2 : 3
  } else {
    nextLevel = current
  }

  return { level: nextLevel, leakRetries: 0 }
}

export async function generateNode(state: HintStateType): Promise<Partial<HintStateType>> {
  const level = state.level || 1
  const levelRule = LEVEL_RULES[level]
  const diffSummary = state.verdict?.diff
    ? JSON.stringify(state.verdict.diff, null, 2)
    : state.verdict?.message || 'None'

  let prompt = safeReplace(GENERATE_HINT_PROMPT, {
    '{description}': state.description,
    '{schemaText}': state.schemaText || 'Standard schema',
    '{studentQuery}': state.studentQuery || 'No query entered',
    '{errorClass}': state.errorClass || 'General Query Formulation',
    '{concept}': state.concept || 'SQL logic',
    '{diffSummary}': diffSummary,
    '{level}': String(level),
    '{levelRules}': levelRule,
  })

  if (state.leakRetries > 0) {
    prompt += `\n\n${LEAK_GUARD_NEGATIVE_CONSTRAINT}`
  }

  try {
    const model = getModel('generate')
    const response = await model.invoke(prompt)
    const hintText = typeof response.content === 'string' ? response.content.trim() : ''
    return { hint: hintText, leakDetected: false }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    logger.error('HintGraph LLM generation error', {
      event: 'hintgraph_generation_error',
      error: msg,
    })
    return {
      hint: null,
      leakDetected: false,
    }
  }
}

export async function leakGuardNode(state: HintStateType): Promise<Partial<HintStateType>> {
  const hint = state.hint
  if (!hint) {
    return { leakDetected: false }
  }

  if (state.level === 1) {
    if (/```[\s\S]*```/.test(hint) || /\bSELECT\b[\s\S]+\bFROM\b/i.test(hint)) {
      return {
        leakDetected: true,
        leakRetries: state.leakRetries + 1,
      }
    }
  }

  const selectMatch = hint.match(/SELECT[\s\S]+?FROM[\s\S]+?(?:;|$|`)/i)
  if (selectMatch) {
    const candidateQuery = selectMatch[0].replace(/[`']/g, '').trim()
    try {
      const studentResult = await executeUserQuery(candidateQuery)
      const refResult = await getReferenceQueryResult(state.referenceSql)
      const testVerdict = compareResults(studentResult, refResult, state.orderMatters)
      if (testVerdict.correct) {
        return {
          leakDetected: true,
          leakRetries: state.leakRetries + 1,
        }
      }
    } catch {
      // Candidate query not runnable
    }
  }

  return { leakDetected: false }
}

export async function fallbackNode(state: HintStateType): Promise<Partial<HintStateType>> {
  const fallback =
    state.staticFallback ||
    `Review the assignment requirement: "${state.description}". Focus on selecting the required columns and applying the proper filtering or aggregation.`
  return {
    hint: fallback,
    leakDetected: false,
  }
}

export async function respondNode(state: HintStateType): Promise<Partial<HintStateType>> {
  if (state.verdict?.correct) {
    return {
      hint: 'Great job! Your query already returns the correct result set. No hint needed!',
    }
  }
  return {}
}

export function routeAfterGuard(state: HintStateType): 'respond' | 'generate_hint' | 'fallback' {
  if (!state.leakDetected) {
    return 'respond'
  }
  if (state.leakRetries < 2) {
    return 'generate_hint'
  }
  return 'fallback'
}

export const hintWorkflow = new StateGraph(HintState)
  .addNode('judge', judgeNode)
  .addNode('classify_error', classifyErrorNode)
  .addNode('pick_level', pickLevelNode)
  .addNode('generate_hint', generateNode)
  .addNode('leak_guard', leakGuardNode)
  .addNode('respond', respondNode)
  .addNode('fallback', fallbackNode)
  .addEdge(START, 'judge')
  .addEdge('judge', 'classify_error')
  .addEdge('classify_error', 'pick_level')
  .addEdge('pick_level', 'generate_hint')
  .addEdge('generate_hint', 'leak_guard')
  .addConditionalEdges('leak_guard', routeAfterGuard, {
    respond: 'respond',
    generate_hint: 'generate_hint',
    fallback: 'fallback',
  })
  .addEdge('respond', END)
  .addEdge('fallback', END)

export const compiledHintGraph = hintWorkflow.compile()
