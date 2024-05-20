import { initDB } from "@/lib/apiUtils/mongodb";
import { verifyAuth, withSessionRoute } from "@/lib/apiUtils/session"
import { ObjectId } from "mongodb";

const current = async (req, res) => {
  const user = verifyAuth(req); if (!user) return
  const db = await initDB()

  const game = await db.collection('games').findOne({ userId: ObjectId.toString(user._id), ongoing: true })

  // If an ongoing game does not exist, create a new one
  if (!game) {
    const newGame = {
      userId: ObjectId.toString(user._id),
      ongoing: true,
      round: 1,
      rounds: 5,
      score: 0,
      mode: 'classic'
    }

    const { insertedId } = await db.collection('games').insertOne(newGame)

    res.send({ ...newGame, _id: insertedId })
  } else {
    res.send(game)
  }
}

export default withSessionRoute(current)