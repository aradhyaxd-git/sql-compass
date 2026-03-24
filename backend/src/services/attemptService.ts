import Attempt from '../models/Attempt.js'

const XP_PER_SUCCESS = 20 

interface SaveAttemptParams {
  userId: string
  assignmentId: string
  assignmentTitle: string
  query: string
  status: 'success' | 'error'
  rowCount: number
  errorMessage?: string
}

export const saveAttempt = async (params: SaveAttemptParams): Promise<void> => {
  const xpEarned = params.status === 'success' ? XP_PER_SUCCESS : 0

  await Attempt.create({
    ...params,
    xpEarned,
    executedAt: new Date(),
  })
}

export const getUserStats = async (userId: string) => {
  const [missionsCompleted, totalAttempts, xpResult] = await Promise.all([
    Attempt.distinct('assignmentId', { userId, status: 'success' }),
    Attempt.countDocuments({ userId }),
    Attempt.aggregate([
      { $match: { userId } },
      { $group: { _id: null, totalXP: { $sum: '$xpEarned' } } },
    ]),
  ])

  const totalXP: number = xpResult[0]?.totalXP ?? 0

  return {
    missionsCompleted: missionsCompleted.length,
    queriesExecuted: totalAttempts,
    totalXP,
    rank: getRank(totalXP),
  }
}

export const getUserAttempts = async (userId: string, limit = 20) => {
  return Attempt.find({ userId })
    .sort({ executedAt: -1 })
    .limit(limit)
    .lean()
}

const RANKS = [
  { name: 'Explorer',minXP: 0    },
  { name: 'Navigator',minXP: 500  },
  { name: 'Query Architect',minXP: 1500 },
  { name: 'Data Commander',minXP: 3000 },
  { name: 'SQL Grandmaster',minXP: 6000 },
]

export function getRank(xp: number): { name: string; index: number; nextXP: number | null } {
  let rankIndex=0
  for (let i = RANKS.length - 1; i >= 0; i--) {
    if (xp >= RANKS[i].minXP) {
      rankIndex = i
      break
    }
  }
  return {
    name: RANKS[rankIndex].name,
    index: rankIndex,
    nextXP: rankIndex < RANKS.length - 1 ? RANKS[rankIndex + 1].minXP : null,
  }
}