import { initDB } from "@/lib/apiUtils/mongodb"
import { verifyAuth, withSessionRoute } from "@/lib/apiUtils/session"

const games = async (req, res) => {
  const v = verifyAuth(req, res); if (!v) return
  const db = await initDB()

  const multi = await db.collection('games').count({ gameType: 'multiplayer' })
  const single = await db.collection('games').count({gameType: { $ne: 'multiplayer' } })

  res.send({
    data: {
      total: multi + single,
      singlePlayerGames: single,
      multiplayerGames: multi,
    },
  })
}

export default withSessionRoute(games)