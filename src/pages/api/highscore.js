import { initDB } from "@/lib/apiUtils/mongodb";
import { withSessionRoute } from "@/lib/apiUtils/session"

const highscore = async (req, res) => {
  const user = req.session.user
  if (!user) return res.send(false)
  const db = await initDB()

  const games = await db.collection('games').find({ userId: user._id.toString() }).sort({ score: -1 }).limit(2).toArray()
  const highScore = games[0]
  const prevHighscore = games[1]

  res.send({
    highscore: highScore?.score || 0,
    prevHighscore: prevHighscore?.score || 0,
    gameId: highScore?._id
  })
}

export default withSessionRoute(highscore)