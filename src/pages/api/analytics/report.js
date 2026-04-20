import { initDB } from "@/lib/apiUtils/mongodb"
import { verifyAuth, withSessionRoute } from "@/lib/apiUtils/session"

/**
 * GET /api/analytics/report?type=overview&period=7d
 *
 * Returns aggregated analytics reports. Admin-only.
 *
 * Query params:
 *   type: 'overview' | 'funnel' | 'traffic' | 'daily'
 *   period: '24h' | '7d' | '30d' | '90d' (default: '7d')
 *   dateKey: specific date for daily-run reports (e.g. '2026-04-10')
 */
const report = async (req, res) => {
  const user = verifyAuth(req, res, ['Admin'])
  if (!user) return

  const db = await initDB()
  const reportType = req.query.type || 'overview'
  const period = req.query.period || '7d'

  // Calculate date range
  const now = new Date()
  const periodMs = {
    '24h': 24 * 60 * 60 * 1000,
    '7d': 7 * 24 * 60 * 60 * 1000,
    '30d': 30 * 24 * 60 * 60 * 1000,
    '90d': 90 * 24 * 60 * 60 * 1000
  }
  const since = new Date(now.getTime() - (periodMs[period] || periodMs['7d']))

  try {
    if (reportType === 'overview') {
      // GoatCounter events have a `count` field (daily total per path).
      // Internal events have count=1 implicitly (one doc per event).
      const [viewsAgg, uniqueVisitors, eventCounts] = await Promise.all([
        db.collection('analyticsEvents').aggregate([
          { $match: { type: 'pageview', occurredAt: { $gte: since }, isBot: { $ne: true } } },
          { $group: { _id: null, total: { $sum: { $ifNull: ['$count', 1] } } } }
        ]).toArray(),
        db.collection('analyticsEvents').distinct('anonymousId', {
          type: 'pageview',
          occurredAt: { $gte: since },
          anonymousId: { $ne: null },
          isBot: { $ne: true },
        }),
        db.collection('analyticsEvents').aggregate([
          { $match: { occurredAt: { $gte: since }, isBot: { $ne: true } } },
          { $group: { _id: '$type', count: { $sum: { $ifNull: ['$count', 1] } } } },
          { $sort: { count: -1 } }
        ]).toArray()
      ])

      // Bot activity for sanity checking / comparison with GoatCounter
      const [botViewsAgg, botVisitors] = await Promise.all([
        db.collection('analyticsEvents').aggregate([
          { $match: { type: 'pageview', occurredAt: { $gte: since }, isBot: true } },
          { $group: { _id: null, total: { $sum: { $ifNull: ['$count', 1] } } } }
        ]).toArray(),
        db.collection('analyticsEvents').distinct('anonymousId', {
          type: 'pageview',
          occurredAt: { $gte: since },
          anonymousId: { $ne: null },
          isBot: true,
        }),
      ])

      return res.json({
        period,
        totalViews: viewsAgg[0]?.total || 0,
        uniqueVisitors: uniqueVisitors.length,
        botViews: botViewsAgg[0]?.total || 0,
        botVisitors: botVisitors.length,
        eventBreakdown: eventCounts.map(e => ({ type: e._id, count: e.count }))
      })
    }

    if (reportType === 'funnel') {
      // Game completion funnel
      const funnelEvents = ['game_started', 'round_completed', 'game_completed']
      const funnelCounts = await Promise.all(
        funnelEvents.map(type =>
          db.collection('analyticsEvents').countDocuments({
            type,
            occurredAt: { $gte: since },
            isBot: { $ne: true },
          })
        )
      )

      // Daily run funnel
      const dailyFunnelEvents = ['daily_run_started', 'daily_round_completed', 'daily_run_completed']
      const dailyFunnelCounts = await Promise.all(
        dailyFunnelEvents.map(type =>
          db.collection('analyticsEvents').countDocuments({
            type,
            occurredAt: { $gte: since },
            isBot: { $ne: true },
          })
        )
      )

      return res.json({
        period,
        gameFunnel: funnelEvents.map((type, i) => ({ type, count: funnelCounts[i] })),
        dailyFunnel: dailyFunnelEvents.map((type, i) => ({ type, count: dailyFunnelCounts[i] }))
      })
    }

    if (reportType === 'traffic') {
      const [topPaths, topReferrers, viewsByDay] = await Promise.all([
        db.collection('analyticsEvents').aggregate([
          { $match: { type: 'pageview', occurredAt: { $gte: since }, isBot: { $ne: true } } },
          { $group: { _id: '$path', count: { $sum: { $ifNull: ['$count', 1] } } } },
          { $sort: { count: -1 } },
          { $limit: 20 }
        ]).toArray(),
        db.collection('analyticsEvents').aggregate([
          { $match: { type: 'pageview', occurredAt: { $gte: since }, referrer: { $ne: null } } },
          { $group: { _id: '$referrer', count: { $sum: { $ifNull: ['$count', 1] } } } },
          { $sort: { count: -1 } },
          { $limit: 20 }
        ]).toArray(),
        db.collection('analyticsEvents').aggregate([
          { $match: { type: 'pageview', occurredAt: { $gte: since }, isBot: { $ne: true } } },
          { $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$occurredAt' } },
            count: { $sum: { $ifNull: ['$count', 1] } }
          }},
          { $sort: { _id: 1 } }
        ]).toArray()
      ])

      return res.json({
        period,
        topPaths: topPaths.map(p => ({ path: p._id, count: p.count })),
        topReferrers: topReferrers.map(r => ({ referrer: r._id, count: r.count })),
        viewsByDay: viewsByDay.map(d => ({ date: d._id, count: d.count }))
      })
    }

    if (reportType === 'player-journey') {
      const accountId = req.query.accountId
      if (!accountId) return res.status(400).json({ error: 'accountId required' })

      const { ObjectId } = await import('mongodb')
      const account = await db.collection('accounts').findOne({ _id: new ObjectId(accountId) })
      if (!account) return res.status(404).json({ error: 'Account not found' })

      // Get anonymousId from account (if linked)
      const anonId = account.anonymousId
      const identityFilter = anonId
        ? { $or: [{ userId: accountId }, { anonymousId: anonId }] }
        : { userId: accountId }

      const [
        firstEvent,
        games,
        dailyGames,
        challengesSent,
        challengesReceived,
        allEvents,
      ] = await Promise.all([
        // First analytics event (arrival source)
        anonId
          ? db.collection('analyticsEvents').findOne({ anonymousId: anonId }, { sort: { occurredAt: 1 } })
          : null,
        // All personal games
        db.collection('games').find({ userId: accountId }).sort({ startedAt: -1 }).toArray(),
        // All daily games
        db.collection('dailyGames').find({ userId: accountId }).sort({ dateKey: -1 }).toArray(),
        // Challenges sent
        db.collection('challenges').countDocuments({ challengerUserId: accountId }),
        // Challenges received (completed by this user — stored in localStorage, check analyticsEvents)
        db.collection('analyticsEvents').countDocuments({ ...identityFilter, type: 'challenge_completed' }),
        // All events for timeline
        db.collection('analyticsEvents').find(identityFilter).sort({ occurredAt: -1 }).limit(500).toArray(),
      ])

      // Compute daily streak (only counts if most recent play is today or yesterday)
      const dailyDates = dailyGames.filter(g => g.completed).map(g => g.dateKey).sort()
      let streak = 0
      if (dailyDates.length > 0) {
        const today = new Date().toISOString().slice(0, 10)
        const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)
        const lastPlayed = dailyDates[dailyDates.length - 1]

        if (lastPlayed === today || lastPlayed === yesterday) {
          streak = 1
          for (let i = dailyDates.length - 1; i > 0; i--) {
            // Compare dateKey strings directly (YYYY-MM-DD) to avoid DST issues
            const curr = dailyDates[i]
            const prev = dailyDates[i - 1]
            const currDate = new Date(curr + 'T12:00:00Z')
            const prevDate = new Date(prev + 'T12:00:00Z')
            const diffDays = Math.round((currDate - prevDate) / 86400000)
            if (diffDays === 1) streak++
            else break
          }
        }
      }

      // Score trend (last 20 activities — personal games + dailies, merged by date)
      const allActivities = [
        ...games.map(g => ({ date: g.startedAt, score: g.score, mode: g.mode, type: 'personal', maxScore: g.rounds * 200 })),
        ...dailyGames.filter(g => g.completed).map(g => ({ date: new Date(g.dateKey + 'T12:00:00Z'), score: g.score, mode: 'Daily', type: 'daily', maxScore: 600 })),
      ].sort((a, b) => new Date(b.date) - new Date(a.date))
      const scoreTrend = allActivities.slice(0, 20).reverse()

      // Games by day for timeline
      const gamesByDay = {}
      games.forEach(g => {
        const day = new Date(g.startedAt).toISOString().slice(0, 10)
        gamesByDay[day] = (gamesByDay[day] || 0) + 1
      })
      dailyGames.forEach(g => {
        gamesByDay[g.dateKey] = (gamesByDay[g.dateKey] || 0) + 1
      })

      const lastEvent = allEvents[0]

      return res.json({
        account: {
          _id: account._id,
          username: account.username,
          email: account.email,
          createdAt: account.createdAt,
          anonymousId: anonId,
        },
        arrivalSource: firstEvent ? {
          referrer: firstEvent.referrer,
          utmSource: firstEvent.utmSource,
          utmMedium: firstEvent.utmMedium,
          utmCampaign: firstEvent.utmCampaign,
          path: firstEvent.path,
          date: firstEvent.occurredAt,
        } : null,
        preSignupEvents: anonId ? allEvents.filter(e =>
          e.anonymousId === anonId && (!e.userId || e.userId === accountId) &&
          e.occurredAt < account.createdAt
        ).length : 0,
        games: {
          total: games.length,
          // Normalize scores to percentage (each game's max = rounds * 200)
          avgScorePct: games.length > 0 ? Math.round(
            games.reduce((s, g) => {
              const max = (g.rounds || 5) * 200
              return s + ((g.score || 0) / max) * 100
            }, 0) / games.length
          ) : 0,
          scoreTrend,
        },
        daily: {
          totalPlayed: dailyGames.filter(g => g.completed).length,
          streak,
          lastPlayed: dailyDates[dailyDates.length - 1] || null,
        },
        challenges: {
          sent: challengesSent,
          completed: challengesReceived,
        },
        timeline: Object.entries(gamesByDay).map(([date, count]) => ({ date, count })).sort((a, b) => a.date.localeCompare(b.date)),
        lastActive: lastEvent?.occurredAt || null,
      })
    }

    if (reportType === 'retention') {
      // Cohort retention computed in a single aggregation pipeline.
      // - Each account is tagged with its ISO signup week + cohortStart (Monday 00:00 UTC).
      // - $lookup pulls that account's non-bot events and buckets them into week offsets
      //   from cohortStart. $facet in parallel produces cohort sizes.
      const weeks = parseInt(req.query.weeks) || 8
      const earliest = new Date(Date.now() - (weeks + 4) * 7 * 86400000)

      const [result] = await db.collection('accounts').aggregate([
        { $match: { createdAt: { $gte: earliest } } },
        { $addFields: {
          userIdStr: { $toString: '$_id' },
          cohort: { $dateToString: { format: '%G-W%V', date: '$createdAt' } },
          cohortStart: { $dateFromParts: {
            isoWeekYear: { $isoWeekYear: '$createdAt' },
            isoWeek: { $isoWeek: '$createdAt' },
            isoDayOfWeek: 1,
          }},
        }},
        { $facet: {
          sizes: [
            { $group: { _id: '$cohort', size: { $sum: 1 } } },
          ],
          retention: [
            { $lookup: {
              from: 'analyticsEvents',
              let: { uid: '$userIdStr', cs: '$cohortStart' },
              pipeline: [
                { $match: { $expr: { $and: [
                  { $eq: ['$userId', '$$uid'] },
                  { $gte: ['$occurredAt', '$$cs'] },
                  { $ne: ['$isBot', true] },
                ]}}},
                { $group: { _id: {
                  $floor: { $divide: [ { $subtract: ['$occurredAt', '$$cs'] }, 604800000 ] },
                }}},
              ],
              as: 'activeWeekIds',
            }},
            { $unwind: '$activeWeekIds' },
            { $group: {
              _id: { cohort: '$cohort', week: '$activeWeekIds._id' },
              users: { $addToSet: '$_id' },
            }},
            { $project: {
              _id: 0,
              cohort: '$_id.cohort',
              week: '$_id.week',
              count: { $size: '$users' },
            }},
          ],
        }},
      ]).toArray()

      const sizeMap = Object.fromEntries((result?.sizes || []).map(s => [s._id, s.size]))
      const byCohort = {}
      for (const r of result?.retention || []) {
        ;(byCohort[r.cohort] = byCohort[r.cohort] || {})[r.week] = r.count
      }

      const cohortData = Object.keys(sizeMap)
        .sort()                   // ISO week strings sort chronologically
        .slice(-weeks)            // keep most recent N
        .map(cohort => {
          const size = sizeMap[cohort]
          const weekCounts = byCohort[cohort] || {}
          const retention = Array.from({ length: weeks }, (_, w) => {
            const active = weekCounts[w] || 0
            return {
              week: w,
              active,
              rate: size > 0 ? Math.round((active / size) * 100) : 0,
            }
          })
          return { cohort, size, retention }
        })

      return res.json({ cohorts: cohortData })
    }

    if (reportType === 'engagement') {
      // Daily return rate + engagement metrics
      const dailyActive = await db.collection('analyticsEvents').aggregate([
        { $match: { occurredAt: { $gte: since }, userId: { $ne: null }, isBot: { $ne: true } } },
        { $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$occurredAt' } },
            userId: '$userId',
          }
        }},
        { $group: {
          _id: '$_id.date',
          uniqueUsers: { $sum: 1 },
        }},
        { $sort: { _id: 1 } },
      ]).toArray()

      // Return rate: % of yesterday's users who came back today
      const returnRates = []
      for (let i = 1; i < dailyActive.length; i++) {
        const yesterday = dailyActive[i - 1]
        const today = dailyActive[i]

        // Get actual user overlap (use next day midnight for exclusive upper bound)
        const nextDayAfterYesterday = new Date(new Date(yesterday._id + 'T00:00:00Z').getTime() + 86400000)
        const nextDayAfterToday = new Date(new Date(today._id + 'T00:00:00Z').getTime() + 86400000)

        const yesterdayUsers = await db.collection('analyticsEvents').distinct('userId', {
          userId: { $ne: null },
          occurredAt: {
            $gte: new Date(yesterday._id + 'T00:00:00Z'),
            $lt: nextDayAfterYesterday,
          }
        })
        const todayUsers = await db.collection('analyticsEvents').distinct('userId', {
          userId: { $ne: null },
          occurredAt: {
            $gte: new Date(today._id + 'T00:00:00Z'),
            $lt: nextDayAfterToday,
          }
        })

        const returning = todayUsers.filter(u => yesterdayUsers.includes(u)).length
        returnRates.push({
          date: today._id,
          dau: today.uniqueUsers,
          returning,
          rate: yesterdayUsers.length > 0 ? Math.round((returning / yesterdayUsers.length) * 100) : 0,
        })
      }

      // Challenge funnel
      const challengeFunnel = await Promise.all([
        db.collection('analyticsEvents').countDocuments({ type: 'challenge_sent', occurredAt: { $gte: since }, isBot: { $ne: true } }),
        db.collection('analyticsEvents').countDocuments({ type: 'challenge_opened', occurredAt: { $gte: since }, isBot: { $ne: true } }),
        db.collection('analyticsEvents').countDocuments({ type: 'challenge_completed', occurredAt: { $gte: since }, isBot: { $ne: true } }),
        db.collection('analyticsEvents').countDocuments({ type: 'identity_linked', occurredAt: { $gte: since }, isBot: { $ne: true } }),
      ])

      return res.json({
        dailyActive: dailyActive.map(d => ({ date: d._id, users: d.uniqueUsers })),
        returnRates,
        challengeFunnel: [
          { step: 'Challenge Sent', count: challengeFunnel[0] },
          { step: 'Challenge Opened', count: challengeFunnel[1] },
          { step: 'Challenge Completed', count: challengeFunnel[2] },
          { step: 'Signed Up', count: challengeFunnel[3] },
        ],
      })
    }

    res.status(400).json({ error: `Unknown report type: ${reportType}` })
  } catch (err) {
    console.error('Analytics report error:', err)
    res.status(500).json({ error: 'Failed to generate report' })
  }
}

export default withSessionRoute(report)
