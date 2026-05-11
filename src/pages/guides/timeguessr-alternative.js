import Head from 'next/head'
import Link from 'next/link'
import { Layout } from '@/components/layout/Layout'
import { guidesTheme } from './index'
import { GiAmphora } from 'react-icons/gi'

export default function TimeGuessr() {
  return (
    <>
      <Head>
        <title>Best TimeGuessr Alternatives in 2025 — Artifact Guesser</title>
        <meta
          name="description"
          content="Looking for a TimeGuessr alternative? Artifact Guesser is a free daily history guessing game — guess the date &amp; origin of real museum artifacts. New puzzle every day."
        />
        <meta property="og:title" content="Best TimeGuessr Alternatives in 2025 — Artifact Guesser" />
        <meta
          property="og:description"
          content="Looking for a TimeGuessr alternative? Artifact Guesser is a free daily history guessing game — guess the date and origin of real museum artifacts. New puzzle every day."
        />
        <meta property="og:type" content="article" />
        <link rel="canonical" href="https://artifactguesser.com/guides/timeguessr-alternative" />
        <link rel="icon" href="/icon-sm.png" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Article',
              headline: 'Best TimeGuessr Alternatives in 2025',
              description:
                'Looking for a TimeGuessr alternative? This guide covers the best free daily history guessing games, including Artifact Guesser — a Wordle-style history quiz using real museum artifacts.',
              url: 'https://artifactguesser.com/guides/timeguessr-alternative',
              author: {
                '@type': 'Organization',
                name: 'Artifact Guesser',
                url: 'https://artifactguesser.com',
              },
              publisher: {
                '@type': 'Organization',
                name: 'Artifact Guesser',
                url: 'https://artifactguesser.com',
              },
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
                  {
                    '@type': 'ListItem',
                    position: 3,
                    name: 'Best TimeGuessr Alternatives in 2025',
                    item: 'https://artifactguesser.com/guides/timeguessr-alternative',
                  },
                ],
              },
            }),
          }}
        />
      </Head>
      <Layout
        title="Best TimeGuessr Alternatives in 2025"
        theme={guidesTheme}
        contentCSS={{
          fontFamily: 'monospace',
          background: 'linear-gradient(180deg, var(--backgroundColor), var(--backgroundColorDark))',
          minHeight: '100vh',
        }}
      >
        <div className="max-w-3xl mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <nav className="text-sm mb-6" css={{ color: 'var(--textLowOpacity)' }}>
            <Link href="/" className="hover:underline">Home</Link>
            {' / '}
            <Link href="/guides" className="hover:underline">Guides</Link>
            {' / '}
            <span>TimeGuessr Alternatives</span>
          </nav>

          <div className="flex items-center mb-3">
            <GiAmphora className="mr-3 text-xl" />
            <span className="text-xs uppercase" css={{ color: 'var(--primaryColor)', letterSpacing: '0.1em' }}>Comparison Guide</span>
          </div>

          <h1 className="text-2xl font-bold mb-4" css={{ lineHeight: 1.3 }}>
            Best TimeGuessr Alternatives in 2025
          </h1>

          <p className="mb-6" css={{ lineHeight: 1.8, color: 'var(--textLowOpacity)' }}>
            TimeGuessr is a great game — drop a pin on a world map and guess where a photo was taken.
            But if you&#39;ve burned through your daily runs and want something with a deeper historical
            dimension, you&#39;re in the right place. This guide covers the best free daily history
            guessing games you can play right now, with a focus on what makes each one tick.
          </p>

          <h2 className="text-xl font-bold mt-8 mb-3">What Makes a Good History Guessing Game?</h2>
          <p className="mb-4" css={{ lineHeight: 1.8, color: 'var(--textLowOpacity)' }}>
            The best Wordle-style history quizzes share a few things: a daily challenge structure
            (same puzzle for everyone, so you can compare scores), a time element (guessing the era
            or specific date), and a geography element (guessing the origin or culture). Games that
            nail all three reward genuine historical knowledge rather than just visual pattern
            matching.
          </p>

          <h2 className="text-xl font-bold mt-8 mb-3">Artifact Guesser — Guess the Date &amp; Origin of Museum Artifacts</h2>
          <p className="mb-3" css={{ lineHeight: 1.8, color: 'var(--textLowOpacity)' }}>
            <strong>Artifact Guesser</strong> is the closest thing to a TimeGuessr alternative
            if what you actually love is history. Instead of geolocating street photos, you&#39;re
            looking at real artifacts sourced from the Metropolitan Museum of Art collection and
            guessing two things:
          </p>
          <ul className="list-disc ml-6 mb-4" css={{ color: 'var(--textLowOpacity)', lineHeight: 2 }}>
            <li><strong>Date</strong> — when was this artifact made? Pin the year on a timeline that spans thousands of years.</li>
            <li><strong>Origin</strong> — which country or region did this artifact come from? Pin it on a world map.</li>
          </ul>
          <p className="mb-4" css={{ lineHeight: 1.8, color: 'var(--textLowOpacity)' }}>
            Your score on each round depends on how close your guesses are. The daily artifact
            challenge gives everyone the same three artifacts — making it a proper Wordle-style
            daily quiz you can share and compare. The unlimited mode lets you keep playing with
            fresh random artifacts whenever you want.
          </p>
          <p className="mb-4" css={{ lineHeight: 1.8, color: 'var(--textLowOpacity)' }}>
            It&#39;s completely free to play. No download, no signup required for the unlimited
            mode — just open the browser and start guessing.
          </p>
          <div className="my-6 p-4 rounded" css={{ background: 'var(--backgroundColorBarelyLight)', border: '1px solid var(--primaryColor)' }}>
            <div className="font-bold mb-2">&#x1F3DB; Try it now</div>
            <div className="text-sm mb-3" css={{ color: 'var(--textLowOpacity)' }}>
              Play today&#39;s free daily artifact challenge — guess the date and origin of 3
              real museum artifacts.
            </div>
            <Link href="/daily" className="text-blue-400 hover:underline font-bold">
              Play Today&#39;s Daily Artifact Challenge →
            </Link>
          </div>

          <h2 className="text-xl font-bold mt-8 mb-3">How Artifact Guesser Scoring Works</h2>
          <p className="mb-4" css={{ lineHeight: 1.8, color: 'var(--textLowOpacity)' }}>
            Each round is scored out of 200 points — 100 for the date guess and 100 for the
            origin guess. A perfect daily run scores 600/600. The closer your guess, the more
            points you earn: a date guess within a few decades or an origin guess within a
            neighboring country still scores well. This proximity-based scoring is what makes
            the game genuinely educational — you&#39;re not just right or wrong, you&#39;re
            learning the rough era and region of artifacts even when you don&#39;t know the
            exact answer.
          </p>

          <h2 className="text-xl font-bold mt-8 mb-3">Google Arts &amp; Culture Artifact Guessr</h2>
          <p className="mb-4" css={{ lineHeight: 1.8, color: 'var(--textLowOpacity)' }}>
            Google&#39;s Arts &amp; Culture platform has a geo-artwork experiment that asks you
            to place artworks on a map. It&#39;s fun and polished, but it only covers the
            geography dimension — there&#39;s no date-guessing element, no daily challenge
            structure, and no scoring comparison with other players. If you want the full
            Wordle-style daily history quiz experience with both date and origin guessing,
            Artifact Guesser covers more ground.
          </p>

          <h2 className="text-xl font-bold mt-8 mb-3">Why Daily Structure Matters</h2>
          <p className="mb-4" css={{ lineHeight: 1.8, color: 'var(--textLowOpacity)' }}>
            The daily challenge format — the same artifacts for everyone on the same day — is
            what turns a history guessing game into a social ritual. You play in the morning,
            share your 600-point score (or your embarrassing 140/600), and see how your history
            knowledge stacks up. Artifact Guesser&#39;s{' '}
            <Link href="/daily" className="text-blue-400 hover:underline">daily artifact challenge</Link>
            {' '}resets every day with a new set of three artifacts.
          </p>

          <h2 className="text-xl font-bold mt-8 mb-3">Multiplayer — Play Against Friends</h2>
          <p className="mb-4" css={{ lineHeight: 1.8, color: 'var(--textLowOpacity)' }}>
            One feature that sets Artifact Guesser apart from most TimeGuessr alternatives is
            its{' '}
            <Link href="/multiplayer" className="text-blue-400 hover:underline">multiplayer mode</Link>.
            {' '}Create a lobby, invite friends, and race through the same set of artifacts
            simultaneously. Real-time scoring makes it a proper group history game — great for
            pub quiz nights or classroom settings.
          </p>

          <h2 className="text-xl font-bold mt-8 mb-3">Bottom Line</h2>
          <p className="mb-6" css={{ lineHeight: 1.8, color: 'var(--textLowOpacity)' }}>
            If you love TimeGuessr because it tests your knowledge of place and context,
            Artifact Guesser scratches the same itch but goes deeper into history. You&#39;re
            looking at objects — tools, coins, sculptures, ceramics — that survived thousands
            of years, and you&#39;re trying to place them in time and space. It&#39;s a free
            daily history game, a museum artifact quiz, and a Wordle-style challenge all rolled
            into one.
          </p>

          <div className="my-6 p-4 rounded" css={{ background: 'var(--backgroundColorBarelyLight)', border: '1px solid var(--textVeryLowOpacity)' }}>
            <div className="font-bold mb-2">More from Artifact Guesser</div>
            <ul className="text-sm" css={{ color: 'var(--textLowOpacity)', lineHeight: 2 }}>
              <li>
                <Link href="/daily" className="text-blue-400 hover:underline">Today&#39;s Daily Artifact Challenge</Link>
                {' '}— 3 artifacts, same for everyone
              </li>
              <li>
                <Link href="/" className="text-blue-400 hover:underline">Unlimited Mode</Link>
                {' '}— keep playing with random artifacts
              </li>
              <li>
                <Link href="/multiplayer" className="text-blue-400 hover:underline">Multiplayer</Link>
                {' '}— challenge friends in real time
              </li>
              <li>
                <Link href="/guides" className="text-blue-400 hover:underline">More Guides</Link>
              </li>
            </ul>
          </div>
        </div>
      </Layout>
    </>
  )
}
