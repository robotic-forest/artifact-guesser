import { Game } from "@/components/game/Game"
import Head from "next/head"
import { initDB } from "@/lib/apiUtils/mongodb"
import { pickProbedTease } from "@/lib/apiUtils/teaseImage"

export default function Home({ og }) {
  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Artifact Guesser',
    url: og.url,
    description: 'A free daily artifact guessing game. Guess the date and origin of real museum artifacts.',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${og.url}artifacts?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }

  const webAppSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Artifact Guesser',
    url: og.url,
    description: 'Guess the date and origin of historical artifacts from world museums. A free daily history guessing game with Wordle-style daily challenges and unlimited play.',
    applicationCategory: 'GameApplication',
    genre: 'History',
    operatingSystem: 'Web Browser',
    browserRequirements: 'Requires JavaScript',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    featureList: [
      'Daily artifact challenge',
      'Unlimited random artifact mode',
      'Multiplayer lobbies',
      'Real museum artifacts from the Metropolitan Museum of Art',
    ],
  }

  return (
    <>
      <Head>
        <title>Artifact Guesser — Free Daily Artifact Guessing Game</title>
        <meta name="viewport" content="initial-scale=1.0, maximum-scale=1, width=device-width" />
        <meta key="name" name="name" content='Artifact Guesser' />
        <meta key="description" name="description" content={og.description} />
        <meta key="ogTitle" property="og:title" content='Artifact Guesser — Free Daily Artifact Guessing Game' />
        <meta key="ogDescription" property="og:description" content={og.description} />
        <meta key="ogUrl" property="og:url" content={og.url} />
        <meta key="ogType" property="og:type" content="website" />
        <meta key="ogImage" property="og:image" content={og.image} />
        <meta key="ogImageWidth" property="og:image:width" content="1200" />
        <meta key="ogImageHeight" property="og:image:height" content="630" />
        <meta key="twCard" name="twitter:card" content="summary_large_image" />
        <meta key="twTitle" name="twitter:title" content='Artifact Guesser — Free Daily Artifact Guessing Game' />
        <meta key="twDescription" name="twitter:description" content={og.description} />
        <meta key="twImage" name="twitter:image" content={og.image} />
        <link rel="canonical" href={og.url} />
        <link rel="icon" href='/icon-sm.png' />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }}
        />
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
    description: 'Guess the date and origin of historical artifacts. Free daily artifact guessing game — new challenge every day. Play free, no download needed.',
    url: `${baseUrl}/`,
    image: `${baseUrl}/api/og/site${ogParams.toString() ? `?${ogParams.toString()}` : ''}`,
  }

  return { props: { og } }
}
