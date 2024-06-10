import { initDB } from "@/lib/apiUtils/mongodb"
import { ObjectId } from "mongodb"

const artifact = async (req, res) => {
  const db = await initDB()
  if (req.query.id === 'undefined') return res.send()
  const artifact = await db.collection('artifacts').findOne({ _id: new ObjectId(req.query.id) })
  res.send(artifact)
}

export default artifact