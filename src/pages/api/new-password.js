import sha1 from 'sha1'
import bcrypt from 'bcryptjs'
import { initDB } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export default async function setNewPasswordRoute(req, res) {
  const db = await initDB()
  const { id, token, newPassword } = req.body

  if (sha1(id + process.env.SECRET) !== token) {
    return res.send({ success: false, message: 'Invalid Link. Try resetting the password again.' })
  }

  await db.collection('accounts').updateOne({ _id: new ObjectId(id) }, { $set: {
    password: await bcrypt.hash(newPassword, 10)
  } })
  
  res.send({ success: true })
}