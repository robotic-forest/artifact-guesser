import { initDB } from "@/lib/apiUtils/mongodb"
import { withSessionRoute } from "@/lib/apiUtils/session"
import { detectBot } from "@/lib/apiUtils/botDetection"

/**
 * POST /api/analytics/event
 *
 * Records an analytics event. Accepts both authenticated and anonymous events.
 *
 * Body: {
 *   type: string (required) — event type
 *   path: string — current page path
 *   referrer: string — document.referrer
 *   utmSource: string
 *   utmMedium: string
 *   utmCampaign: string
 *   sessionId: string — client-generated session ID
 *   anonymousId: string — persistent anonymous ID
 *   // Gameplay-specific:
 *   gameId: string
 *   runType: string — 'personal' | 'daily' | 'challenge' | 'multiplayer'
 *   round: number
 *   score: number
 *   completed: boolean
 *   challengeId: string
 *   creatorTag: string
 * }
 */
const recordEvent = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const db = await initDB()
  const user = req.session?.user

  const {
    type,
    path,
    referrer,
    utmSource,
    utmMedium,
    utmCampaign,
    sessionId,
    anonymousId,
    // Gameplay fields
    gameId,
    runType,
    round,
    score,
    completed,
    challengeId,
    creatorTag,
    // Extra metadata
    ...extra
  } = req.body

  if (!type) {
    return res.status(400).json({ error: 'Event type is required' })
  }

  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim()
    || req.headers['x-real-ip']
    || req.socket?.remoteAddress
    || null

  const userAgent = req.headers['user-agent'] || null
  const { isBot, reason: botReason } = detectBot(userAgent)

  const event = {
    type,
    occurredAt: new Date(),
    source: 'internal',
    path: path || null,
    referrer: referrer || null,
    anonymousId: anonymousId || null,
    sessionId: sessionId || null,
    userId: user?._id || null,
    ip,
    userAgent,
    isBot,
    botReason: botReason || null,
    utmSource: utmSource || null,
    utmMedium: utmMedium || null,
    utmCampaign: utmCampaign || null,
  }

  // Add gameplay fields only if present
  if (gameId) event.gameId = gameId
  if (runType) event.runType = runType
  if (round !== undefined) event.round = round
  if (score !== undefined) event.score = score
  if (completed !== undefined) event.completed = completed
  if (challengeId) event.challengeId = challengeId
  if (creatorTag) event.creatorTag = creatorTag

  try {
    await db.collection('analyticsEvents').insertOne(event)
    res.json({ success: true })
  } catch (err) {
    console.error('Failed to record analytics event:', err)
    res.status(500).json({ error: 'Failed to record event' })
  }
}

export default withSessionRoute(recordEvent)
