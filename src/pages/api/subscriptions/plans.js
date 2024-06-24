import s from 'stripe'
const stripe = s(process.env.STRIPE_LIVE_SECRET_KEY) // STRIPE_TEST_SECRET_KEY

const plans = async (req, res) => {
  const products = await stripe.products.list({ active: true })
  const stripePlans = await Promise.all(products.data
    .filter(p => p.metadata.ag === 'true')
    .map(async p => {
      const prices = await stripe.prices.list({ product: p.id, active: true })

      return {
        id: p.id,
        name: p.name,
        description: p.description,
        prices: prices.data.map(p => ({
          id: p.id,
          amount: p.unit_amount / 100,
        }))
      }
    })
  )

  res.send(stripePlans)
}

export default plans