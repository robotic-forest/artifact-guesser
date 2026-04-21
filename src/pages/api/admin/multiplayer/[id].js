import { initDB } from "@/lib/apiUtils/mongodb"
import { verifyAuth, withSessionRoute } from "@/lib/apiUtils/session"

/**
 * GET /api/admin/multiplayer/[id]
 *
 * Full multiplayer game detail: roundData, finalScores, players, chat
 * (if the game has a linked lobbyId).
 */
const handler = async (req, res) => {
  const user = verifyAuth(req, res, ['Admin'])
  if (!user) return

  const db = await initDB()
  const { ObjectId } = await import('mongodb')
  const { id } = req.query

  try {
    let gameId
    try { gameId = new ObjectId(id) } catch { return res.status(400).json({ error: 'Invalid id' }) }

    const game = await db.collection('games').findOne({ _id: gameId })
    if (!game || game.gameType !== 'multiplayer') {
      return res.status(404).json({ error: 'Game not found' })
    }

    // Resolve usernames
    const playerIds = [...new Set([
      ...(game.playerIds || []),
      game.hostId,
      game.winnerId,
      ...(game.finalScores || []).map(s => s.userId || s.playerId),
    ].filter(Boolean))]

    const accounts = await db.collection('accounts').find(
      { _id: { $in: playerIds.map(pid => { try { return new ObjectId(pid) } catch { return null } }).filter(Boolean) } },
      { projection: { username: 1 } }
    ).toArray()
    const usernameFor = id => accounts.find(a => a._id.toString() === id)?.username || id

    // Artifact lookup for round-by-round correct answers
    const artifactIds = [...new Set((game.roundData || []).map(r => r.artifactId).filter(Boolean))]
    const artifactObjectIds = artifactIds.map(aid => { try { return new ObjectId(aid) } catch { return null } }).filter(Boolean)
    const artifacts = artifactObjectIds.length
      ? await db.collection('artifacts').find(
          { _id: { $in: artifactObjectIds } },
          { projection: { name: 1, dates: 1, location: 1, images: 1, source: 1 } }
        ).toArray()
      : []
    const artifactMap = Object.fromEntries(artifacts.map(a => [a._id.toString(), a]))

    // Chat (only if the game was created with lobbyId persistence)
    const chat = game.lobbyId
      ? await db.collection('chat_messages').find({ lobby: game.lobbyId }).sort({ timestamp: 1 }).toArray()
      : []

    res.json({
      game: {
        ...game,
        hostUsername: usernameFor(game.hostId),
        winnerUsername: game.winnerId ? usernameFor(game.winnerId) : null,
        players: (game.playerIds || []).map(pid => ({
          userId: pid,
          username: usernameFor(pid),
        })),
      },
      chat,
      artifacts: artifactMap,
      usernames: Object.fromEntries(accounts.map(a => [a._id.toString(), a.username])),
    })
  } catch (err) {
    console.error('admin/multiplayer detail error:', err)
    res.status(500).json({ error: 'Failed to load game detail' })
  }
}

export default withSessionRoute(handler)
