import { initDB } from "@/lib/apiUtils/mongodb"
import { verifyAuth, withSessionRoute } from "@/lib/apiUtils/session"

/**
 * GET /api/admin/multiplayer
 *
 * Lists past multiplayer games + orphan chat lobbies (lobbies with
 * messages but no linked game — e.g. pre-launch chats, or games played
 * before lobbyId was persisted onto the games doc).
 */
const handler = async (req, res) => {
  const user = verifyAuth(req, res, ['Admin'])
  if (!user) return

  const db = await initDB()

  try {
    const games = await db.collection('games').aggregate([
      { $match: { gameType: 'multiplayer' } },
      { $sort: { startedAt: -1 } },
      { $limit: 200 },
      { $lookup: {
        from: 'chat_messages',
        localField: 'lobbyId',
        foreignField: 'lobby',
        as: 'chat',
      }},
      { $project: {
        _id: 1, startedAt: 1, endedAt: 1, mode: 1, rounds: 1, timer: 1,
        hostId: 1, playerIds: 1, playerUsernames: 1, winnerId: 1,
        finalScores: 1, lobbyId: 1,
        chatCount: { $size: '$chat' },
      }},
    ]).toArray()

    const linkedLobbyIds = games.map(g => g.lobbyId).filter(Boolean)

    const orphanLobbies = await db.collection('chat_messages').aggregate([
      { $match: { lobby: { $nin: linkedLobbyIds } } },
      { $group: {
        _id: '$lobby',
        count: { $sum: 1 },
        firstAt: { $min: '$timestamp' },
        lastAt: { $max: '$timestamp' },
        usernames: { $addToSet: '$username' },
      }},
      { $sort: { lastAt: -1 } },
    ]).toArray()

    // Resolve host usernames for games missing playerUsernames (older records)
    const needsUsernames = games.some(g => !g.playerUsernames)
    let accountMap = {}
    if (needsUsernames) {
      const { ObjectId } = await import('mongodb')
      const ids = [...new Set(games.flatMap(g => [g.hostId, ...(g.playerIds || []), g.winnerId]).filter(Boolean))]
      const accounts = await db.collection('accounts').find(
        { _id: { $in: ids.map(id => { try { return new ObjectId(id) } catch { return null } }).filter(Boolean) } },
        { projection: { username: 1 } }
      ).toArray()
      accountMap = Object.fromEntries(accounts.map(a => [a._id.toString(), a.username]))
    }

    res.json({
      games: games.map(g => ({
        ...g,
        hostUsername: g.playerUsernames?.[0] || accountMap[g.hostId] || g.hostId,
        playerUsernames: g.playerUsernames || (g.playerIds || []).map(id => accountMap[id] || id),
        winnerUsername: g.winnerId ? (accountMap[g.winnerId] || null) : null,
      })),
      orphanLobbies: orphanLobbies.map(l => ({
        lobbyId: l._id,
        messageCount: l.count,
        firstAt: new Date(l.firstAt),
        lastAt: new Date(l.lastAt),
        usernames: l.usernames.filter(Boolean),
      })),
    })
  } catch (err) {
    console.error('admin/multiplayer list error:', err)
    res.status(500).json({ error: 'Failed to load multiplayer history' })
  }
}

export default withSessionRoute(handler)
