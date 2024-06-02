import { initDB } from "@/lib/apiUtils/mongodb"
import { verifyAuth, withSessionRoute } from "@/lib/apiUtils/session"

const stats = async (req, res) => {
  const v = verifyAuth(req, res); if (!v) return
  const db = await initDB()
  res.send(await db.collection('platform').findOne({ name: 'stats' }))
}

export default withSessionRoute(stats)