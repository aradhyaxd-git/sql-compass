import { GoogleGenerativeAI } from '@google/generative-ai'
import dotenv from 'dotenv'

dotenv.config()

if (!process.env.LLM_API_KEY) {
  throw new Error('LLM_API_KEY is not set in environment variables')
}

const genAI = new GoogleGenerativeAI(process.env.LLM_API_KEY)
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

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
    const result = await model.generateContent(prompt)
    const text = result.response.text().trim()
    return text
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    throw new Error(`LLM hint generation failed: ${msg}`)
  }
}