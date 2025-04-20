import { getRandomArtifact } from "@/lib/apiUtils/artifacts";
import { initDB } from "@/lib/apiUtils/mongodb";
import { verifyAuth, withSessionRoute } from "@/lib/apiUtils/session"
import { ObjectId } from "mongodb";

const current = async (req, res) => {
  const v = verifyAuth(req); if (!v) return
  const db = await initDB()

  const user = await db.collection('accounts').findOne({ _id: new ObjectId(v._id) })
  const game = await db.collection('games').findOne({ userId: user._id.toString(), ongoing: true })

  // If an ongoing game does not exist, create a new one
  if (!game) {
    // Fetch the first artifact using the user's preferred mode
    const artifact = await getRandomArtifact(user.currentMode || 'Balanced');
    // Get the user's preferred timer setting (ensure it's stored on the user document)
    // Use null if undefined or explicitly null on the user doc
    const preferredTimer = (user.currentTimer !== undefined && user.currentTimer !== null) ? user.currentTimer : null;

    const newGame = {
      startedAt: new Date(),
      userId: user._id.toString(),
      selectedTimer: preferredTimer, // <-- Add selectedTimer here
      ongoing: true,
      round: 1,
      rounds: 5,
      score: 0,
      mode: user.currentMode || 'Balanced',
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
    const artifactIDs = game.roundData.map(round => new ObjectId(round.artifactId))
    const artifacts = await db.collection('artifacts').find({ _id: { $in: artifactIDs } }).toArray()
    
    game.roundData = game.roundData.map(round => {
      const artifact = artifacts.find(art => art._id.toString() === round.artifactId)
      return { ...round, artifact }
    })

    res.send(game)
  }
}

export default withSessionRoute(current)
