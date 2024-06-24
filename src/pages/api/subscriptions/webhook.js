import { sendEmail } from '@/lib/apiUtils/email'
import { initDB } from '@/lib/apiUtils/mongodb'
import s from 'stripe'
const stripe = s(process.env.STRIPE_LIVE_SECRET_KEY) // STRIPE_TEST_SECRET_KEY

const webhook = async (req, res) => {
  const db = await initDB()

  const data = req.body.data
  const eventType = req.body.type

  const customerId = data.object.customer
  const customerEmail = data.object.customer_email

  switch (eventType) {
    case 'checkout.session.completed':
      // Payment is successful and the subscription is created.
      // You should provision the subscription and save the customer ID to your database.

      const { plan } = data.object.metadata

      console.log(`🔔 New ${plan} subscription created for ${customerEmail}`)
      await db.collection('accounts').updateOne({ email: customerEmail }, { $set: {
        'subscription.customerId': customerId,
        'subscription.plan': plan
      } })

      break
    case 'invoice.paid':
      // Continue to provision the subscription as payments continue to be made.
      // Store the status in your database and check when a user accesses your service.
      // This approach helps you avoid hitting rate limits.

      const subscription = await stripe.subscriptions.retrieve(data.object.subscription)
      const periodEnd = subscription.current_period_end

      console.log(`🔔 Payment for ${customerEmail} successful. Subscription period end: ${new Date(periodEnd * 1000)}`)
      await db.collection('accounts').updateOne({ email: customerEmail }, { $set: {
        'subscription.expiration': new Date(periodEnd * 1000),
      } })

      break
    case 'invoice.payment_failed':
      // The payment failed or the customer does not have a valid payment method.
      // The subscription becomes past_due. Notify your customer and send them to the
      // customer portal to update their payment information.

      const user = await db.collection('accounts').findOne({ email: customerEmail })
      if (user?.subscription) {
        console.log(`🔔 Payment for ${customerEmail} failed, sending email to customer`)

        const portalSession = await stripe.billingPortal.sessions.create({
          customer: customerId,
          return_url: `${process.env.DOMAIN}/moloch`
        })

        sendEmail({
          email: customerEmail,
          subject: 'Payment Failed',
          html: `Uh oh, looks like the payment method for your subscription has failed. Please update your payment information by clicking the link below:
      
  <a href='${portalSession.url}'>${portalSession.url}</a>

  The Artifact Guesser System`
        })
      } else {
        console.log(`🔔 Payment failed for ${customerEmail} but no subscription found`)
      }

      break
    default: // Unhandled event type
  }

  res.status(200).end()
}

export default webhook