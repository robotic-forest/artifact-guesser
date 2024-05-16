import { initDB } from "@/lib/mongodb"
import { withSessionRoute } from "@/lib/session"
import { ObjectId } from "mongodb"

export default withSessionRoute(userRoute)

async function userRoute(req, res) {
  if (req.session.user) {
    const db = await initDB()
    const account = await db.collection('accounts').findOne({ _id: new ObjectId(req.session.user._id) })

    if (!account) return res.json({ isLoggedIn: false })

    const { password, ...accountData } = account

    res.json({ ...accountData, isLoggedIn: true })
  } else res.json({ isLoggedIn: false })
}