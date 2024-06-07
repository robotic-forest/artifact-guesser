import { initDB } from "@/lib/apiUtils/mongodb"
import { verifyAuth, withSessionRoute } from "@/lib/apiUtils/session"

const artifactStats = async (req, res) => {
  const v = verifyAuth(req, res); if (!v) return
  const db = await initDB()

  const total = await db.collection('artifacts').countDocuments()
  const problematic = await db.collection('artifacts').countDocuments({ problematic: true })

  // count all artifacts and sort them by location.country
  const byCountry = await db.collection('artifacts').aggregate([
    { $group: { _id: '$location.country', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]).toArray()

  res.send({ data: { total, problematic, byCountry } })
}

export default withSessionRoute(artifactStats)