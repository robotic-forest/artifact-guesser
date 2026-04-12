import { DailyGame } from "@/components/daily/DailyGame"
import Head from "next/head"

export default function DailyPage({ og }) {
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
      <DailyGame />
    </>
  )
}

export const getServerSideProps = async (ctx) => {
  const { sharedScore, sharedBy, dateKey, tease } = ctx.query

  // Build absolute base URL from the request (works in dev and prod)
  const proto = ctx.req.headers['x-forwarded-proto'] || 'http'
  const host = ctx.req.headers['x-forwarded-host'] || ctx.req.headers.host
  const baseUrl = `${proto}://${host}`

  const isShare = sharedScore !== undefined && sharedScore !== ''

  // Build OG image URL with the same query params we care about
  const ogParams = new URLSearchParams()
  if (sharedScore) ogParams.set('score', String(sharedScore))
  if (dateKey) ogParams.set('dateKey', String(dateKey))
  if (sharedBy) ogParams.set('by', String(sharedBy))
  if (tease) ogParams.set('tease', String(tease))
  const ogImage = `${baseUrl}/api/og/daily${ogParams.toString() ? `?${ogParams}` : ''}`

  const og = {
    title: isShare
      ? `${sharedBy ? `${sharedBy} ` : ''}scored ${sharedScore}/600 on Today's Run — can you beat it?`
      : "Today's Run - Artifact Guesser",
    description: isShare
      ? `Play the same 3 artifacts and compare your score. Artifact Guesser — GeoGuessr for archaeology.`
      : "Play today's daily challenge. Same 3 artifacts for everyone — compare your score!",
    url: `${baseUrl}/daily`,
    image: ogImage,
  }

  return { props: { og } }
}
