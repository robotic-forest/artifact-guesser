import { initDB } from "@/lib/apiUtils/mongodb"
import { verifyAuth, withSessionRoute } from "@/lib/apiUtils/session"

const artifacts = async (req, res) => {
  const v = verifyAuth(req, res); if (!v) return
  const db = await initDB()

  const total = await db.collection('artifacts').countDocuments()
  const problematic = await db.collection('artifacts').countDocuments({ problematic: true })
  res.send({ data: { total, problematic } })
}

export default withSessionRoute(artifacts)