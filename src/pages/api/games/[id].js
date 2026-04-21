import { initDB } from "@/lib/apiUtils/mongodb"
import { ObjectId } from "mongodb"
import { withSessionRoute } from "@/lib/apiUtils/session"

const game = async (req, res) => {
  const db = await initDB()

  if (req.query.id === 'undefined') return res.send()

  let gameId
  try { gameId = new ObjectId(req.query.id) } catch { return res.status(400).send({ error: 'Invalid id' }) }

  const game = await db.collection('games').findOne({ _id: gameId })
  if (!game) return res.status(404).send({ error: 'Not found' })

  if (game.roundData?.length) {
    const artifactIDs = game.roundData.map(r => r.artifactId).filter(Boolean).map(id => new ObjectId(id))
    const artifacts = await db.collection('artifacts').find({ _id: { $in: artifactIDs } }).toArray()
    game.roundData = game.roundData.map(r => {
      const artifact = artifacts.find(a => a._id.toString() === r.artifactId)
      return { ...r, artifact }
    })
  }

  if (game.gameType === 'multiplayer') {
    const playerIds = [...new Set([
      ...(game.playerIds || []),
      game.hostId,
      game.winnerId,
      ...(game.finalScores || []).map(s => s.userId),
    ].filter(Boolean))]

    const accountOids = playerIds.map(pid => { try { return new ObjectId(pid) } catch { return null } }).filter(Boolean)
    const accounts = accountOids.length
      ? await db.collection('accounts').find({ _id: { $in: accountOids } }, { projection: { username: 1 } }).toArray()
      : []
    const usernames = Object.fromEntries(accounts.map(a => [a._id.toString(), a.username]))

    game.usernames = usernames
    game.hostUsername = usernames[game.hostId] || null
    game.winnerUsername = game.winnerId ? (usernames[game.winnerId] || null) : null

    // Chat gated to participants/admins — lobby chat may be private
    const user = req.session?.user
    const viewerId = user?._id?.toString()
    const isParticipant = viewerId && (game.playerIds || []).includes(viewerId)
    const isAdmin = user?.role === 'Admin'

    game.chat = ((isParticipant || isAdmin) && game.lobbyId)
      ? await db.collection('chat_messages').find({ lobby: game.lobbyId }).sort({ timestamp: 1 }).toArray()
      : null
  }

  res.send(game)
}

export default withSessionRoute(game)
