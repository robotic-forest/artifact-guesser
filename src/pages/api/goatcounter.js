import { withSessionRoute } from "@/lib/apiUtils/session"
import { serverError } from "@/lib/apiUtils/misc"
const { default: axios } = require("axios")

const getGoat = async (path, params) => {
  const res = await axios.get(`https://artifactguesser.goatcounter.com/api/v0/${path}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer 23tsomunmqdat18fd3116omwxtrdlb1e894rn9holxx2qzgc8t`
    },
    params
  })

  return res.data
}

const goatCounter = async (req, res) => {
  try {
    const { path, params } = JSON.parse(req.query.args)
    const data = await getGoat(path, params)
    res.send(data)
  } catch(error) { serverError(error, res) }
}

export default withSessionRoute(goatCounter)