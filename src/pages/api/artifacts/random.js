import { initDB } from "@/lib/apiUtils/mongodb"

// https://stackoverflow.com/questions/2824157/how-can-i-get-a-random-record-from-mongodb

// Get one random document matching {a: 10} from the mycoll collection.
// db.collection('artifacts').aggregate([
//   { $match: { a: 10 } },
//   { $sample: { size: 1 } }
// ])

const randomArtifact = async (req, res) => {
  const db = await initDB()
  const artifact = (await db.collection('artifacts').aggregate([{ $sample: { size: 1 } }]).toArray())[0]

  res.send(artifact)
}

export default randomArtifact