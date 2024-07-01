import { initDB } from "@/lib/apiUtils/mongodb"
import { verifyAuth, withSessionRoute } from "@/lib/apiUtils/session"
import { cleanMDB, processCriteria } from "@/lib/apiUtils/misc"
import { ObjectId } from "mongodb";

const favorites = async (req, res) => {
  const user = verifyAuth(req); if (!user) return
  const db = await initDB()

  const dbFavorites = await db.collection('favorites').find({ userId: user._id }).toArray()

  const criteria = req.query.filter && buildArtifactCriteria(processCriteria(JSON.parse(req.query.filter)))
  const page = parseFloat(req.query.page) || 1
  const perPage = parseFloat(req.query.per_page) || 0
  const sort = req.query.sort && JSON.parse(req.query.sort)

  const dbArtifacts = await db
    .collection('artifacts')
    .find({
      _id: { $in: dbFavorites.map(f => new ObjectId(f.artifactId)) },
      ...criteria
    })
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

  // Time stuff!
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

  // Exclude self from relatedARtifacts in Artifact View
  if (![undefined, null].includes(filter.excludeId)) {
    filter.$and.push({ '_id': { $ne: new ObjectId(filter.excludeId) } })
    delete filter.excludeId
  }

  if (filter.$and.length === 0) delete filter.$and
  return filter
}

export default withSessionRoute(favorites)