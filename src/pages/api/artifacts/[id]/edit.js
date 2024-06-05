import { initDB } from "@/lib/apiUtils/mongodb"
import { ObjectId } from "mongodb"

const artifact = async (req, res) => {
  const db = await initDB()

  if (req.query.id === 'undefined') return res.send()

  await db.collection('artifacts').updateOne({ _id: new ObjectId(req.query.id) }, { $set: req.body })

  res.send({ success: true })
}

export default artifact