import { initDB } from "@/lib/apiUtils/mongodb"
import { verifyAuth, withSessionRoute } from "@/lib/apiUtils/session"

/**
 * GET /api/admin/chat/[lobbyId]
 *
 * Returns all chat messages for a lobby. Used both by the dedicated
 * chat viewer and by orphan-lobby inspection (lobbies with messages
 * but no linked game).
 */
const handler = async (req, res) => {
  const user = verifyAuth(req, res, ['Admin'])
  if (!user) return

  const db = await initDB()
  const { lobbyId } = req.query

  try {
    const messages = await db.collection('chat_messages')
      .find({ lobby: lobbyId })
      .sort({ timestamp: 1 })
      .toArray()

    res.json({ lobbyId, messages })
  } catch (err) {
    console.error('admin/chat error:', err)
    res.status(500).json({ error: 'Failed to load chat' })
  }
}

export default withSessionRoute(handler)
