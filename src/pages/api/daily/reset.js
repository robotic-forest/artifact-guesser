import { initDB } from "@/lib/apiUtils/mongodb"
import { verifyAuth, withSessionRoute } from "@/lib/apiUtils/session"

/**
 * POST /api/daily/reset
 *
 * Admin-only. Deletes today's daily challenge (and any in-progress daily games
 * for it) so the next GET /api/daily/current will regenerate with fresh artifacts.
 *
 * Useful when today's pick rolled a problematic artifact.
 */
const reset = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const user = verifyAuth(req, res, ['Admin'])
  if (!user) return

  const db = await initDB()
  const dateKey = req.body?.dateKey || new Date().toISOString().slice(0, 10)

  const dailyResult = await db.collection('dailyChallenges').deleteOne({ dateKey })
  const gamesResult = await db.collection('dailyGames').deleteMany({ dateKey })

  res.json({
    success: true,
    dateKey,
    dailyDeleted: dailyResult.deletedCount,
    gamesDeleted: gamesResult.deletedCount
  })
}

export default withSessionRoute(reset)
