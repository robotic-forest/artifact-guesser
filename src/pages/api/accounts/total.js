import { initDB } from "@/lib/apiUtils/mongodb"
import { verifyAuth, withSessionRoute } from "@/lib/apiUtils/session"

const accounts = async (req, res) => {
  const v = verifyAuth(req, res); if (!v) return
  const db = await initDB()
  res.send(await db.collection('accounts').countDocuments())
}

export default withSessionRoute(accounts)