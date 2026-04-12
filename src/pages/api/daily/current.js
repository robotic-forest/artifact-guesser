import { initDB } from "@/lib/apiUtils/mongodb"
import { withSessionRoute } from "@/lib/apiUtils/session"
import { ObjectId } from "mongodb"
import axios from "axios"
import { stripUnrenderableImages } from "@/lib/apiUtils/artifactImages"

/**
 * HEAD-probes an image URL to check if it's reachable.
 * Returns true if the response is 2xx, false otherwise.
 */
const isImageReachable = async (url) => {
  try {
    const res = await axios.head(url, { timeout: 5000, validateStatus: () => true })
    return res.status >= 200 && res.status < 400
  } catch {
    return false
  }
}

/**
 * Validates that an artifact has at least one reachable, renderable image.
 * Mutates artifact.images.external to drop unrenderable formats.
 */
const artifactHasValidImage = async (artifact) => {
  stripUnrenderableImages(artifact)
  const renderable = artifact?.images?.external || []
  if (renderable.length === 0) return false

  const results = await Promise.all(renderable.slice(0, 5).map(isImageReachable))
  return results.some(Boolean)
}

/**
 * Extracts the source domain from an artifact's first image URL.
 */
const getSourceDomain = (artifact) => {
  const url = artifact?.images?.external?.[0]
  if (!url) return null
  try { return new URL(url).hostname } catch { return null }
}

/**
 * Picks N unique artifacts that each have at least one reachable image.
 * - Highlights are strongly favored (~70% chance per pick) but non-highlights
 *   are included to keep the pool large enough to avoid repeats.
 * - Source-aware: avoids picking multiple artifacts from the same museum/domain
 *   to ensure visual variety in each daily run.
 * - Marks any broken artifact as `problematic: true` so it won't be picked again.
 */
const HIGHLIGHT_PROBABILITY = 0.7

const pickValidatedArtifacts = async (db, count) => {
  const picked = []
  const triedIds = new Set()
  const usedDomains = new Set()
  const maxAttempts = count * 10

  for (let attempt = 0; attempt < maxAttempts && picked.length < count; attempt++) {
    const excludeIds = [...triedIds, ...picked.map(p => p._id)].map(id =>
      typeof id === 'string' ? new ObjectId(id) : id
    )

    // Weighted coin: prefer highlights but allow non-highlights
    const useHighlight = Math.random() < HIGHLIGHT_PROBABILITY

    const criteria = {
      problematic: { $ne: true },
      _id: { $nin: excludeIds }
    }
    if (useHighlight) criteria.isHighlight = true

    const [candidate] = await db.collection('artifacts').aggregate([
      { $match: criteria },
      { $sample: { size: 1 } }
    ]).toArray()

    if (!candidate) continue
    triedIds.add(candidate._id.toString())

    // Source diversity: skip if we already have an artifact from this domain
    // (relax this constraint after several failed attempts to avoid deadlocks)
    const domain = getSourceDomain(candidate)
    if (domain && usedDomains.has(domain) && attempt < maxAttempts - count) {
      continue
    }

    if (await artifactHasValidImage(candidate)) {
      picked.push(candidate)
      if (domain) usedDomains.add(domain)
    } else {
      console.warn(`[daily] Marking artifact ${candidate._id} as problematic: broken images`)
      await db.collection('artifacts').updateOne(
        { _id: candidate._id },
        { $set: { problematic: true, problem: 'daily: all images unreachable' } }
      )
    }
  }

  return picked
}

/**
 * GET /api/daily/current
 *
 * Returns today's daily challenge. If none exists yet for today, creates one
 * by selecting 3 highlight artifacts. The same 3 artifacts are served to
 * every player for the entire day (UTC).
 *
 * If the user is logged in and has already started/completed today's daily,
 * returns their personal daily game state. Otherwise returns a fresh game
 * object for them to start.
 */
const dailyCurrent = async (req, res) => {
  const db = await initDB()
  const user = req.session?.user

  // Get today's date key (UTC)
  const today = new Date()
  const dateKey = today.toISOString().slice(0, 10) // "2026-04-10"

  // Find or create today's daily challenge definition
  let daily = await db.collection('dailyChallenges').findOne({ dateKey })

  if (!daily) {
    // Select 3 highlight artifacts, validating that each has at least one
    // reachable image. Broken artifacts get marked problematic and skipped.
    const artifacts = await pickValidatedArtifacts(db, 3)

    if (artifacts.length < 3) {
      return res.status(500).json({ error: 'Not enough valid highlight artifacts available' })
    }

    daily = {
      dateKey,
      createdAt: new Date(),
      artifactIds: artifacts.map(a => a._id.toString()),
      rounds: 3
    }

    await db.collection('dailyChallenges').insertOne(daily)
  }

  // If user is logged in, find or create their daily game
  if (user) {
    let dailyGame = await db.collection('dailyGames').findOne({
      userId: user._id,
      dateKey
    })

    if (!dailyGame) {
      // Create a new daily game for this user
      const firstArtifact = await db.collection('artifacts').findOne({
        _id: new ObjectId(daily.artifactIds[0])
      })

      dailyGame = {
        userId: user._id,
        dateKey,
        dailyChallengeId: daily._id.toString(),
        startedAt: new Date(),
        round: 1,
        rounds: 3,
        score: 0,
        completed: false,
        roundData: [
          {
            round: 1,
            artifactId: daily.artifactIds[0],
            guessed: false
          }
        ]
      }

      const { insertedId } = await db.collection('dailyGames').insertOne(dailyGame)
      dailyGame._id = insertedId

      // Hydrate the first artifact
      dailyGame.roundData[0].artifact = stripUnrenderableImages(firstArtifact)
    } else {
      // Hydrate artifacts for existing rounds
      const artifactIds = dailyGame.roundData.map(r => new ObjectId(r.artifactId))
      const artifacts = await db.collection('artifacts').find({ _id: { $in: artifactIds } }).toArray()

      dailyGame.roundData = dailyGame.roundData.map(round => {
        const artifact = artifacts.find(a => a._id.toString() === round.artifactId)
        return { ...round, artifact: stripUnrenderableImages(artifact) }
      })
    }

    return res.json({
      daily: {
        dateKey: daily.dateKey,
        rounds: daily.rounds,
        artifactIds: daily.artifactIds
      },
      game: dailyGame
    })
  }

  // Not logged in — return the daily challenge info with the first artifact
  // so they can play without an account (stored in localStorage on client)
  const firstArtifact = await db.collection('artifacts').findOne({
    _id: new ObjectId(daily.artifactIds[0])
  })

  return res.json({
    daily: {
      dateKey: daily.dateKey,
      rounds: daily.rounds,
      artifactIds: daily.artifactIds
    },
    artifact: stripUnrenderableImages(firstArtifact)
  })
}

export default withSessionRoute(dailyCurrent)
