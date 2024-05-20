import { initDB } from "./mongodb"

// https://stackoverflow.com/questions/2824157/how-can-i-get-a-random-record-from-mongodb

// Get one random document matching {a: 10} from the mycoll collection.
// db.collection('artifacts').aggregate([
//   { $match: { a: 10 } },
//   { $sample: { size: 1 } }
// ]).toArray()

export const getRandomArtifact = async () => {
  const db = await initDB()
  const artifact = (await db.collection('artifacts').aggregate([{ $sample: { size: 1 } }]).toArray())[0]

  return artifact
}