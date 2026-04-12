import { ChallengeGame } from "@/components/daily/ChallengeGame"
import Head from "next/head"
import { initDB } from "@/lib/apiUtils/mongodb"
import { ObjectId } from "mongodb"

export default function ChallengePage({ og, challengeId }) {
  return (
    <>
      <Head>
        <title>{og.title}</title>
        <meta name="viewport" content="initial-scale=1.0, maximum-scale=1, width=device-width" />
        <meta key="name" name="name" content={og.title} />
        <meta key="description" name="description" content={og.description} />

        <meta key="ogTitle" property="og:title" content={og.title} />
        <meta key="ogDescription" property="og:description" content={og.description} />
        <meta key="ogUrl" property="og:url" content={og.url} />
        <meta key="ogType" property="og:type" content="website" />
        <meta key="ogImage" property="og:image" content={og.image} />
        <meta key="ogImageWidth" property="og:image:width" content="1200" />
        <meta key="ogImageHeight" property="og:image:height" content="630" />

        <meta key="twCard" name="twitter:card" content="summary_large_image" />
        <meta key="twTitle" name="twitter:title" content={og.title} />
        <meta key="twDescription" name="twitter:description" content={og.description} />
        <meta key="twImage" name="twitter:image" content={og.image} />

        <link rel="icon" href='/icon-sm.png' />
      </Head>
      {challengeId && <ChallengeGame challengeId={challengeId} />}
    </>
  )
}

export const getServerSideProps = async (ctx) => {
  const { id } = ctx.params
  const proto = ctx.req.headers['x-forwarded-proto'] || 'http'
  const host = ctx.req.headers['x-forwarded-host'] || ctx.req.headers.host
  const baseUrl = `${proto}://${host}`

  let challengerUsername = 'Your friend'
  let challengerScore = ''
  let dateKey = ''

  try {
    const db = await initDB()
    const challenge = await db.collection('challenges').findOne({ _id: new ObjectId(id) })
    if (challenge) {
      challengerUsername = challenge.challengerUsername || 'Your friend'
      challengerScore = String(challenge.challengerScore)
      dateKey = challenge.dateKey || ''
    }
  } catch {}

  const ogParams = new URLSearchParams()
  ogParams.set('mode', 'challenge')
  if (challengerScore) ogParams.set('score', challengerScore)
  if (challengerUsername) ogParams.set('by', challengerUsername)
  if (dateKey) ogParams.set('dateKey', dateKey)

  const title = challengerScore
    ? `${challengerUsername} challenges you! ${challengerScore}/600 on Today's Run`
    : `You've been challenged! — Artifact Guesser`

  const og = {
    title,
    description: 'Play the same 3 artifacts and see if you can beat their score. Artifact Guesser — GeoGuessr for archaeology.',
    url: `${baseUrl}/challenge/${id}`,
    image: `${baseUrl}/api/og/daily?${ogParams.toString()}`,
  }

  return { props: { og, challengeId: id } }
}
