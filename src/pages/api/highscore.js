import { initDB } from "@/lib/apiUtils/mongodb";
import { withSessionRoute } from "@/lib/apiUtils/session"

const highscore = async (req, res) => {
  const user = req.session.user
  if (!user) return res.send(false)
  const db = await initDB()

  const games = await db.collection('games').find({ userId: user._id.toString() }).sort({ score: -1 }).limit(1).toArray()
  const game = games[0]

  res.send({ highscore: game?.score || 0, gameId: game?._id })
}

export default withSessionRoute(highscore)