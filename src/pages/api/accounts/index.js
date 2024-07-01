import { initDB } from "@/lib/apiUtils/mongodb"
import { paginationAggregation } from "@/lib/apiUtils/paginationAggregation";
import { verifyAuth, withSessionRoute } from "@/lib/apiUtils/session"

async function accounts(req, res) {
  const v = verifyAuth(req, res); if (!v) return
  const db = await initDB()

  const data = await paginationAggregation({ db, collection: 'accounts', query: req.query })
  res.send(data)
}

export default withSessionRoute(accounts)