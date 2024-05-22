import { cleanMDB, processCriteria } from "@/lib/apiUtils/misc"
import { initDB } from "@/lib/apiUtils/mongodb"
import { verifyAuth, withSessionRoute } from "@/lib/apiUtils/session"

const artifacts = async (req, res) => {
  const v = verifyAuth(req, res); if (!v) return
  const db = await initDB()

  const criteria = req.query.filter && buildArtifactCriteria(processCriteria(JSON.parse(req.query.filter)))
  console.log(JSON.stringify(criteria, null, 2))

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

const buildArtifactCriteria = filter => {
  filter.$and = []

  if (filter.startDateAfter) {
    filter.$and.push({ 'time.start': { $gte: Number(filter.startDateAfter) } })
    delete filter.startDateAfter
  }
  if (filter.startDateBefore) {
    filter.$and.push({ 'time.start': { $lte: Number(filter.startDateBefore) } })
    delete filter.startDateBefore
  }
  if (filter.endDateAfter) {
    filter.$and.push({ 'time.end': { $gte: Number(filter.endDateAfter) } })
    delete filter.endDateAfter
  }
  if (filter.endDateBefore) {
    filter.$and.push({ 'time.end': { $lte: Number(filter.endDateBefore) } })
    delete filter.endDateBefore
  }

  if (filter.$and.length === 0) delete filter.$and
  return filter
}

export default withSessionRoute(artifacts)