import { cleanMDB } from "@/lib/apiUtils/misc"
import { initDB } from "@/lib/apiUtils/mongodb"
import { verifyAuth, withSessionRoute } from "@/lib/apiUtils/session"
import { ObjectId } from "mongodb"

async function account(req, res) {
  const user = verifyAuth(req, res)
  if (!user) return
  const db = await initDB()

  if (req.query.id === 'undefined') {
    res.send()
    return
  }

  const account = await db.collection('accounts').findOne({ _id: new ObjectId(req.query.id) })

  res.send(cleanMDB(account))
}

export default withSessionRoute(account)
