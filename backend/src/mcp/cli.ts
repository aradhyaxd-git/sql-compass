import '../env.js'
import readline from 'node:readline'
import { handleJsonRpcMessage, type JsonRpcRequest } from './mcpServer.js'
import { connectPersistenceDB } from '../config/db.mongo.js'
import { connectSandboxDB } from '../config/db.postgres.js'
import { logger } from '../utils/logger.js'

logger.transports.forEach((t) => {
  t.silent = true
})

async function startStdioMcpServer(): Promise<void> {
  await connectSandboxDB().catch(() => {})
  await connectPersistenceDB().catch(() => {})

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false,
  })

  rl.on('line', async (line) => {
    if (!line.trim()) return

    try {
      const parsed = JSON.parse(line) as JsonRpcRequest
      const response = await handleJsonRpcMessage(parsed)
      if (response) {
        process.stdout.write(`${JSON.stringify(response)}\n`)
      }
    } catch (err) {
      const errResponse = {
        jsonrpc: '2.0',
        id: null,
        error: {
          code: -32700,
          message: `Parse error: ${err instanceof Error ? err.message : String(err)}`,
        },
      }
      process.stdout.write(`${JSON.stringify(errResponse)}\n`)
    }
  })
}

startStdioMcpServer().catch((err) => {
  process.stderr.write(`MCP stdio server failure: ${err}\n`)
  process.exit(1)
})
