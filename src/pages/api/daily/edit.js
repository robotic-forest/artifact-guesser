import { initDB } from "@/lib/apiUtils/mongodb"
import { withSessionRoute } from "@/lib/apiUtils/session"
import { ObjectId } from "mongodb"
import moment from "moment"

/**
 * POST /api/daily/edit
 *
 * Updates a daily game (round guesses, score, completion).
 * Owner is either the session user OR an anonymous client identified
 * by `anonymousId` in the body — the same id that created the doc via
 * /api/daily/current. Mismatched ownership 403s.
 */
const editDailyGame = async (req, res) => {
  const user = req.session?.user
  const db = await initDB()
  const { _id, anonymousId: bodyAnonId, ...data } = req.body

  if (!_id) return res.status(400).json({ error: 'Missing _id' })
  if (!user && !bodyAnonId) {
    return res.status(401).json({ error: 'Auth or anonymousId required' })
  }

  const dailyGame = await db.collection('dailyGames').findOne({ _id: new ObjectId(_id) })
  if (!dailyGame) return res.status(404).json({ error: 'Daily game not found' })

  if (user) {
    if (dailyGame.userId !== user._id) {
      return res.status(403).json({ error: 'Not your game' })
    }
  } else {
    if (!dailyGame.anonymousId || dailyGame.anonymousId !== bodyAnonId) {
      return res.status(403).json({ error: 'Not your game' })
    }
  }

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
