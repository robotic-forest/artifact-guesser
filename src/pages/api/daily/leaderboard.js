import { initDB } from "@/lib/apiUtils/mongodb"
import { ObjectId } from "mongodb"

/**
 * GET /api/daily/leaderboard?dateKey=2026-04-10
 *
 * Returns the top 20 scores for a given day's daily challenge.
 * Defaults to today if no dateKey is provided.
 */
const dailyLeaderboard = async (req, res) => {
  const db = await initDB()

  const today = new Date().toISOString().slice(0, 10)
  const dateKey = req.query.dateKey || today

  const topScores = await db.collection('dailyGames').aggregate([
    { $match: { dateKey, completed: true } },
    { $sort: { score: -1, completedAt: 1 } }, // Highest score first, earliest completion as tiebreaker
    { $limit: 20 },
    { $project: { userId: 1, score: 1, completedAt: 1 } }
  ]).toArray()

  if (topScores.length === 0) {
    return res.json({ dateKey, scores: [] })
  }

  // Fetch usernames
  const userIds = [...new Set(topScores.map(s => s.userId))].map(id => {
    try { return new ObjectId(id) } catch { return null }
  }).filter(Boolean)

  const users = await db.collection('accounts').find({ _id: { $in: userIds } }).toArray()
  const userMap = {}
  users.forEach(u => { userMap[u._id.toString()] = u.username })

  const scores = topScores.map((s, i) => ({
    rank: i + 1,
    username: userMap[s.userId] || 'Anonymous',
    score: s.score,
    completedAt: s.completedAt
  }))

  res.json({ dateKey, scores })
}

export default dailyLeaderboard
