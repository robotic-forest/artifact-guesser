import { initDB } from "@/lib/apiUtils/mongodb"
import { verifyAuth, withSessionRoute } from "@/lib/apiUtils/session"

const newFavorite = async (req, res) => {
  const user = verifyAuth(req); if (!user) return
  const db = await initDB()
  const id = req.body.id

  await db.collection('favorites').insertOne({ artifactId: id, userId: user._id, createdAt: new Date() })

  res.send({ success: true })
}

export default withSessionRoute(newFavorite)