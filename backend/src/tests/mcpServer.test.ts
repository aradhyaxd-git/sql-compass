import assert from 'node:assert'
import { handleJsonRpcMessage } from '../mcp/mcpServer.js'

console.log('Testing mcpServer JSON-RPC handler...')

async function runTests(): Promise<void> {
  // Test initialize
  const initRes = await handleJsonRpcMessage({
    jsonrpc: '2.0',
    id: 1,
    method: 'initialize',
  })
  assert.ok(initRes, 'Expected initialize response')
  assert.strictEqual(initRes.id, 1)
  assert.strictEqual((initRes.result as { serverInfo: { name: string } }).serverInfo.name, 'sql-compass-mcp')

  // Test initialized notification (returns null)
  const notifRes = await handleJsonRpcMessage({
    jsonrpc: '2.0',
    method: 'notifications/initialized',
  })
  assert.strictEqual(notifRes, null)

  // Test ping
  const pingRes = await handleJsonRpcMessage({
    jsonrpc: '2.0',
    id: 'ping-1',
    method: 'ping',
  })
  assert.ok(pingRes)
  assert.strictEqual(pingRes.id, 'ping-1')

  // Test tools/list
  const toolsListRes = await handleJsonRpcMessage({
    jsonrpc: '2.0',
    id: 2,
    method: 'tools/list',
  })
  assert.ok(toolsListRes)
  const tools = (toolsListRes.result as { tools: Array<{ name: string }> }).tools
  assert.ok(Array.isArray(tools))
  assert.ok(tools.length >= 5)
  const toolNames = tools.map((t) => t.name)
  assert.ok(toolNames.includes('list_challenges'))
  assert.ok(toolNames.includes('get_schema'))
  assert.ok(toolNames.includes('run_sandbox_query'))
  assert.ok(toolNames.includes('evaluate_submission'))
  assert.ok(toolNames.includes('request_guidance'))

  // Test tools/call: list_challenges
  const listCallRes = await handleJsonRpcMessage({
    jsonrpc: '2.0',
    id: 3,
    method: 'tools/call',
    params: {
      name: 'list_challenges',
      arguments: {},
    },
  })
  assert.ok(listCallRes)
  assert.ok(listCallRes.result)
  const content = (listCallRes.result as { content: Array<{ type: string; text: string }> }).content
  assert.strictEqual(content[0].type, 'text')
  const parsedChallenges = JSON.parse(content[0].text)
  assert.ok(Array.isArray(parsedChallenges))
  assert.ok(parsedChallenges.length > 0)

  // Test tools/call: list_challenges with difficulty filter
  const filteredCallRes = await handleJsonRpcMessage({
    jsonrpc: '2.0',
    id: 4,
    method: 'tools/call',
    params: {
      name: 'list_challenges',
      arguments: { difficulty: 'easy' },
    },
  })
  assert.ok(filteredCallRes)
  const filteredChallenges = JSON.parse(
    (filteredCallRes.result as { content: Array<{ text: string }> }).content[0].text
  )
  assert.ok(filteredChallenges.every((c: { difficulty: string }) => c.difficulty === 'easy'))

  // Test unknown tool
  const unknownToolRes = await handleJsonRpcMessage({
    jsonrpc: '2.0',
    id: 5,
    method: 'tools/call',
    params: {
      name: 'non_existent_tool',
      arguments: {},
    },
  })
  assert.ok(unknownToolRes)
  assert.strictEqual((unknownToolRes.result as { isError?: boolean }).isError, true)

  // Test unknown method
  const unknownMethodRes = await handleJsonRpcMessage({
    jsonrpc: '2.0',
    id: 6,
    method: 'unsupported/method',
  })
  assert.ok(unknownMethodRes)
  assert.strictEqual(unknownMethodRes.error?.code, -32601)

  console.log('[SUCCESS] mcpServer test suite passed successfully.')
}

runTests().catch((err) => {
  console.error('[FAILURE] mcpServer tests failed:', err)
  process.exit(1)
})
