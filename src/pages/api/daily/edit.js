import { initDB } from "@/lib/apiUtils/mongodb"
import { verifyAuth, withSessionRoute } from "@/lib/apiUtils/session"
import { ObjectId } from "mongodb"
import moment from "moment"

/**
 * POST /api/daily/edit
 *
 * Updates a logged-in user's daily game (round guesses, score, completion).
 */
const editDailyGame = async (req, res) => {
  const user = verifyAuth(req, res)
  if (!user) return

  const db = await initDB()
  const { _id, ...data } = req.body

  if (!_id) return res.status(400).json({ error: 'Missing _id' })

  const dailyGame = await db.collection('dailyGames').findOne({ _id: new ObjectId(_id) })
  if (!dailyGame) return res.status(404).json({ error: 'Daily game not found' })
  if (dailyGame.userId !== user._id) {
    return res.status(403).json({ error: 'Not your game' })
  }

  // Strip artifact objects from roundData before saving
  const processedRounds = data.roundData.map(round => {
    const { artifact, ...rest } = round
    return rest
  })

  if (typeof data.startedAt === 'string') data.startedAt = moment(data.startedAt).toDate()

  await db.collection('dailyGames').updateOne(
    { _id: new ObjectId(_id) },
    { $set: { ...data, roundData: processedRounds } }
  )

  res.json({ success: true })
}

export default withSessionRoute(editDailyGame)
