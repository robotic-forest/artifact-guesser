import { initDB } from "@/lib/apiUtils/mongodb";
import { verifyAuth, withSessionRoute } from "@/lib/apiUtils/session"

const createArtifact = async (req, res) => {
  const v = verifyAuth(req, res); if (!v) return
  const db = await initDB()
  
  const exists = await db.collection('artifacts').findOne({ 'source.id': req.body.source.id })
  if (exists) return res.send({ success: false, message: 'Artifact already exists' })

  await db.collection('artifacts').insertOne({ ...req.body, createdAt: new Date() })
  res.send({ success: true })
}

export default withSessionRoute(createArtifact)