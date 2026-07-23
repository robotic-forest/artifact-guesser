import { initDB } from '@/lib/apiUtils/mongodb'
import { verifyAuth, withSessionRoute } from '@/lib/apiUtils/session'

// Manage the shared `shadowBans` collection. A shadow-banned user is never told:
// the mainframe socket server echoes their chat only back to themselves, hides all
// lobbies, and shows a "temporary renovation" multiplayer screen. Keyed by lowercased
// username. Admin only.
const handler = async (req, res) => {
  const user = verifyAuth(req, res, ['Admin'])
  if (!user) return

  const db = await initDB()
  const col = db.collection('shadowBans')

  if (req.method === 'GET') {
    const bans = await col.find({}).sort({ createdAt: -1 }).toArray()
    return res.send({ success: true, bans })
  }

  if (req.method === 'POST') {
    const username = String(req.body?.username || '').trim()
    if (!username) return res.send({ success: false, message: 'username required' })
    const usernameLower = username.toLowerCase()
    await col.updateOne(
      { usernameLower },
      {
        $setOnInsert: {
          usernameLower,
          username,
          createdAt: new Date(),
          createdBy: user.username || user._id,
        },
        $set: { reason: req.body?.reason || null },
      },
      { upsert: true }
    )
    return res.send({ success: true, usernameLower })
  }

  if (req.method === 'DELETE') {
    const username = String(req.body?.username || req.query?.username || '').trim()
    if (!username) return res.send({ success: false, message: 'username required' })
    await col.deleteOne({ usernameLower: username.toLowerCase() })
    return res.send({ success: true })
  }

  res.status(405).send({ success: false, message: 'Method not allowed' })
}

export default withSessionRoute(handler)
