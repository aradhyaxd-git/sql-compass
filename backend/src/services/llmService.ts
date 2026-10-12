import { getModel } from '../graphs/model.js'
import { logger } from '../utils/logger.js'

export const generateHint = async (
  questionDescription: string,
  schemaDetails: string,
  userQuery: string
): Promise<string> => {
  const prompt = `You are an expert SQL tutor helping a student practice SQL.

ASSIGNMENT:
${questionDescription}

DATABASE SCHEMA:
${schemaDetails}

STUDENT'S CURRENT QUERY:
${userQuery.trim() || "The student hasn't written anything yet."}

YOUR TASK:
Provide a single, focused hint to guide the student toward the correct answer.

STRICT RULES:
- NEVER provide the complete correct SQL query
- NEVER write more than 3 sentences
- If their query has a syntax error, point to the specific issue
- If their query has the right structure but wrong logic, nudge the concept (e.g. "think about filtering after grouping")
- If they haven't started, suggest which SQL clause to begin with
- Be encouraging and precise
- Return only the hint text — no preamble, no "Sure!", no "Here's a hint:"`

  try {
    const model = getModel('generate')
    const response = await model.invoke(prompt)
    const text = typeof response.content === 'string' ? response.content.trim() : ''
    return text
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    logger.error('Fallback LLM hint generation failed', {
      event: 'fallback_hint_generation_failure',
      error: msg,
    })
    throw new Error(`LLM hint generation failed: ${msg}`)
  }
}