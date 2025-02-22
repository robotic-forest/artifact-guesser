import { sendEmail } from "@/lib/apiUtils/email"
import { initDB } from "@/lib/apiUtils/mongodb"
import { verifyAuth, withSessionRoute } from "@/lib/apiUtils/session"

async function accountEmail(req, res) {
  const user = verifyAuth(req, res)
  if (!user) return
  if (user.role !== 'Admin') return res.send({ success: false, message: 'You do not have permission to send emails.' })

  const db = await initDB()
  const accounts = await db.collection('accounts').find().toArray()

  accounts.forEach(a => {
    if (req.body.test && a.username !== 'protocodex') return

    sendEmail({
      email: a.email,
      subject: req.body.subject,
      html: renderHtml(req.body.message, a.username),
      noBcc: true,
      from: {
        Email: 'sam@protocodex.com',
        Name: "Artifact Guesser"
      }
    })
  })

  res.send({ success: true })
}

const renderHtml = (message, username) => `Hi ${username},
 
${message}

Cheers, Technomoloch
Artifact Guesser Founder and Dev`

export default withSessionRoute(accountEmail)