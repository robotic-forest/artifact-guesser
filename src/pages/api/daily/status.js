import { initDB } from "@/lib/apiUtils/mongodb"
import { withSessionRoute } from "@/lib/apiUtils/session"

/**
 * GET /api/daily/status
 *
 * Lightweight, side-effect-free check of whether the current player has
 * already started/completed today's daily run. Used to hide the "Play Today's
 * Run" CTA in the normal game once today's run is done.
 *
 * Keyed by userId (logged in) or anonymousId (query param) — the same keys the
 * daily game uses. Unlike /api/daily/current it does NOT create a dailyGame
 * doc or probe images, so it's cheap and harmless to call from a banner.
 */
const dailyStatus = async (req, res) => {
  const db = await initDB()
  const user = req.session?.user

  const dateKey = new Date().toISOString().slice(0, 10) // UTC, matches daily/current

  const anonymousId = !user ? (req.query?.anonymousId || null) : null
  const playerQuery = user
    ? { userId: user._id, dateKey }
    : (anonymousId ? { anonymousId, dateKey } : null)

  if (!playerQuery) {
    return res.json({ started: false, completed: false, score: null })
  }

  const dailyGame = await db.collection('dailyGames').findOne(playerQuery, {
    projection: { completed: 1, score: 1 },
  })

  return res.json({
    started: !!dailyGame,
    completed: !!dailyGame?.completed,
    score: dailyGame?.score ?? null,
  })
}

export default withSessionRoute(dailyStatus)
