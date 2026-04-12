import { initDB } from "@/lib/apiUtils/mongodb"
import { ObjectId } from "mongodb"

/**
 * GET /api/challenges/[id]
 *
 * Fetches a challenge by ID. Returns challenge info and the first artifact
 * so the recipient can start playing immediately.
 */
const getChallenge = async (req, res) => {
  const { id } = req.query
  if (!id) return res.status(400).json({ error: 'Missing challenge id' })

  const db = await initDB()

  try {
    const challenge = await db.collection('challenges').findOne({ _id: new ObjectId(id) })
    if (!challenge) return res.status(404).json({ error: 'Challenge not found' })

    // Fetch the first artifact for the challenge
    const firstArtifact = await db.collection('artifacts').findOne({
      _id: new ObjectId(challenge.artifactIds[0])
    })

    res.json({
      challenge: {
        _id: challenge._id.toString(),
        type: challenge.type,
        dateKey: challenge.dateKey,
        artifactIds: challenge.artifactIds,
        rounds: challenge.rounds,
        challengerUsername: challenge.challengerUsername,
        challengerScore: challenge.challengerScore
      },
      artifact: firstArtifact
    })
  } catch (e) {
    res.status(400).json({ error: 'Invalid challenge id' })
  }
}

export default getChallenge
