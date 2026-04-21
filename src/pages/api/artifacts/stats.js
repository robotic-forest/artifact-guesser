import { initDB } from "@/lib/apiUtils/mongodb"

const artifactStats = async (req, res) => {
  const db = await initDB()

  const [
    total,
    byCountry,
    byEra,
    bySource,
    favoritesCount,
    difficultyByCountry,
    difficultyByEra,
  ] = await Promise.all([
    db.collection('artifacts').count(),

    db.collection('artifacts').aggregate([
      { $group: { _id: '$location.country', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]).toArray(),

    db.collection('artifacts').aggregate([
      { $match: { 'dates.year': { $ne: null } } },
      { $project: { century: { $floor: { $divide: ['$dates.year', 100] } } } },
      { $group: { _id: '$century', count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]).toArray(),

    db.collection('artifacts').aggregate([
      { $group: { _id: { $ifNull: ['$source.name', 'Unknown'] }, count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]).toArray(),

    db.collection('favorites').countDocuments(),

    // Average points per artifact country, joined from single-player games
    db.collection('games').aggregate([
      { $match: { gameType: { $ne: 'multiplayer' }, roundData: { $exists: true }, ongoing: { $ne: true } } },
      { $unwind: '$roundData' },
      { $match: { 'roundData.guessed': true, 'roundData.points': { $ne: null } } },
      { $group: { _id: '$roundData.artifactId', avgPoints: { $avg: '$roundData.points' }, plays: { $sum: 1 } } },
      { $match: { plays: { $gte: 3 } } },
      { $addFields: { artifactOid: { $toObjectId: '$_id' } } },
      { $lookup: { from: 'artifacts', localField: 'artifactOid', foreignField: '_id', as: 'artifact' } },
      { $unwind: '$artifact' },
      { $group: {
        _id: '$artifact.location.country',
        avgPoints: { $avg: '$avgPoints' },
        artifacts: { $sum: 1 },
        totalPlays: { $sum: '$plays' },
      }},
      { $match: { artifacts: { $gte: 3 } } },
      { $sort: { avgPoints: 1 } },
    ]).toArray(),

    db.collection('games').aggregate([
      { $match: { gameType: { $ne: 'multiplayer' }, roundData: { $exists: true }, ongoing: { $ne: true } } },
      { $unwind: '$roundData' },
      { $match: { 'roundData.guessed': true, 'roundData.points': { $ne: null } } },
      { $group: { _id: '$roundData.artifactId', avgPoints: { $avg: '$roundData.points' }, plays: { $sum: 1 } } },
      { $match: { plays: { $gte: 3 } } },
      { $addFields: { artifactOid: { $toObjectId: '$_id' } } },
      { $lookup: { from: 'artifacts', localField: 'artifactOid', foreignField: '_id', as: 'artifact' } },
      { $unwind: '$artifact' },
      { $match: { 'artifact.dates.year': { $ne: null } } },
      { $project: {
        avgPoints: 1,
        plays: 1,
        century: { $floor: { $divide: ['$artifact.dates.year', 100] } },
      }},
      { $group: {
        _id: '$century',
        avgPoints: { $avg: '$avgPoints' },
        artifacts: { $sum: 1 },
        totalPlays: { $sum: '$plays' },
      }},
      { $match: { artifacts: { $gte: 3 } } },
      { $sort: { _id: 1 } },
    ]).toArray(),
  ])

  // Coverage gaps
  const SCARCE_THRESHOLD = 20
  const scarceCountries = byCountry.filter(c => c._id && c.count < SCARCE_THRESHOLD)
  const scarceCenturies = byEra.filter(e => e.count < SCARCE_THRESHOLD)

  res.send({
    data: {
      total,
      byCountry,
      byEra,
      bySource,
      favoritesCount,
      difficultyByCountry: difficultyByCountry.map(r => ({
        country: r._id || '(unknown)',
        avgPoints: Math.round(r.avgPoints),
        artifacts: r.artifacts,
        totalPlays: r.totalPlays,
      })),
      difficultyByEra: difficultyByEra.map(r => ({
        century: r._id,
        avgPoints: Math.round(r.avgPoints),
        artifacts: r.artifacts,
        totalPlays: r.totalPlays,
      })),
      coverageGaps: {
        threshold: SCARCE_THRESHOLD,
        scarceCountries: scarceCountries.slice(0, 10),
        scarceCountriesTotal: scarceCountries.length,
        scarceCenturies,
      },
    }
  })
}

export default artifactStats
