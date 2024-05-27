import { initDB } from "@/lib/apiUtils/mongodb"
import { ObjectId } from "mongodb"

const game = async (req, res) => {
  const db = await initDB()

  if (req.query.id === 'undefined') return res.send()

  const game = await db.collection('games').findOne({ _id: new ObjectId(req.query.id) })

  const artifactIDs = game.roundData.map(round => new ObjectId(round.artifactId))
  const artifacts = await db.collection('artifacts').find({ _id: { $in: artifactIDs } }).toArray()
  
  game.roundData = game.roundData.map(round => {
    const artifact = artifacts.find(art => art._id.toString() === round.artifactId)
    return { ...round, artifact }
  })

  res.send(game)
}

export default game