import { initDB } from "@/lib/apiUtils/mongodb"
import { verifyAuth, withSessionRoute } from "@/lib/apiUtils/session"
import moment from "moment";
import { ObjectId } from "mongodb"

async function editGame(req, res) {
  const user = verifyAuth(req, res); if (!user) return
  const db = await initDB()

  const { _id, ...data } = req.body
  if (!_id) throw new Error('You must provide an _id, you scoundrel!')

  const game = await db.collection('games').findOne({ _id: new ObjectId(_id) })
  if (game.userId !== user._id.toString()) return res.send({ success: false, error: 'You do not have permission to update this game' })

  // remove artifact so as not to save it within a game object
  const processedRounds = data.roundData.map(round => {
    const { artifact, ...rest } = round
    return rest
  })

  if (typeof data.startedAt === 'string') data.startedAt = moment(data.startedAt).toDate()

  await db.collection('games').updateOne({ _id: new ObjectId(_id) }, { $set: { ...data, roundData: processedRounds } })
  res.send({ success: true })
}

export default withSessionRoute(editGame)