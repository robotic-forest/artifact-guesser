import { initDB } from '@/lib/apiUtils/mongodb'
import { generateWings } from '@/lib/apiUtils/world'

/**
 * GET /api/world/wings
 *
 * Corpus feed for the protocodex ziggurat world. Returns wings: facet slices
 * of the corpus with their artifacts. AG decides what's in the corpus and how
 * to sample it fairly; protocodex decides what it looks like and how you move
 * through it, so nothing here describes rooms, geometry, or portals.
 *
 * Query params:
 *   seed     string, makes wing structure reproducible
 *   wings    1-8   how many wings to return          (default 5)
 *   per      1-24  artifacts per wing                (default 8)
 *   quality  0-10  minimum quality_score             (default 3)
 *   filter   JSON  criteria to anchor on. This is portal traversal: hand back
 *                  the query of the wing you walked through.
 *
 * Not CORS-enabled on purpose. Protocodex proxies this server-side through
 * mainframe, which also gives it a cache.
 */

const clamp = (v, lo, hi, dflt) => {
  const n = Number(v)
  return Number.isFinite(n) ? Math.min(hi, Math.max(lo, Math.round(n))) : dflt
}

// The anchor filter comes over the wire, so only let it pin fields we know.
const ALLOWED_FILTER_KEYS = new Set([
  'culture', 'classification', 'medium', 'location.country', 'time.start', 'time.end',
])

const parseFilter = (raw) => {
  if (!raw) return {}
  let parsed
  try {
    parsed = JSON.parse(raw)
  } catch {
    return null
  }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return null
  for (const key of Object.keys(parsed)) {
    if (!ALLOWED_FILTER_KEYS.has(key)) return null
  }
  return parsed
}

const wings = async (req, res) => {
  const filter = parseFilter(req.query.filter)
  if (filter === null) return res.status(400).json({ error: 'Bad filter' })

  try {
    const db = await initDB()
    const result = await generateWings(db, {
      seed: req.query.seed,
      wings: clamp(req.query.wings, 1, 8, 5),
      per: clamp(req.query.per, 1, 24, 8),
      minQuality: clamp(req.query.quality, 0, 10, 3),
      filter,
    })

    res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=3600')
    return res.status(200).json(result)
  } catch (e) {
    console.error('[world/wings]', e)
    return res.status(500).json({ error: 'Generation failed' })
  }
}

export default wings
