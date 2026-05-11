import Head from 'next/head'
import Link from 'next/link'
import { Layout } from '@/components/layout/Layout'
import { artifactsTheme } from '@/pages/artifacts'
import { GiAmphora } from 'react-icons/gi'

export const guidesTheme = {
  backgroundColor: '#1a1a2e',
  primaryColor: '#ac9a8c',
  textColor: '#ffffff',
}

export const guides = [
  {
    slug: 'timeguessr-alternative',
    title: 'Best TimeGuessr Alternatives in 2025',
    description:
      'Looking for a TimeGuessr alternative? Artifact Guesser is a free daily history game where you guess the date and origin of real museum artifacts — no photos of streets, just pure history.',
    category: 'Comparisons',
  },
]

export default function GuidesIndex() {
  return (
    <>
      <Head>
        <title>Guides &amp; How-to Articles — Artifact Guesser</title>
        <meta
          name="description"
          content="Guides, tips, and comparisons for history guessing games. Learn how to play Artifact Guesser, how scoring works, and how it compares to TimeGuessr and other daily history games."
        />
        <meta property="og:title" content="Guides &amp; How-to Articles — Artifact Guesser" />
        <meta
          property="og:description"
          content="Guides, tips, and comparisons for history guessing games. Learn how Artifact Guesser works and how it compares to TimeGuessr and other free daily history games."
        />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://artifactguesser.com/guides" />
        <link rel="icon" href="/icon-sm.png" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'CollectionPage',
              name: 'Guides — Artifact Guesser',
              description:
                'Guides, tips, and comparisons for history guessing games including Artifact Guesser.',
              url: 'https://artifactguesser.com/guides',
              breadcrumb: {
                '@type': 'BreadcrumbList',
                itemListElement: [
                  {
                    '@type': 'ListItem',
                    position: 1,
                    name: 'Home',
                    item: 'https://artifactguesser.com/',
                  },
                  {
                    '@type': 'ListItem',
                    position: 2,
                    name: 'Guides',
                    item: 'https://artifactguesser.com/guides',
                  },
                ],
              },
            }),
          }}
        />
      </Head>
      <Layout title="Guides — Artifact Guesser" theme={guidesTheme} contentCSS={{
        fontFamily: 'monospace',
        background: 'linear-gradient(180deg, var(--backgroundColor), var(--backgroundColorDark))',
        minHeight: '100vh',
      }}>
        <div className="max-w-3xl mx-auto px-4 py-8">
          <div className="flex items-center mb-2">
            <GiAmphora className="mr-3 text-2xl" />
            <h1 className="text-2xl font-bold">Guides &amp; Articles</h1>
          </div>
          <p className="mb-8" css={{ color: 'var(--textLowOpacity)', lineHeight: 1.7 }}>
            How-to articles, scoring tips, and comparisons for fans of history guessing games.
            Learn what makes Artifact Guesser different, how scoring works, and where it fits
            alongside other daily history games like TimeGuessr.
          </p>

          <h2 className="text-sm font-bold uppercase mb-4" css={{ color: 'var(--primaryColor)', letterSpacing: '0.08em' }}>
            Comparisons
          </h2>
          <div className="grid gap-4">
            {guides
              .filter(g => g.category === 'Comparisons')
              .map(guide => (
                <Link key={guide.slug} href={`/guides/${guide.slug}`}>
                  <div
                    className="p-4 rounded cursor-pointer"
                    css={{
                      background: 'var(--backgroundColorBarelyLight)',
                      border: '1px solid var(--textVeryLowOpacity)',
                      '&:hover': { background: 'var(--backgroundColorSlightlyLight)' },
                    }}
                  >
                    <div className="font-bold mb-1">{guide.title}</div>
                    <div className="text-sm" css={{ color: 'var(--textLowOpacity)', lineHeight: 1.6 }}>
                      {guide.description}
                    </div>
                  </div>
                </Link>
              ))}
          </div>

          <div className="mt-12 p-4 rounded" css={{ background: 'var(--backgroundColorBarelyLight)', border: '1px solid var(--textVeryLowOpacity)' }}>
            <div className="font-bold mb-2">Ready to play?</div>
            <div className="text-sm mb-3" css={{ color: 'var(--textLowOpacity)' }}>
              Try today&#39;s free{' '}
              <Link href="/daily" className="text-blue-400 hover:underline">daily artifact challenge</Link>
              {' '}or jump into an{' '}
              <Link href="/" className="text-blue-400 hover:underline">unlimited game</Link>.
            </div>
          </div>
        </div>
      </Layout>
    </>
  )
}
