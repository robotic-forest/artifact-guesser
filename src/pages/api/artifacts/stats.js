import { initDB } from "@/lib/apiUtils/mongodb"

const artifactStats = async (req, res) => {
  const db = await initDB()

  const total = await db.collection('artifacts').count()
  // const problematic = await db.collection('artifacts').count({ problematic: true })

  // count all artifacts and sort them by location.country
  const byCountry = await db.collection('artifacts').aggregate([
    { $group: { _id: '$location.country', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]).toArray()

  res.send({ data: { total, byCountry } })
}

export default artifactStats