import { initDB } from "./mongodb"

/**
 * Ensures required MongoDB indexes exist for daily challenges,
 * analytics, and friend challenges.
 *
 * Call once at startup or run as a standalone script.
 */
export const ensureIndexes = async () => {
  const db = await initDB()

  // Daily challenges — one per day
  await db.collection('dailyChallenges').createIndex(
    { dateKey: 1 },
    { unique: true }
  )

  // Daily games — one per user per day, query by dateKey for leaderboard
  await db.collection('dailyGames').createIndex(
    { userId: 1, dateKey: 1 },
    { unique: true }
  )
  await db.collection('dailyGames').createIndex(
    { dateKey: 1, completed: 1, score: -1 }
  )

  // Analytics events — query by type, time range, and various dimensions
  await db.collection('analyticsEvents').createIndex(
    { type: 1, occurredAt: -1 }
  )
  await db.collection('analyticsEvents').createIndex(
    { occurredAt: -1 }
  )
  await db.collection('analyticsEvents').createIndex(
    { anonymousId: 1, type: 1 }
  )

  // Challenges
  await db.collection('challenges').createIndex(
    { dateKey: 1 }
  )

  console.log('[ensureIndexes] All indexes created')
}
