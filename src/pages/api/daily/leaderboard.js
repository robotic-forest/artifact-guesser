import { initDB } from "@/lib/apiUtils/mongodb"
import { ObjectId } from "mongodb"

/**
 * GET /api/daily/leaderboard?dateKey=2026-04-10[&includeAnon=1]
 *
 * Returns the top 20 scores for a given day's daily challenge.
 * Defaults to today if no dateKey is provided.
 *
 * By default only ranks logged-in players (the public leaderboard needs a
 * username, and it's a signup nudge). Pass includeAnon=1 (admin dashboard) to
 * also include anonymous runs, labelled 'anon', so the top scores reflect ALL
 * games — otherwise the count includes anon runs but the score list wouldn't.
 */
const dailyLeaderboard = async (req, res) => {
  const db = await initDB()

  const today = new Date().toISOString().slice(0, 10)
  const dateKey = req.query.dateKey || today
  const includeAnon = req.query.includeAnon === '1' || req.query.includeAnon === 'true'

  // Total completed daily games that day (anon + logged-in).
  const totalGames = await db.collection('dailyGames').countDocuments({ dateKey, completed: true })

  const match = { dateKey, completed: true }
  if (!includeAnon) match.userId = { $exists: true, $ne: null }

  const topScores = await db.collection('dailyGames').aggregate([
    { $match: match },
    { $sort: { score: -1, completedAt: 1 } }, // Highest score first, earliest completion as tiebreaker
    { $limit: 20 },
    { $project: { userId: 1, score: 1, completedAt: 1 } }
  ]).toArray()

  if (topScores.length === 0) {
    return res.json({ dateKey, totalGames, scores: [] })
  }

  // Fetch usernames for the logged-in entries.
  const userIds = [...new Set(topScores.map(s => s.userId).filter(Boolean))].map(id => {
    try { return new ObjectId(id) } catch { return null }
  }).filter(Boolean)

  const users = await db.collection('accounts').find({ _id: { $in: userIds } }).toArray()
  const userMap = {}
  users.forEach(u => { userMap[u._id.toString()] = u.username })

  // Resolve a display name per entry:
  //  - logged-in with a real account  -> their username
  //  - anonymous run                  -> 'anon' (only when includeAnon)
  //  - logged-in but account deleted  -> dropped (orphaned dailyGames)
  const scores = topScores
    .map(s => ({
      username: s.userId ? (userMap[s.userId] || null) : (includeAnon ? 'anon' : null),
      score: s.score,
      completedAt: s.completedAt,
    }))
    .filter(s => s.username !== null)
    .map((s, i) => ({ rank: i + 1, ...s }))

  res.json({ dateKey, totalGames, scores })
}

export default dailyLeaderboard
