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
      const [totalViews, uniqueVisitors, eventCounts] = await Promise.all([
        db.collection('analyticsEvents').countDocuments({
          type: 'pageview',
          occurredAt: { $gte: since }
        }),
        db.collection('analyticsEvents').distinct('anonymousId', {
          type: 'pageview',
          occurredAt: { $gte: since }
        }),
        db.collection('analyticsEvents').aggregate([
          { $match: { occurredAt: { $gte: since } } },
          { $group: { _id: '$type', count: { $sum: 1 } } },
          { $sort: { count: -1 } }
        ]).toArray()
      ])

      return res.json({
        period,
        totalViews,
        uniqueVisitors: uniqueVisitors.length,
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
            occurredAt: { $gte: since }
          })
        )
      )

      // Daily run funnel
      const dailyFunnelEvents = ['daily_run_started', 'daily_round_completed', 'daily_run_completed']
      const dailyFunnelCounts = await Promise.all(
        dailyFunnelEvents.map(type =>
          db.collection('analyticsEvents').countDocuments({
            type,
            occurredAt: { $gte: since }
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
          { $match: { type: 'pageview', occurredAt: { $gte: since } } },
          { $group: { _id: '$path', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 20 }
        ]).toArray(),
        db.collection('analyticsEvents').aggregate([
          { $match: { type: 'pageview', occurredAt: { $gte: since }, referrer: { $ne: null } } },
          { $group: { _id: '$referrer', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 20 }
        ]).toArray(),
        db.collection('analyticsEvents').aggregate([
          { $match: { type: 'pageview', occurredAt: { $gte: since } } },
          { $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$occurredAt' } },
            count: { $sum: 1 }
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

    res.status(400).json({ error: `Unknown report type: ${reportType}` })
  } catch (err) {
    console.error('Analytics report error:', err)
    res.status(500).json({ error: 'Failed to generate report' })
  }
}

export default withSessionRoute(report)
