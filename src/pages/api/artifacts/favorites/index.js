import { initDB } from "@/lib/apiUtils/mongodb"
import { verifyAuth, withSessionRoute } from "@/lib/apiUtils/session"
import { buildArtifactCriteria } from "..";
import { cleanMDB, processCriteria } from "@/lib/apiUtils/misc";
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

export default withSessionRoute(favorites)