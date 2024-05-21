import { getRandomArtifact } from "@/lib/apiUtils/artifacts";
import { initDB } from "@/lib/apiUtils/mongodb";
import { verifyAuth, withSessionRoute } from "@/lib/apiUtils/session"
import { ObjectId } from "mongodb";

const current = async (req, res) => {
  const user = verifyAuth(req); if (!user) return
  const db = await initDB()

  const game = await db.collection('games').findOne({ userId: user._id.toString(), ongoing: true })

  // If an ongoing game does not exist, create a new one
  if (!game) {
    const artifact = await getRandomArtifact()

    const newGame = {
      startedAt: new Date(),
      userId: user._id.toString(),
      ongoing: true,
      round: 1,
      rounds: 5,
      score: 0,
      mode: 'Classic',
      roundData: [
        {
          round: 1,
          artifactId: artifact._id.toString(),
          guessed: false
        }
      ]
    }

    const { insertedId } = await db.collection('games').insertOne(newGame)

    newGame.roundData[0].artifact = artifact

    res.send({ ...newGame, _id: insertedId })
  } else {
    const artifact = await db.collection('artifacts').findOne({ _id: new ObjectId(game.roundData[game.round - 1].artifactId) })
    game.roundData[game.round - 1].artifact = artifact
    res.send(game)
  }
}

export default withSessionRoute(current)