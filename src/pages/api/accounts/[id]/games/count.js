import { initDB } from "@/lib/apiUtils/mongodb"
import { verifyAuth, withSessionRoute } from "@/lib/apiUtils/session"

const games = async (req, res) => {
  const v = verifyAuth(req, res); if (!v) return
  const db = await initDB()
  const id = req.query.id

  const count = await db.collection('games').countDocuments({ userId: id })
  res.send(count)
}

export default withSessionRoute(games)