import sha1 from 'sha1'
import { ObjectId } from 'mongodb'
import { initDB } from "@/lib/apiUtils/mongodb"

export default async function confirmEmail(req, res) {
  const db = await initDB()
  const { id, token } = req.body

  if (sha1(id + process.env.SECRET) !== token) {
    res.send({ success: false, message: 'Invalid Link.' })
  }

  await db.collection('accounts').updateOne(
    { _id: new ObjectId(id) },
    { $set: { emailConfirmed: true } }
  )
  
  res.send({ success: true })
}