import { initDB } from "@/lib/apiUtils/mongodb"
import { verifyAuth, withSessionRoute } from "@/lib/apiUtils/session"

const artifacts = async (req, res) => {
  const v = verifyAuth(req, res); if (!v) return
  const db = await initDB()
  res.send({ data: await db.collection('artifacts').countDocuments() })
}

export default withSessionRoute(artifacts)