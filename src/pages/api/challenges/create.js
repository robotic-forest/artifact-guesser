import { initDB } from "@/lib/apiUtils/mongodb"
import { withSessionRoute } from "@/lib/apiUtils/session"

/**
 * POST /api/challenges/create
 *
 * Creates a friend challenge from a completed daily run.
 *
 * Body: {
 *   dateKey: string — the daily challenge date
 *   score: number — the challenger's score
 *   username: string — the challenger's display name (or anonymous)
 * }
 *
 * Returns: { challengeId: string }
 */
const createChallenge = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const db = await initDB()
  const user = req.session?.user

  const { dateKey, score, username, anonymousId } = req.body

  if (!dateKey || score === undefined) {
    return res.status(400).json({ error: 'dateKey and score are required' })
  }

  // Verify the daily challenge exists
  const daily = await db.collection('dailyChallenges').findOne({ dateKey })
  if (!daily) {
    return res.status(404).json({ error: 'Daily challenge not found for this date' })
  }

  // Dedup: one challenge per (player, dateKey). Pre-create effects, strict-
  // mode double-mounts, and rapid clicks should all yield the same challenge.
  // Logged-in users keyed by userId, anonymous by their persistent anonymousId.
  const dedupQuery = user?._id
    ? { challengerUserId: user._id, dateKey }
    : (anonymousId ? { challengerAnonId: anonymousId, dateKey } : null)

  if (dedupQuery) {
    const existing = await db.collection('challenges').findOne(dedupQuery, { projection: { _id: 1 } })
    if (existing) {
      await db.collection('challenges').updateOne(
        { _id: existing._id },
        { $set: { challengerScore: score, challengerUsername: username || (user ? 'A friend' : 'Someone') } },
      )
      return res.json({ challengeId: existing._id.toString() })
    }
  }

  const challenge = {
    type: 'daily',
    dateKey,
    dailyChallengeId: daily._id.toString(),
    artifactIds: daily.artifactIds,
    rounds: daily.rounds,
    challengerUserId: user?._id || null,
    challengerAnonId: !user && anonymousId ? anonymousId : null,
    challengerUsername: username || (user ? 'A friend' : 'Someone'),
    challengerScore: score,
    createdAt: new Date()
  }

  const { insertedId } = await db.collection('challenges').insertOne(challenge)

  res.json({ challengeId: insertedId.toString() })
}

export default withSessionRoute(createChallenge)
