import { cleanMDB, processCriteria } from "@/lib/apiUtils/misc"
import { initDB } from "@/lib/apiUtils/mongodb"
import { verifyAuth, withSessionRoute } from "@/lib/apiUtils/session"

/* schema: {
  _id: ObjectId
  userId: string
  ongoing: boolean
  round: number
  rounds: number
  score: number
  mode: string- classic
} */

const games = async (req, res) => {
  const user = verifyAuth(req, res); if (!user) return
  const db = await initDB()

  const criteria = req.query.filter && processCriteria(JSON.parse(req.query.filter))
  const page = parseFloat(req.query.page) || 1
  const perPage = parseFloat(req.query.per_page) || 0
  const sort = req.query.sort && JSON.parse(req.query.sort)

  const dbGames = await db
    .collection('games')
    .find(criteria)
    .collation({ locale: "en" }) // sort case insensitive
    .sort(sort)
    .skip((page - 1) * perPage) // pagination
    .limit(perPage)
    .toArray()

  res.send({
    data: cleanMDB(dbGames),
    total: await db.collection('games').countDocuments(criteria)
  })
}

export default withSessionRoute(games)