import '../env.js'
import { ChatGroq } from '@langchain/groq'
import { ChatGoogleGenerativeAI } from '@langchain/google-genai'
import type { BaseChatModel } from '@langchain/core/language_models/chat_models'

export type ModelRole = 'classify' | 'generate' | 'judge'

export const getModel = (role: ModelRole): BaseChatModel => {
  const provider = (process.env.LLM_PROVIDER || (process.env.GROQ_API_KEY ? 'groq' : 'gemini')).toLowerCase()

  const temperatureMap: Record<ModelRole, number> = {
    classify: 0.0,
    generate: 0.3,
    judge: 0.0,
  }

  if (provider === 'groq') {
    const apiKey = process.env.GROQ_API_KEY || ''
    // Groq free tier available models:
    // - classify: openai/gpt-oss-20b (fast, structured outputs, JSON mode)
    // - generate: openai/gpt-oss-120b (high reasoning accuracy, structured outputs)
    // - judge: openai/gpt-oss-120b
    const groqModelMap: Record<ModelRole, string> = {
      classify: process.env.CLASSIFY_MODEL || 'openai/gpt-oss-20b',
      generate: process.env.GENERATE_MODEL || 'openai/gpt-oss-120b',
      judge: process.env.JUDGE_MODEL || 'openai/gpt-oss-120b',
    }

    return new ChatGroq({
      apiKey,
      model: groqModelMap[role],
      temperature: temperatureMap[role],
    })
  }

  const geminiApiKey = process.env.LLM_API_KEY || process.env.GEMINI_API_KEY || ''
  const geminiModelMap: Record<ModelRole, string> = {
    classify: process.env.CLASSIFY_MODEL || 'gemini-2.5-flash',
    generate: process.env.GENERATE_MODEL || 'gemini-2.5-flash',
    judge: process.env.JUDGE_MODEL || 'gemini-2.5-flash',
  }

  return new ChatGoogleGenerativeAI({
    apiKey: geminiApiKey,
    model: geminiModelMap[role],
    temperature: temperatureMap[role],
  })
}
