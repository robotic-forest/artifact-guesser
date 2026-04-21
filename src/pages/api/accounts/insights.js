import { initDB } from "@/lib/apiUtils/mongodb"
import { verifyAuth, withSessionRoute } from "@/lib/apiUtils/session"

/**
 * GET /api/accounts/insights
 *
 * Signup funnel, activation rate, and top-player leaderboards for the
 * admin dashboard.
 */
const insights = async (req, res) => {
  const v = verifyAuth(req, res); if (!v) return
  const db = await initDB()

  const now = new Date()
  const period = req.query.period || '30d'
  const periodMs = {
    '24h': 24 * 60 * 60 * 1000,
    '7d': 7 * 24 * 60 * 60 * 1000,
    '30d': 30 * 24 * 60 * 60 * 1000,
    '90d': 90 * 24 * 60 * 60 * 1000,
  }
  const since = period === 'all'
    ? new Date(0)
    : new Date(now.getTime() - (periodMs[period] || periodMs['30d']))

  const [
    uniqueVisitors,
    newAccounts,
    gamesByNewAccounts,
    dailyByNewAccounts,
    totalAccounts,
    topByGames,
    topByScore,
  ] = await Promise.all([
    // Unique non-bot visitors in period
    db.collection('analyticsEvents').distinct('anonymousId', {
      type: 'pageview',
      occurredAt: { $gte: since },
      isBot: { $ne: true },
      anonymousId: { $ne: null },
    }),

    // Accounts created in period (cohort for activation)
    db.collection('accounts').find(
      { createdAt: { $gte: since } },
      { projection: { _id: 1, username: 1, createdAt: 1 } },
    ).toArray(),

    // Games played by those new accounts (grouped by userId)
    db.collection('games').aggregate([
      { $match: { startedAt: { $gte: since } } },
      { $group: { _id: '$userId', count: { $sum: 1 } } },
    ]).toArray(),

    // Daily completions by new accounts (dailyGames uses ObjectId userId)
    db.collection('dailyGames').aggregate([
      { $match: { completed: true } },
      { $group: { _id: '$userId' } },
    ]).toArray(),

    db.collection('accounts').countDocuments(),

    // Top players by games played (all-time)
    db.collection('games').aggregate([
      { $match: { userId: { $ne: null } } },
      { $group: { _id: '$userId', games: { $sum: 1 }, totalScore: { $sum: { $ifNull: ['$score', 0] } } } },
      { $sort: { games: -1 } },
      { $limit: 5 },
    ]).toArray(),

    // Top players by total score (all-time)
    db.collection('games').aggregate([
      { $match: { userId: { $ne: null } } },
      { $group: { _id: '$userId', totalScore: { $sum: { $ifNull: ['$score', 0] } }, games: { $sum: 1 } } },
      { $sort: { totalScore: -1 } },
      { $limit: 5 },
    ]).toArray(),
  ])

  const newAccountIds = new Set(newAccounts.map(a => a._id.toString()))
  const gameCountByUser = new Map(gamesByNewAccounts.map(g => [g._id, g.count]))
  const dailyCompletedUserIds = new Set(dailyByNewAccounts.map(d => d._id?.toString()).filter(Boolean))

  let played1 = 0, played3 = 0, dailyDone = 0
  for (const a of newAccounts) {
    const idStr = a._id.toString()
    const count = gameCountByUser.get(idStr) || 0
    if (count >= 1) played1++
    if (count >= 3) played3++
    if (dailyCompletedUserIds.has(idStr)) dailyDone++
  }

  // Usernames for top player lists
  const { ObjectId } = await import('mongodb')
  const topIds = [...new Set([...topByGames, ...topByScore].map(r => r._id).filter(Boolean))]
  const topOids = topIds.map(id => { try { return new ObjectId(id) } catch { return null } }).filter(Boolean)
  const topAccounts = topOids.length
    ? await db.collection('accounts').find(
        { _id: { $in: topOids } },
        { projection: { username: 1 } },
      ).toArray()
    : []
  const usernameFor = id => topAccounts.find(a => a._id.toString() === id)?.username || id?.slice(0, 6) || '?'

  res.json({
    signupFunnel: {
      uniqueVisitors: uniqueVisitors.length,
      signups: newAccounts.length,
      played1Plus: played1,
      played3Plus: played3,
    },
    activation: {
      cohortSize: newAccounts.length,
      played1Plus: played1,
      played3Plus: played3,
      completedDaily: dailyDone,
    },
    totalAccounts,
    topByGames: topByGames.map(r => ({
      userId: r._id,
      username: usernameFor(r._id),
      games: r.games,
      totalScore: r.totalScore,
    })),
    topByScore: topByScore.map(r => ({
      userId: r._id,
      username: usernameFor(r._id),
      totalScore: r.totalScore,
      games: r.games,
    })),
  })
}

export default withSessionRoute(insights)
