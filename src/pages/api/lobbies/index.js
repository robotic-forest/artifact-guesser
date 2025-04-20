import { initDB } from "@/lib/apiUtils/mongodb"
import { verifyAuth, withSessionRoute } from "@/lib/apiUtils/session"

const lobbies = async (req, res) => {
  const user = verifyAuth(req, res); if (!user) return
  const db = await initDB()

  const lobbies = await db.collection('lobbies').find().toArray()
  res.send(lobbies)
}

export default withSessionRoute(lobbies)