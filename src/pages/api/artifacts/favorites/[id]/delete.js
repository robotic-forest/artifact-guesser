import { initDB } from "@/lib/apiUtils/mongodb"
import { verifyAuth, withSessionRoute } from "@/lib/apiUtils/session"

const deleteFavorite = async (req, res) => {
  const user = verifyAuth(req); if (!user) return
  const db = await initDB()
  const id = req.query.id

  await db.collection('favorites').deleteOne({ artifactId: id, userId: user._id })
  res.send({ success: true })
}

export default withSessionRoute(deleteFavorite)