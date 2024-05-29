import { initDB } from "@/lib/apiUtils/mongodb";
import { ObjectId } from "mongodb";

const top = async (req, res) => {
  const db = await initDB()
  const dbGames = await db.collection('games').find().sort({ score: -1 }).limit(10).toArray()

  const users = await db.collection('accounts').find({ _id: { $in: dbGames.map(g => new ObjectId(g.userId)) } }).toArray()

  const games = dbGames.map(g => {
    const user = users.find(u => u._id.toString() === g.userId)
    return { ...g, username: user.username }
  })

  res.send(games)
}

export default top