import { initDB } from "@/lib/apiUtils/mongodb"

const artifactStats = async (req, res) => {
  const db = await initDB()

  const [total, byCountry, byEra, playAgg] = await Promise.all([
    db.collection('artifacts').count(),

    db.collection('artifacts').aggregate([
      { $group: { _id: '$location.country', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]).toArray(),

    // Histogram by century (dates.year ranges from BCE-negative to CE-positive)
    db.collection('artifacts').aggregate([
      { $match: { 'dates.year': { $ne: null } } },
      { $project: { century: { $floor: { $divide: ['$dates.year', 100] } } } },
      { $group: { _id: '$century', count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]).toArray(),

    // Single-player rounds: unwind, group by artifactId, avg points
    db.collection('games').aggregate([
      { $match: { gameType: { $ne: 'multiplayer' }, roundData: { $exists: true }, ongoing: { $ne: true } } },
      { $unwind: '$roundData' },
      { $match: { 'roundData.guessed': true, 'roundData.points': { $ne: null } } },
      { $group: {
        _id: '$roundData.artifactId',
        plays: { $sum: 1 },
        avgPoints: { $avg: '$roundData.points' },
      }},
      { $match: { plays: { $gte: 5 } } },
    ]).toArray(),
  ])

  // Split into hardest / easiest / mostSeen, then join artifact info
  const { ObjectId } = await import('mongodb')
  const hardest = [...playAgg].sort((a, b) => a.avgPoints - b.avgPoints).slice(0, 5)
  const easiest = [...playAgg].sort((a, b) => b.avgPoints - a.avgPoints).slice(0, 5)
  const mostSeen = [...playAgg].sort((a, b) => b.plays - a.plays).slice(0, 5)

  const idSet = new Set([...hardest, ...easiest, ...mostSeen].map(r => r._id).filter(Boolean))
  const oids = [...idSet].map(id => { try { return new ObjectId(id) } catch { return null } }).filter(Boolean)
  const artifacts = oids.length
    ? await db.collection('artifacts').find(
      { _id: { $in: oids } },
      { projection: { name: 1, dates: 1, location: 1 } },
    ).toArray()
    : []
  const artifactMap = Object.fromEntries(artifacts.map(a => [a._id.toString(), a]))

  const enrich = r => ({
    artifactId: r._id,
    name: artifactMap[r._id]?.name || null,
    country: artifactMap[r._id]?.location?.country || null,
    year: artifactMap[r._id]?.dates?.year || null,
    plays: r.plays,
    avgPoints: Math.round(r.avgPoints),
  })

  res.send({
    data: {
      total,
      byCountry,
      byEra,
      hardest: hardest.map(enrich),
      easiest: easiest.map(enrich),
      mostSeen: mostSeen.map(enrich),
    }
  })
}

export default artifactStats
