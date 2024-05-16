import sha1 from 'sha1'
import { initDB } from '@/lib/mongodb'
import { sendEmail } from '@/lib/apiUtils/email'

export default async function resetPasswordEmailRoute(req, res) {
  const db = await initDB()

  const { email } = req.body
  const user = await db.collection('accounts').findOne({ email: { $regex: new RegExp(`^${email}$`, 'i') } })
  
  if (!user) {
    res.send({
      success: false,
      message: 'The email or password you entered does not exist in this system.'
    })
    return
  }

  const token = sha1(user._id + process.env.SECRET)
  const domain = process.env.DOMAIN
  const url = `${domain}/auth?user=${user._id}&token=${token}`

  sendEmail({
    email: user.email,
    subject: 'Set new password',
    html: `Click the link to set a new password, or copy and paste it into your browser:

    <a href='${url}'>${url}</a>
    
    If you did not click 'Forgot password?', then ignore this message.

    The Ur Context System
  `
  })

  res.send({ success: true })
}