// Wing generation for the protocodex ziggurat world.
//
// AG owns "what's in the corpus, sampled well". Protocodex owns what that
// looks like and how you move through it. So this module returns *wings*
// (a facet slice of the corpus plus the artifacts in it) and never decides
// room counts, geometry, palettes, or portal placement.
//
// The walk is derived, not curated: we pick an anchor artifact using the same
// era/country weighting the game already uses, then read the anchor's own
// field values back out as the axes of the wings around it. No precomputed
// catalog, no allowlist, full 95k-artifact playable pool.

import { ERA_BUCKETS } from './artifacts'
import { isRenderableImageUrl } from './artifactImages'
import { makeRandom, pickWeightedWith, shuffleWith } from './seededRandom'

const DEFAULT_MIN_QUALITY = 3

// A wing needs at least this many matches to be worth building a room from.
const MIN_WING_SIZE = 4

/** Baseline filter: renderable, not junk, not flagged. */
export const baseCriteria = (minQuality = DEFAULT_MIN_QUALITY) => {
  const c = { problematic: { $ne: true } }
  if (minQuality > 0) c.quality_score = { $gte: minQuality }
  return c
}

/**
 * Pick a starting artifact, flattening the corpus's heavy skew toward Peru /
 * Egypt / Japan and toward post-1500 material. Same two mechanisms as
 * getRandomArtifact: weighted era bucket, then sqrt-weighted country.
 */
export const pickAnchor = async (db, { random, minQuality, filter = {}, attempt = 0 }) => {
  const criteria = { ...baseCriteria(minQuality), ...filter }

  // Era weighting fights the corpus's post-1500 pile, but on a narrow filter a
  // randomly chosen era can have no overlap at all and strand the walk. Same
  // escape hatch the game uses: drop the weighting after a couple of tries.
  const applyEraWeighting = attempt < 2 && !filter['time.start'] && !filter['time.end']
  if (applyEraWeighting) {
    const bucket = pickWeightedWith(random, ERA_BUCKETS, (b) => b.weight)
    criteria['time.start'] = { $lte: bucket.end }
    criteria['time.end'] = { $gte: bucket.start }
  }

  if (!filter['location.country']) {
    const counts = await db.collection('artifacts').aggregate([
      { $match: criteria },
      { $group: { _id: '$location.country', count: { $sum: 1 } } },
    ], { allowDiskUse: true }).toArray()
    const picked = pickWeightedWith(
      random,
      counts.filter((c) => c._id),
      (c) => Math.sqrt(c.count)
    )
    if (picked) criteria['location.country'] = picked._id
  }

  const [artifact] = await db.collection('artifacts')
    .aggregate([{ $match: criteria }, { $sample: { size: 1 } }]).toArray()

  if (!artifact && attempt < 3) {
    return pickAnchor(db, { random, minQuality, filter, attempt: attempt + 1 })
  }
  return artifact || null
}

/**
 * The first meaningful token of a free-text medium string.
 * "Clay, Baked" -> clay, "Silk / Compound weave" -> silk,
 * "ink, tempera, and gold on vellum" -> ink.
 * `medium` has ~41k distinct values so exact match is useless; substring
 * matching is what makes it cut across all ten museums at once.
 */
const MEDIUM_STOPWORDS = new Set([
  'and', 'the', 'with', 'over', 'from', 'his', 'her', 'its', 'for', 'not',
  'various', 'other', 'unknown', 'possibly', 'probably', 'made', 'type',
  // Non-answers that would otherwise become a wing called "unidentified".
  'unidentified', 'indeterminate', 'undetermined', 'misc', 'miscellaneous', 'none',
])

// Several adapters shout their period names ("MIDDLE BRONZE AGE II"). Only the
// display label is softened; the query keeps the exact stored value.
const softenLabel = (s) =>
  typeof s === 'string' && s.length > 3 && s === s.toUpperCase() && /[A-Z]{3}/.test(s)
    ? s.replace(/\b[A-Z][A-Z']*\b/g, (w) => w[0] + w.slice(1).toLowerCase())
    : s

const mediumToken = (medium) => {
  if (typeof medium !== 'string') return null
  const first = medium.split(/[,;/(]/)[0].trim().toLowerCase()
  const word = first
    .split(/\s+/)
    .map((w) => w.replace(/[^a-zà-ÿ-]/g, ''))
    .find((w) => w.length >= 3 && !MEDIUM_STOPWORDS.has(w))
  return word || null
}

const eraFor = (start) =>
  typeof start === 'number'
    ? ERA_BUCKETS.find((b) => start >= b.start && start < b.end) || null
    : null

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/**
 * Read the axes of an artifact back out as candidate wing queries. These are
 * the portals: each one is a single-axis mutation of where you currently are.
 */
export const deriveAxes = (artifact) => {
  if (!artifact) return []
  const axes = []

  if (artifact.culture) {
    axes.push({ axis: 'culture', value: artifact.culture, label: softenLabel(artifact.culture),
                query: { culture: artifact.culture } })
  }
  if (artifact.classification) {
    axes.push({ axis: 'form', value: artifact.classification, label: softenLabel(artifact.classification),
                query: { classification: artifact.classification } })
  }
  const token = mediumToken(artifact.medium)
  if (token) {
    axes.push({ axis: 'material', value: token, label: token,
                query: { medium: { $regex: escapeRegex(token), $options: 'i' } } })
  }
  if (artifact.location?.country) {
    axes.push({ axis: 'place', value: artifact.location.country, label: artifact.location.country,
                query: { 'location.country': artifact.location.country } })
  }
  const era = eraFor(artifact.time?.start)
  if (era) {
    axes.push({ axis: 'era', value: era.name, label: era.name,
                query: { 'time.start': { $lte: era.end }, 'time.end': { $gte: era.start } } })
  }

  // `culture` frequently just repeats the country ("India", "Japan", "China"),
  // which would put two portals with the same name in the same ziggurat.
  // First occurrence wins, so the order above is the precedence order.
  const seen = new Set()
  return axes.filter((a) => {
    const k = String(a.value).trim().toLowerCase()
    if (seen.has(k)) return false
    seen.add(k)
    return true
  })
}

/** Trim an artifact down to what a wall exhibit actually needs. */
export const toExhibit = (a) => {
  const images = (a.images?.external || []).filter(isRenderableImageUrl)
  const thumb = isRenderableImageUrl(a.images?.thumbnail) ? a.images.thumbnail : images[0] || null
  return {
    id: String(a._id),
    name: a.name || 'Untitled',
    image: thumb,
    images,
    country: a.location?.country || null,
    culture: a.culture || null,
    classification: a.classification || null,
    medium: a.medium || null,
    materialToken: mediumToken(a.medium),
    start: a.time?.start ?? null,
    end: a.time?.end ?? null,
    era: eraFor(a.time?.start)?.name || null,
    dateText: a.time?.description || null,
    quality: a.quality_score ?? null,
    source: { name: a.source?.name || null, url: a.source?.url || null },
    href: `https://artifactguesser.com/artifacts/${a._id}`,
  }
}

/** Fetch the artifacts for one wing. Returns null if the wing is too thin. */
const buildWing = async (db, axis, { per, minQuality }) => {
  const criteria = { ...baseCriteria(minQuality), ...axis.query }
  const docs = await db.collection('artifacts').aggregate([
    { $match: criteria },
    { $sample: { size: per } },
  ], { allowDiskUse: true }).toArray()

  const exhibits = docs.map(toExhibit).filter((e) => e.image)
  if (exhibits.length < Math.min(MIN_WING_SIZE, per)) return null

  return {
    axis: axis.axis,
    value: axis.value,
    label: axis.label,
    query: axis.query,
    artifacts: exhibits,
  }
}

/**
 * Generate the wings for one ziggurat.
 *
 * @param filter  optional criteria to anchor on (this is how portal traversal
 *                works: protocodex hands back the query of the wing you walked
 *                through, and gets the next ziggurat anchored there)
 */
export const generateWings = async (db, {
  seed,
  wings = 5,
  per = 8,
  minQuality = DEFAULT_MIN_QUALITY,
  filter = {},
  drift = true,
} = {}) => {
  const random = makeRandom(seed)

  const anchor = await pickAnchor(db, { random, minQuality, filter })
  if (!anchor) return { seed, anchor: null, wings: [] }

  // The anchor's own axes, minus anything the caller already pinned.
  const pinned = new Set(Object.keys(filter))
  const candidates = shuffleWith(random, deriveAxes(anchor))
    .filter((a) => !Object.keys(a.query).every((k) => pinned.has(k)))

  const built = []
  for (const axis of candidates) {
    if (built.length >= wings) break
    const wing = await buildWing(db, axis, { per, minQuality })
    if (wing) built.push(wing)
  }

  // The drift exit.
  //
  // Every axis of an anchor points back into the anchor's own neighbourhood,
  // so a walk through a dense cluster (Peru is 20% of the corpus) can spend
  // hop after hop in the same material culture. One wing per ziggurat is
  // therefore derived from an *independently sampled* anchor: the room itself
  // is still a coherent facet slice, it just has nothing to do with where you
  // currently are. That guarantees the walk can always leave.
  if (drift) {
    const stranger = await pickAnchor(db, { random, minQuality, filter: {} })
    const taken = new Set(built.map((w) => String(w.value).trim().toLowerCase()))
    const strangerAxes = stranger
      ? shuffleWith(random, deriveAxes(stranger))
          .filter((a) => !taken.has(String(a.value).trim().toLowerCase()))
      : []
    for (const axis of strangerAxes) {
      const wing = await buildWing(db, axis, { per, minQuality })
      if (wing) { built.push({ ...wing, drift: true }); break }
    }
  }

  return {
    seed: seed ?? null,
    anchor: toExhibit(anchor),
    wings: built,
  }
}
