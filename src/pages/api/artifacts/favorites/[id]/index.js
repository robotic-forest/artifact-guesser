import { initDB } from "@/lib/apiUtils/mongodb"
import { verifyAuth, withSessionRoute } from "@/lib/apiUtils/session"

const favorite = async (req, res) => {
  const user = verifyAuth(req); if (!user) return
  const db = await initDB()
  const id = req.query.id

  const favorite = await db.collection('favorites').findOne({ artifactId: id, userId: user._id })

  res.send(!!favorite)
}

export default withSessionRoute(favorite)