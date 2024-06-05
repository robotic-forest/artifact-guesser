import { initDB } from "./mongodb"

// https://stackoverflow.com/questions/2824157/how-can-i-get-a-random-record-from-mongodb

// Get one random document matching {a: 10} from the mycoll collection.
// db.collection('artifacts').aggregate([
//   { $match: { a: 10 } },
//   { $sample: { size: 1 } }
// ]).toArray()

export const getRandomArtifact = async mode => {
  const db = await initDB()

  const criteria = {
    problematic: { $ne: true }
  }
  if (mode === 'Highlights') criteria.isHighlight = true
  if (mode === 'Balanced') {
    // 50% chance to pick highlight
    const pickHighlight = Math.random() > 0.5
    if (pickHighlight) criteria.isHighlight = true
  }

  const artifact = (await db.collection('artifacts').aggregate([
    { $match: criteria },
    { $sample: { size: 1 } }
  ]).toArray())[0]

  return artifact
}