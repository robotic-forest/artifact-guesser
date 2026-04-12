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

  const { dateKey, score, username } = req.body

  if (!dateKey || score === undefined) {
    return res.status(400).json({ error: 'dateKey and score are required' })
  }

  // Verify the daily challenge exists
  const daily = await db.collection('dailyChallenges').findOne({ dateKey })
  if (!daily) {
    return res.status(404).json({ error: 'Daily challenge not found for this date' })
  }

  const challenge = {
    type: 'daily',
    dateKey,
    dailyChallengeId: daily._id.toString(),
    artifactIds: daily.artifactIds,
    rounds: daily.rounds,
    challengerUserId: user?._id || null,
    challengerUsername: username || (user ? 'A friend' : 'Someone'),
    challengerScore: score,
    createdAt: new Date()
  }

  const { insertedId } = await db.collection('challenges').insertOne(challenge)

  res.json({ challengeId: insertedId.toString() })
}

export default withSessionRoute(createChallenge)
