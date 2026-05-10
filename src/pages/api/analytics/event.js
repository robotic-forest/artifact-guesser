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
    dateKey,
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
  let { isBot, reason: botReason } = detectBot(userAgent)

  // Dedup pageviews from the same anonymous ID + path within 30s — defense
  // against client bugs or replayed events.
  if (!isBot && type === 'pageview' && anonymousId && path) {
    const recent = await db.collection('analyticsEvents').findOne(
      {
        type: 'pageview',
        anonymousId,
        path,
        occurredAt: { $gte: new Date(Date.now() - 30 * 1000) },
      },
      { projection: { _id: 1 } },
    )
    if (recent) {
      isBot = true
      botReason = 'duplicate-pageview'
    }
  }

  // Cold-scrape detection: brand-new anon hitting a deep detail URL with
  // no referrer is almost always a UA-spoofing scraper. Real shared links
  // carry a referrer; real navigation has prior pageviews.
  if (!isBot && type === 'pageview' && anonymousId && path && !referrer) {
    const isDeepDetail = /^\/(artifacts|games|multiplayer|challenge)\/[a-f0-9]{8,}/i.test(path)
    if (isDeepDetail) {
      const prior = await db.collection('analyticsEvents').findOne(
        { anonymousId },
        { projection: { _id: 1 } },
      )
      if (!prior) {
        isBot = true
        botReason = 'cold-deep-hit'
      }
    }
  }

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
  if (dateKey) event.dateKey = dateKey

  try {
    await db.collection('analyticsEvents').insertOne(event)
    res.json({ success: true })
  } catch (err) {
    console.error('Failed to record analytics event:', err)
    res.status(500).json({ error: 'Failed to record event' })
  }
}

export default withSessionRoute(recordEvent)
