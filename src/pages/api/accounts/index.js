import { cleanMDB } from "@/lib/apiUtils/misc"
import { initDB } from "@/lib/apiUtils/mongodb"
import { verifyAuth, withSessionRoute } from "@/lib/apiUtils/session"

async function accounts(req, res) {
  const v = verifyAuth(req, res); if (!v) return
  const db = await initDB()

  const criteria = req.query.filter ? JSON.parse(req.query.filter) : {}
  const page = parseFloat(req.query.page) || 1
  const perPage = parseFloat(req.query.per_page) || 0
  const sort = req.query.sort && JSON.parse(req.query.sort)

  let accounts
  if (perPage) {
    accounts = await db.collection('accounts')
      .find(criteria)
      .collation({ locale: "en" }) // sort case insensitive
      .sort(sort)
      .skip((page - 1) * perPage) // pagination
      .limit(perPage)
      .toArray()
  } else {
    accounts = await db.collection('accounts').find(criteria).toArray()
  }

  if (perPage) {
    res.send({
      data: cleanMDB(accounts),
      total: await db.collection('accounts').countDocuments(criteria)
    })
  } else res.send(cleanMDB(accounts))
}

export default withSessionRoute(accounts)