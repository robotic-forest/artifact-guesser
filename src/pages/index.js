import { HomeEntry } from "@/components/game/HomeEntry"
import Head from "next/head"
import { initDB } from "@/lib/apiUtils/mongodb"
import { pickProbedTease } from "@/lib/apiUtils/teaseImage"

export default function Home({ og, jsonLd }) {
  return (
    <>
      <Head>
        <title>Artifact Guesser</title>
        <meta name="viewport" content="initial-scale=1.0, maximum-scale=1, width=device-width" />
        <meta key="name" name="name" content='Artifact Guesser' />
        <meta key="description" name="description" content={og.description} />
        <link key="canonical" rel="canonical" href={og.url} />
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
        {(jsonLd || []).map((schema, i) => (
          <script
            key={`ld-${i}`}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, '\\u003c') }}
          />
        ))}
      </Head>
      <HomeEntry />
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
    description: 'Guess the date and origin of real museum artifacts. Over 230,000 of them from 10 museums. New daily run, play free.',
    url: `${baseUrl}/`,
    image: `${baseUrl}/api/og/site${ogParams.toString() ? `?${ogParams.toString()}` : ''}`,
  }

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Artifact Guesser',
    url: og.url,
    description: 'A free game where you guess the country and date of real museum artifacts.',
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
    description: 'Guess where real museum artifacts are from and when they were made. Over 230,000 artifacts from 10 museums, with a daily challenge, unlimited play, and multiplayer. Free.',
    applicationCategory: 'GameApplication',
    genre: 'History',
    operatingSystem: 'Any',
    browserRequirements: 'Requires JavaScript',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    featureList: [
      'Daily artifact challenge',
      'Unlimited single-player mode',
      'Multiplayer lobbies',
      '230,000+ real artifacts from 10 museums',
    ],
  }

  return { props: { og, jsonLd: [websiteSchema, webAppSchema] } }
}
