import { initDB } from "@/lib/apiUtils/mongodb"
import { verifyAuth, withSessionRoute } from "@/lib/apiUtils/session"
import { ObjectId } from "mongodb"

export default withSessionRoute(deleteAccount)

async function deleteAccount(req, res) {
  const v = verifyAuth(req, res); if (!v) return
  const db = await initDB()

  await db.collection('accounts').deleteOne({ _id: new ObjectId(req.body._id) })
  
  res.send({ success: true })
}