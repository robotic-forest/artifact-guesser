import { initDB } from "@/lib/apiUtils/mongodb"
import { verifyAuth, withSessionRoute } from "@/lib/apiUtils/session"

/**
 * GET /api/admin/artifacts/browse
 *
 * Admin-only visual QA endpoint for the quality-score browser.
 * Returns a random sample of artifacts in a given quality bucket so the
 * curator can eyeball what each score range actually looks like.
 *
 * Query params:
 *   scores  comma list of exact quality_score values to include (e.g. "0,1").
 *           Omit for all scores.
 *   source  optional exact source.name match (e.g. "Metropolitan Museum...")
 *   size    batch size (default 48, capped at 100)
 *
 * Randomness comes from $sample on every request, so the client just
 * re-fetches (or hits "shuffle") to see a different set. No cursor/seed —
 * the client de-dupes by _id across batches.
 */
const handler = async (req, res) => {
  const user = verifyAuth(req, res, ['Admin'])
  if (!user) return

  const db = await initDB()

  const size = Math.min(parseInt(req.query.size) || 48, 100)

  const match = {}
  if (req.query.scores) {
    const scores = String(req.query.scores)
      .split(',')
      .map(s => parseInt(s))
      .filter(s => !Number.isNaN(s))
    if (scores.length) match.quality_score = { $in: scores }
  }
  if (req.query.source) match['source.name'] = req.query.source

  try {
    const artifacts = await db.collection('artifacts').aggregate([
      { $match: match },
      { $sample: { size } },
      { $project: {
        name: 1,
        quality_score: 1,
        classification: 1,
        culture: 1,
        'time.start': 1,
        'time.end': 1,
        'time.description': 1,
        'location.country': 1,
        'source.name': 1,
        'source.url': 1,
        'images.thumbnail': 1,
        'images.external': 1,
      }},
    ]).toArray()

    res.json({ artifacts })
  } catch (err) {
    console.error('admin/artifacts/browse error:', err)
    res.status(500).json({ error: 'Failed to load artifacts' })
  }
}

export default withSessionRoute(handler)
