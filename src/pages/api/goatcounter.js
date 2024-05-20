import { withSessionRoute } from "@/lib/apiUtils/session"
const { serverError } = require("@/lib/apiUtils/misc")
const { default: axios } = require("axios")


const getGoat = async (path, params) => {
  const res = await axios.get(`https://protocodex.goatcounter.com/api/v0/${path}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${"2v9nf2jze9fn71egtp7i9xta1y764g2zk2wmy123jtgyvq8onk" || process.env.GOATCOUNTER_API_KEY}`
    },
    params
  })

  return res.data
}

const goatCounter = async (req, res) => {
  try {
    const { path, params } = JSON.parse(req.query.args)
    console.log('Path:', path, params)

    const data = await getGoat(path, params)

    console.log('Result:', JSON.stringify(data, null, 2))

    res.send(data)
  } catch(error) { serverError(error, res) }
}

export default withSessionRoute(goatCounter)