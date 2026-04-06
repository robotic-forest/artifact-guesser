import { modes } from "@/components/gameui/ModeButton"
import { initDB } from "./mongodb"
import { countriesWithContinents } from "../countries"

export const getRandomArtifact = async mode => {
  const db = await initDB()
  return await getArtifactRecursive(mode, db)
}

const getArtifactRecursive = async (mode, db) => {
  const modeInfo = modes[mode]

  const criteria = { problematic: { $ne: true } }
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

  // Country-weighted sampling: pick a country using sqrt-weighted probability,
  // then a random artifact from that country. Sqrt weighting prevents dominant
  // countries (Egypt 84% of Bronze Age) from overwhelming the game, while
  // still giving larger collections more weight than tiny ones.
  // Continent mode already picks a country — skip the extra step for it.
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
      const weights = countryCounts.map(c => ({ country: c._id, w: Math.sqrt(c.count) }))
      const totalWeight = weights.reduce((s, c) => s + c.w, 0)
      let roll = Math.random() * totalWeight
      let picked = weights[0].country
      for (const { country, w } of weights) {
        roll -= w
        if (roll <= 0) { picked = country; break }
      }
      criteria['location.country'] = picked
    }
  }

  const artifact = (await db.collection('artifacts').aggregate([
    { $match: criteria },
    { $sample: { size: 1 } }
  ]).toArray())[0]

  if (!artifact) return await getArtifactRecursive(mode, db)
  return artifact
}
