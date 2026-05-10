import { initDB } from "@/lib/apiUtils/mongodb"
import { withSessionRoute } from "@/lib/apiUtils/session"

/**
 * GET /api/active-run
 *
 * Returns the run the user should resume. Priority:
 *   in-progress daily (today) → ongoing personal game → fallback to '/'
 * Anonymous callers always get the personal fallback.
 */
const handler = async (req, res) => {
  const user = req.session?.user
  if (!user?._id) return res.json({ kind: null, url: '/' })

  const db = await initDB()
  const todayKey = new Date().toISOString().slice(0, 10)

  // dailyGames.userId is stored verbatim from session (string). games.userId
  // is also a string. Match both as strings to avoid ObjectId-vs-string drift.
  const userIdStr = user._id.toString()

  const dailyGame = await db.collection('dailyGames').findOne(
    { userId: userIdStr, dateKey: todayKey, completed: { $ne: true } },
    { projection: { _id: 1 } },
  )
  if (dailyGame) return res.json({ kind: 'daily', url: '/daily' })

  const personal = await db.collection('games').findOne(
    { userId: userIdStr, ongoing: true, gameType: { $ne: 'multiplayer' } },
    { projection: { _id: 1 } },
  )
  if (personal) return res.json({ kind: 'personal', url: '/' })

  return res.json({ kind: null, url: '/' })
}

export default withSessionRoute(handler)
