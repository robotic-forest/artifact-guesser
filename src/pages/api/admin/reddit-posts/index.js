import snoowrap from 'snoowrap'
import { initDB } from '@/lib/apiUtils/mongodb'
import { verifyAuth } from '@/lib/apiUtils/session'

const REFRESH_TTL_MS = 60 * 1000

let cachedReddit = null
const getReddit = () => {
  if (cachedReddit) return cachedReddit
  cachedReddit = new snoowrap({
    userAgent: process.env.REDDIT_USER_AGENT || 'ag-reddit/0.1',
    clientId: process.env.REDDIT_CLIENT_ID,
    clientSecret: process.env.REDDIT_CLIENT_SECRET,
    refreshToken: process.env.REDDIT_REFRESH_TOKEN,
  })
  return cachedReddit
}

const handler = async (req, res) => {
  const user = verifyAuth(req, res, ['Admin'])
  if (!user) return

  const db = await initDB()
  const posts = await db.collection('redditPosts')
    .find({})
    .sort({ postedAt: -1 })
    .limit(100)
    .toArray()

  const now = Date.now()
  const stale = posts.filter(p => !p.lastFetched || (now - new Date(p.lastFetched).getTime()) > REFRESH_TTL_MS)

  if (stale.length) {
    try {
      const reddit = getReddit()
      await Promise.all(stale.map(async p => {
        try {
          const fresh = await reddit.getSubmission(p.redditId).fetch()
          await db.collection('redditPosts').updateOne(
            { redditId: p.redditId },
            { $set: {
              score: fresh.score,
              numComments: fresh.num_comments,
              upvoteRatio: fresh.upvote_ratio,
              lastFetched: new Date(),
            }}
          )
          p.score = fresh.score
          p.numComments = fresh.num_comments
          p.upvoteRatio = fresh.upvote_ratio
          p.lastFetched = new Date()
        } catch (e) {
          console.error(`refresh ${p.redditId} failed:`, e.message)
        }
      }))
    } catch (e) {
      console.error('reddit client error:', e.message)
    }
  }

  res.send({ success: true, posts })
}

export default handler
