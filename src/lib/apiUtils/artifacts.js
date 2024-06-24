import { modes } from "@/components/gameui/ModeButton"
import { initDB } from "./mongodb"
import { countriesWithContinents } from "../countries"

// https://stackoverflow.com/questions/2824157/how-can-i-get-a-random-record-from-mongodb

// Get one random document matching {a: 10} from the mycoll collection.
// db.collection('artifacts').aggregate([
//   { $match: { a: 10 } },
//   { $sample: { size: 1 } }
// ]).toArray()

export const getRandomArtifact = async mode => {
  const db = await initDB()
  return await getArtifactRecursive(mode, db)
}

const getArtifactRecursive = async (mode, db) => {
  const modeInfo = modes[mode]

  const criteria = { problematic: { $ne: true } }
  if (mode === 'Highlights') criteria.isHighlight = true
  if (mode === 'Balanced') {
    // 50% chance to pick highlight
    const pickHighlight = Math.random() > 0.5
    if (pickHighlight) criteria.isHighlight = true
  }
  if (modeInfo?.type === 'Continent') {
    const continentCountries = countriesWithContinents.filter(c => c.continent === mode).map(c => c.country)
    const randomCountry = continentCountries[Math.floor(Math.random() * continentCountries.length)]
    criteria['location.country'] = randomCountry
  }
  if (modeInfo?.type === 'Era') {
    criteria['time.start'] = { $lte: modeInfo.end }
    criteria['time.end'] = { $gte: modeInfo.start }
  }

  const artifact = (await db.collection('artifacts').aggregate([
    { $match: criteria },
    { $sample: { size: 1 } }
  ]).toArray())[0]

  if (!artifact) return await getArtifactRecursive(mode, db)
  return artifact
}