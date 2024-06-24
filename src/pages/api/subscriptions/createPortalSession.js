import s from 'stripe'
import { verifyAuth, withSessionRoute } from "@/lib/apiUtils/session"
import { ObjectId } from 'mongodb';
import { initDB } from '@/lib/apiUtils/mongodb';
const stripe = s(process.env.STRIPE_LIVE_SECRET_KEY) // STRIPE_TEST_SECRET_KEY

const createPortalSession = async (req, res) => {
  const u = verifyAuth(req); if (!u) return
  const db = await initDB()

  const user = await db.collection('accounts').findOne({ _id: new ObjectId(u._id) })

  const returnUrl = `${process.env.DOMAIN}/moloch`
  const customerId = user?.subscription?.customerId

  if (!customerId) return res.send({ success: false, error: 'No customer ID found' })

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl
  })

  res.send({ success: true, portalUrl: portalSession.url })
}

export default withSessionRoute(createPortalSession)