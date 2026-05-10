import { initDB } from "@/lib/apiUtils/mongodb"
import { verifyAuth, withSessionRoute } from "@/lib/apiUtils/session"

/**
 * POST /api/daily/claim
 *
 * Transfers a previously-anonymous daily run to the now-logged-in user.
 * Used right after a guest finishes the daily and signs up — their
 * server-side anonDoc is found by anonymousId and re-keyed to userId.
 *
 * Body: { dateKey, anonymousId }
 *
 * The score that lands on the leaderboard is whatever the server already
 * has stored — the client cannot inject one.
 */
const claim = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const user = verifyAuth(req, res)
  if (!user) return

  const db = await initDB()
  const { dateKey, anonymousId } = req.body || {}

  if (!dateKey || !anonymousId) {
    return res.status(400).json({ error: 'Missing dateKey or anonymousId' })
  }

  const todayKey = new Date().toISOString().slice(0, 10)
  if (dateKey !== todayKey) {
    return res.status(400).json({ error: 'Can only claim today\'s daily run' })
  }

  // No overwriting an existing user-owned record
  const existing = await db.collection('dailyGames').findOne({ userId: user._id, dateKey })
  if (existing) return res.status(409).json({ error: 'Daily already claimed' })

  // Find the anon doc to transfer
  const anonDoc = await db.collection('dailyGames').findOne({ anonymousId, dateKey })
  if (!anonDoc) {
    return res.status(404).json({ error: 'No anonymous daily run found for this device' })
  }

  await db.collection('dailyGames').updateOne(
    { _id: anonDoc._id },
    { $set: { userId: user._id }, $unset: { anonymousId: '' } },
  )

  res.json({ success: true, _id: anonDoc._id, score: anonDoc.score, completed: !!anonDoc.completed })
}

export default withSessionRoute(claim)
