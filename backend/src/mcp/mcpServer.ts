import { MCP_TOOLS, executeMcpTool } from './tools.js'

export interface JsonRpcRequest {
  jsonrpc: '2.0'
  id?: string | number | null
  method: string
  params?: Record<string, unknown>
}

export interface JsonRpcResponse {
  jsonrpc: '2.0'
  id: string | number | null
  result?: unknown
  error?: {
    code: number
    message: string
    data?: unknown
  }
}

export async function handleJsonRpcMessage(req: JsonRpcRequest): Promise<JsonRpcResponse | null> {
  const { id = null, method, params = {} } = req

  switch (method) {
    case 'initialize': {
      return {
        jsonrpc: '2.0',
        id,
        result: {
          protocolVersion: '2024-11-05',
          capabilities: {
            tools: {},
          },
          serverInfo: {
            name: 'sql-compass-mcp',
            version: '1.0.0',
          },
        },
      }
    }

    case 'notifications/initialized': {
      return null
    }

    case 'ping': {
      return {
        jsonrpc: '2.0',
        id,
        result: {},
      }
    }

    case 'tools/list': {
      return {
        jsonrpc: '2.0',
        id,
        result: {
          tools: MCP_TOOLS,
        },
      }
    }

    case 'tools/call': {
      const toolName = typeof params.name === 'string' ? params.name : ''
      const toolArgs = (params.arguments as Record<string, unknown>) || {}

      try {
        const output = await executeMcpTool(toolName, toolArgs)
        return {
          jsonrpc: '2.0',
          id,
          result: {
            content: [
              {
                type: 'text',
                text: output,
              },
            ],
          },
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        return {
          jsonrpc: '2.0',
          id,
          result: {
            content: [
              {
                type: 'text',
                text: `Error executing tool '${toolName}': ${msg}`,
              },
            ],
            isError: true,
          },
        }
      }
    }

    default: {
      return {
        jsonrpc: '2.0',
        id,
        error: {
          code: -32601,
          message: `Method '${method}' not found`,
        },
      }
    }
  }
}
