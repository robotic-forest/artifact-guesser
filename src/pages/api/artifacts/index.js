import { cleanMDB, processCriteria } from "@/lib/apiUtils/misc"
import { initDB } from "@/lib/apiUtils/mongodb"
import { verifyAuth, withSessionRoute } from "@/lib/apiUtils/session"

const artifacts = async (req, res) => {
  const v = verifyAuth(req, res); if (!v) return
  const db = await initDB()

  const criteria = req.query.filter && processCriteria(JSON.parse(req.query.filter))
  console.log(criteria)

  const page = parseFloat(req.query.page) || 1
  const perPage = parseFloat(req.query.per_page) || 0
  const sort = req.query.sort && JSON.parse(req.query.sort)

  const dbArtifacts = await db
    .collection('artifacts')
    .find(criteria)
    .collation({ locale: "en" }) // sort case insensitive
    .sort(sort)
    .skip((page - 1) * perPage) // pagination
    .limit(perPage)
    .toArray()

  res.send({
    data: cleanMDB(dbArtifacts),
    total: await db.collection('artifacts').countDocuments(criteria)
  })
}

export default withSessionRoute(artifacts)