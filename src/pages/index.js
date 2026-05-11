import { Game } from "@/components/game/Game"
import Head from "next/head"
import { initDB } from "@/lib/apiUtils/mongodb"
import { pickProbedTease } from "@/lib/apiUtils/teaseImage"

export default function Home({ og }) {
  return (
    <>
      <Head>
        <title>Artifact Guesser — Free Daily Artifact Guessing Game</title>
        <meta name="viewport" content="initial-scale=1.0, maximum-scale=1, width=device-width" />
        <meta key="name" name="name" content='Artifact Guesser' />
        <meta key="description" name="description" content={og.description} />
        <meta key="ogTitle" property="og:title" content='Artifact Guesser' />
        <meta key="ogDescription" property="og:description" content={og.description} />
        <meta key="ogUrl" property="og:url" content={og.url} />
        <meta key="ogType" property="og:type" content="website" />
        <meta key="ogImage" property="og:image" content={og.image} />
        <meta key="ogImageWidth" property="og:image:width" content="1200" />
        <meta key="ogImageHeight" property="og:image:height" content="630" />
        <meta key="twCard" name="twitter:card" content="summary_large_image" />
        <meta key="twTitle" name="twitter:title" content='Artifact Guesser' />
        <meta key="twDescription" name="twitter:description" content={og.description} />
        <meta key="twImage" name="twitter:image" content={og.image} />
        <link rel="icon" href='/icon-sm.png' />
      </Head>
      <Game />
    </>
  )
}

export const getServerSideProps = async (ctx) => {
  const proto = ctx.req.headers['x-forwarded-proto'] || 'http'
  const host = ctx.req.headers['x-forwarded-host'] || ctx.req.headers.host
  const baseUrl = `${proto}://${host}`

  let tease = ''
  try {
    const db = await initDB()
    tease = await pickProbedTease(db)
  } catch {}

  const ogParams = new URLSearchParams()
  if (tease) ogParams.set('tease', tease)

  const og = {
    description: 'Guess the date and origin of historical artifacts. New daily run every day — play free.',
    url: `${baseUrl}/`,
    image: `${baseUrl}/api/og/site${ogParams.toString() ? `?${ogParams.toString()}` : ''}`,
  }

  return { props: { og } }
}
