import { modes } from "@/components/gameui/ModeButton"
import { initDB } from "./mongodb"
import { countriesWithContinents } from "../countries"

// Era buckets for weighted sampling in general modes.
// Weights compensate for the corpus bias toward post-1500 content.
const ERA_BUCKETS = [
  { name: 'Prehistoric',        start: -10000, end: -3000, weight: 6 },
  { name: 'Bronze Age',         start: -3000,  end: -1200, weight: 5 },
  { name: 'Iron Age',           start: -1200,  end: -600,  weight: 5 },
  { name: 'Classical Antiquity',start: -600,   end: 0,     weight: 5 },
  { name: 'Late Antiquity',     start: 0,      end: 500,   weight: 4 },
  { name: 'Middle Ages',        start: 500,    end: 1500,  weight: 2 },
  { name: 'Early Modern',       start: 1500,   end: 1800,  weight: 1 },
  { name: 'Modern',             start: 1800,   end: 2100,  weight: 0.3 },
]

// Quality score thresholds per mode. Artifacts below the threshold are
// excluded. Scores range 0-10, computed by quality-score.js in ag-data.
// 0-1 = sherds/fragments/trash, 2-3 = borderline, 4-5 = good, 6+ = great
const QUALITY_THRESHOLDS = {
  'Classic': 3,
  'Balanced': 3,
  'Highlights': 6,
  'Ea Nasir Mode': 2,     // copper artifacts are niche, don't over-filter
  'Extreme Mode': 0,      // everything, including sherds
  // Era and Continent modes default to 3
  _default: 3,
}

const pickWeighted = (items, weightFn) => {
  const total = items.reduce((s, i) => s + weightFn(i), 0)
  if (total <= 0) return items[Math.floor(Math.random() * items.length)]
  let roll = Math.random() * total
  for (const item of items) {
    roll -= weightFn(item)
    if (roll <= 0) return item
  }
  return items[items.length - 1]
}

export const getRandomArtifact = async mode => {
  const db = await initDB()
  return await getArtifactRecursive(mode, db)
}

const getArtifactRecursive = async (mode, db, attempt = 0) => {
  const modeInfo = modes[mode]

  const criteria = { problematic: { $ne: true } }

  // Quality score filter — exclude low-quality artifacts from normal play
  const minScore = QUALITY_THRESHOLDS[mode] ?? QUALITY_THRESHOLDS._default
  if (minScore > 0) {
    criteria.quality_score = { $gte: minScore }
  }

  if (mode === 'Highlights') criteria.isHighlight = true
  if (mode === 'Balanced') {
    const pickHighlight = Math.random() > 0.5
    if (pickHighlight) criteria.isHighlight = true
  }
  if (modeInfo?.type === 'Era') {
    criteria['time.start'] = { $lte: modeInfo.end }
    criteria['time.end'] = { $gte: modeInfo.start }
  }
  if (mode === 'Ea Nasir Mode') {
    criteria['medium'] = { $regex: /copper/i }
  }

  // Era weighting: for general modes, pick a weighted era bucket first.
  const applyEraWeighting = modeInfo?.type !== 'Era'
    && modeInfo?.type !== 'Continent'
    && attempt < 3
  if (applyEraWeighting) {
    const bucket = pickWeighted(ERA_BUCKETS, b => b.weight)
    criteria['time.start'] = { $lte: bucket.end }
    criteria['time.end'] = { $gte: bucket.start }
  }

  // Country-weighted sampling: pick a country using sqrt-weighted probability.
  if (modeInfo?.type === 'Continent') {
    const continentCountries = countriesWithContinents.filter(c => c.continent === mode).map(c => c.country)
    const randomCountry = continentCountries[Math.floor(Math.random() * continentCountries.length)]
    criteria['location.country'] = randomCountry
  } else {
    const countryCounts = await db.collection('artifacts').aggregate([
      { $match: criteria },
      { $group: { _id: '$location.country', count: { $sum: 1 } } },
    ]).toArray()
    if (countryCounts.length > 0) {
      const picked = pickWeighted(
        countryCounts.map(c => ({ country: c._id, w: Math.sqrt(c.count) })),
        c => c.w
      )
      criteria['location.country'] = picked.country
    }
  }

  const artifact = (await db.collection('artifacts').aggregate([
    { $match: criteria },
    { $sample: { size: 1 } }
  ]).toArray())[0]

  if (!artifact) return await getArtifactRecursive(mode, db, attempt + 1)
  return artifact
}
