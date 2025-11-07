import { withSessionRoute } from "@/lib/apiUtils/session"
const { default: axios } = require("axios")

const getGoat = async (path, params) => {
  const token = process.env.GOATCOUNTER_TOKEN || "23tsomunmqdat18fd3116omwxtrdlb1e894rn9holxx2qzgc8t"

  try {
    const res = await axios.get(`https://artifactguesser.goatcounter.com/api/v0/${path}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      params,
      timeout: 3000,
      // Prefer IPv4 to avoid potential IPv6 route issues in some environments
      family: 4,
    })
    return res.data
  } catch (error) {
    // Fail soft: return a minimal shape that callers can handle
    if (path === 'stats/total') return { total: 0 }
    return { success: false }
  }
}

const goatCounter = async (req, res) => {
  try {
    const { path, params } = JSON.parse(req.query.args)
    const data = await getGoat(path, params)
    res.send(data)
  } catch (error) {
    // Final fallback
    res.send({ success: false })
  }
}

export default withSessionRoute(goatCounter)