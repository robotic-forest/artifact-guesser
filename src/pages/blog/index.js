import Head from 'next/head'
import Link from 'next/link'
import { Layout } from '@/components/layout/Layout'
import { artifactsTheme } from '@/pages/artifacts'
import { GiAmphora } from 'react-icons/gi'

export const blogTheme = {
  backgroundColor: '#1a1a2e',
  primaryColor: '#7c6f5b',
  textColor: '#f0ece6',
}

const articles = [
  {
    slug: 'how-to-play-artifact-guesser',
    title: 'How to Play Artifact Guesser: Guess Date & Origin of Historical Artifacts',
    description:
      'Learn how to guess the date and origin of ancient artifacts, understand the scoring system, and tips for getting a perfect score in each daily run.',
    date: '2025-05-01',
  },
]

export default function BlogIndex() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Artifact Guesser Blog — Guides & Tips',
    description:
      'Guides, tips, and deep-dives for Artifact Guesser — the free daily artifact guessing game where you guess the date and origin of historical artifacts.',
    url: 'https://artifactguesser.com/blog',
    publisher: {
      '@type': 'Organization',
      name: 'Artifact Guesser',
      url: 'https://artifactguesser.com',
    },
    hasPart: articles.map((a) => ({
      '@type': 'Article',
      headline: a.title,
      url: `https://artifactguesser.com/blog/${a.slug}`,
    })),
  }

  return (
    <>
      <Head>
        <title>Artifact Guesser Blog — Guides, Tips &amp; History</title>
        <meta name="viewport" content="initial-scale=1.0, maximum-scale=1, width=device-width" />
        <meta
          name="description"
          content="Guides and tips for Artifact Guesser — the free history guessing game online. Learn how to guess dates and origins of museum artifacts, improve your score, and more."
        />
        <meta property="og:title" content="Artifact Guesser Blog — Guides, Tips &amp; History" />
        <meta
          property="og:description"
          content="Guides and tips for Artifact Guesser — the free history guessing game online. Learn how to guess dates and origins of museum artifacts, improve your score, and more."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://artifactguesser.com/blog" />
        <link rel="canonical" href="https://artifactguesser.com/blog" />
        <link rel="icon" href="/icon-sm.png" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </Head>

      <Layout title="Blog" theme={blogTheme} contentCSS={{
        fontFamily: 'monospace',
        background: 'linear-gradient(180deg, var(--backgroundColor), var(--backgroundColorDark))',
        minHeight: '100vh',
      }}>
        <div className="max-w-2xl mx-auto py-8 px-4">
          <div className="flex items-center justify-center mb-2">
            <GiAmphora className="mr-3 text-2xl" />
            <h1 className="text-2xl font-bold text-center">
              Artifact Guesser Blog
            </h1>
            <GiAmphora className="ml-3 text-2xl" style={{ transform: 'scaleX(-1)' }} />
          </div>

          <p className="text-center mb-8" css={{ opacity: 0.8, lineHeight: 1.7 }}>
            Guides, strategies, and deep-dives for{' '}
            <Link href="/" className="text-blue-400 hover:underline">
              Artifact Guesser
            </Link>
            {' '}— the free daily artifact guessing game where you guess the date and origin
            of historical artifacts from world-class museums. Whether you&apos;re a first-time
            player looking to understand the mechanics, or a veteran chasing a perfect 600
            score on the{' '}
            <Link href="/daily" className="text-blue-400 hover:underline">
              daily artifact challenge
            </Link>
            , you&apos;ll find tips and context here.
          </p>

          <h2 className="text-lg font-bold mb-4 mt-6" css={{ borderBottom: '1px solid var(--textSuperLowOpacity)', paddingBottom: 8 }}>
            Getting Started
          </h2>

          <div className="flex flex-col gap-4">
            {articles.map((article) => (
              <Link
                key={article.slug}
                href={`/blog/${article.slug}`}
                className="block rounded p-4 hover:opacity-90 transition-opacity"
                css={{ background: 'var(--backgroundColorBarelyLight)' }}
              >
                <div className="font-bold mb-1">{article.title}</div>
                <div className="text-sm" css={{ opacity: 0.75, lineHeight: 1.6 }}>
                  {article.description}
                </div>
                <div className="text-xs mt-2" css={{ opacity: 0.5 }}>
                  {article.date}
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-10 text-center text-sm" css={{ opacity: 0.6 }}>
            Want more guides?{' '}
            <a
              href="https://discord.gg/MvkqPTdcwm"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:underline"
            >
              Join the Discord
            </a>
            {' '}or{' '}
            <a
              href="https://reddit.com/r/artifactguesser"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:underline"
            >
              r/artifactguesser
            </a>
            {' '}to suggest topics.
          </div>
        </div>
      </Layout>
    </>
  )
}
