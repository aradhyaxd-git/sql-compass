import assert from 'node:assert'

console.log('Testing executionPlan parsing...')

const mockPlanOutput = [
  {
    Plan: {
      'Node Type': 'Limit',
      'Startup Cost': 0.0,
      'Total Cost': 12.5,
      'Plan Rows': 500,
      'Plan Width': 32,
      Plans: [
        {
          'Node Type': 'Seq Scan',
          'Relation Name': 'employees',
          'Startup Cost': 0.0,
          'Total Cost': 10.0,
          'Plan Rows': 100,
        },
      ],
    },
  },
]

function parseExecutionPlan(planOutput: unknown) {
  if (!planOutput || !Array.isArray(planOutput) || !planOutput[0]) return undefined
  try {
    const rootPlan = (planOutput[0] as { Plan?: Record<string, unknown> })?.Plan
    if (!rootPlan) return undefined

    const nodeTypes: string[] = []
    let hasSeqScan = false
    let hasIndexScan = false

    const traverse = (node: Record<string, unknown> | undefined) => {
      if (!node || typeof node !== 'object') return
      const type = typeof node['Node Type'] === 'string' ? node['Node Type'] : ''
      if (type) {
        nodeTypes.push(type)
        if (type.toLowerCase().includes('seq scan')) hasSeqScan = true
        if (type.toLowerCase().includes('index')) hasIndexScan = true
      }
      const subPlans = node['Plans']
      if (Array.isArray(subPlans)) {
        subPlans.forEach((sub) => traverse(sub as Record<string, unknown>))
      }
    }

    traverse(rootPlan)

    return {
      totalCost: Number(rootPlan['Total Cost']) || 0,
      startupCost: Number(rootPlan['Startup Cost']) || 0,
      planRows: Number(rootPlan['Plan Rows']) || 0,
      planWidth: Number(rootPlan['Plan Width']) || 0,
      nodeTypes,
      hasSeqScan,
      hasIndexScan,
    }
  } catch {
    return undefined
  }
}

const summary = parseExecutionPlan(mockPlanOutput)
assert.ok(summary)
assert.strictEqual(summary.totalCost, 12.5)
assert.strictEqual(summary.startupCost, 0.0)
assert.strictEqual(summary.planRows, 500)
assert.strictEqual(summary.hasSeqScan, true)
assert.strictEqual(summary.hasIndexScan, false)
assert.deepStrictEqual(summary.nodeTypes, ['Limit', 'Seq Scan'])

console.log('[SUCCESS] executionPlan test suite passed successfully.')
