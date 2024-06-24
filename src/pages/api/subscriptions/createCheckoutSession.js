import s from 'stripe'
import { verifyAuth, withSessionRoute } from "@/lib/apiUtils/session"
const stripe = s(process.env.STRIPE_LIVE_SECRET_KEY) // STRIPE_TEST_SECRET_KEY

const createStripeSession = async (req, res) => {
  const user = verifyAuth(req); if (!user) return

  const { priceId, plan } = req.body

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    line_items: [
      {
        price: priceId,
        quantity: 1,
      }
    ],
    metadata: { plan },
    customer_email: user.email,
    success_url: 'http://localhost:5000/moloch',
    cancel_url: 'http://localhost:5000/moloch',
  })

  res.send({ success: true, sessionUrl: session.url })
}

export default withSessionRoute(createStripeSession)