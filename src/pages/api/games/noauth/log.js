import { initDB } from "@/lib/apiUtils/mongodb"

const log = async (req, res) => {
  const db = await initDB()
  // increment counter of noauthGames
  await db.collection('platform').updateOne({ name: 'stats' }, { $inc: { noauthGames: 1 } }, { upsert: true })
  res.send({ success: true })
}

export default log