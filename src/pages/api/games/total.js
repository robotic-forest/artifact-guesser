import { initDB } from "@/lib/apiUtils/mongodb"
import { verifyAuth, withSessionRoute } from "@/lib/apiUtils/session"

const games = async (req, res) => {
  const v = verifyAuth(req, res); if (!v) return
  const db = await initDB()
  res.send({ data: await db.collection('games').countDocuments() })
}

export default withSessionRoute(games)