import { initDB } from "@/lib/apiUtils/mongodb"
import { verifyAuth, withSessionRoute } from "@/lib/apiUtils/session"
import { ObjectId } from "mongodb"

async function editAccount(req, res) {
  const v = verifyAuth(req, res); if (!v) return
  const db = await initDB()

  const { _id, ...data } = req.body
  if (!_id) throw new Error('You must provide an _id, you scoundrel!')

  await db.collection('accounts').updateOne(
    { _id: new ObjectId(_id) },
    { $set: data }
  )
  
  res.send({ success: true, _id })
}

export default withSessionRoute(editAccount)