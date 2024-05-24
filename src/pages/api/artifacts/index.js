import { cleanMDB, processCriteria } from "@/lib/apiUtils/misc"
import { initDB } from "@/lib/apiUtils/mongodb"

const artifacts = async (req, res) => {
  const db = await initDB()

  const criteria = req.query.filter && buildArtifactCriteria(processCriteria(JSON.parse(req.query.filter)))
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

export const buildArtifactCriteria = filter => {
  filter.$and = []

  if (![undefined, null].includes(filter.startDateAfter)) {
    filter.$and.push({ 'time.start': { $gte: Number(filter.startDateAfter) } })
    delete filter.startDateAfter
  }
  if (![undefined, null].includes(filter.startDateBefore)) {
    filter.$and.push({ 'time.start': { $lte: Number(filter.startDateBefore) } })
    delete filter.startDateBefore
  }
  if (![undefined, null].includes(filter.endDateAfter)) {
    filter.$and.push({ 'time.end': { $gte: Number(filter.endDateAfter) } })
    delete filter.endDateAfter
  }
  if (![undefined, null].includes(filter.endDateBefore)) {
    filter.$and.push({ 'time.end': { $lte: Number(filter.endDateBefore) } })
    delete filter.endDateBefore
  }

  if (filter.$and.length === 0) delete filter.$and
  return filter
}

export default artifacts