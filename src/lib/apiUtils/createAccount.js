import bcrypt from 'bcryptjs'
import sha1 from 'sha1'
import { sendEmail } from '@/lib/apiUtils/email'
import { initDB } from './mongodb'

/* Type (
  newAccount: {
    email: string
    username: string
    status: Active, Banned
    role: Player, Admin
    password: string
  }, (also account schema, sans createdAt)
  options: {
    confirmEmail: boolean
  }
) returns [id, error] */

export const createAccount = async (newAccount, options) => {
  const db = await initDB()
  const data = newAccount

  const escEmail = data.email?.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const accountWithEmail = escEmail && await db.collection('accounts').findOne({ email: { $regex: new RegExp(`^${escEmail}$`, 'i') } })
  if (accountWithEmail) return [null, 'Account with that email already exists.']

  const escUsername = data.username?.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const accountWithUsername = escUsername && await db.collection('accounts').findOne({ username: { $regex: new RegExp(`^${escUsername}$`, 'i') } })
  if (accountWithUsername) return [null, 'Account with that username already exists.']

  if (data.password) data.password = await bcrypt.hash(data.password, 10)

  const { insertedId } = await db.collection('accounts').insertOne({ ...data, createdAt: new Date() })

  if (options?.confirmEmail) {
    const token = sha1(insertedId + process.env.SECRET)
    const url = `${process.env.DOMAIN}/confirm?user=${insertedId}&token=${token}`

    sendEmail({
      email: data.email,
      subject: 'Please verify your email',
      html: `Click the link to verify your email, or copy and paste it into your browser:

<a href='${url}'>${url}</a>

The Artifact Guesser System`
    })
  }

  return [insertedId, null]
}