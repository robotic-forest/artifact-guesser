import Head from 'next/head'
import Link from 'next/link'
import { Layout } from '@/components/layout/Layout'
import { blogTheme } from './index'

export default function HowToPlay() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'How to Play Artifact Guesser: Guess the Date & Origin of Historical Artifacts',
    description:
      'A complete guide to playing Artifact Guesser — the free daily artifact guessing game. Learn how to guess the date and origin of historical artifacts, how scoring works, and tips to improve.',
    url: 'https://artifactguesser.com/blog/how-to-play-artifact-guesser',
    datePublished: '2025-05-01',
    author: {
      '@type': 'Organization',
      name: 'Artifact Guesser',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Artifact Guesser',
      url: 'https://artifactguesser.com',
    },
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://artifactguesser.com' },
        { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://artifactguesser.com/blog' },
        {
          '@type': 'ListItem',
          position: 3,
          name: 'How to Play Artifact Guesser',
          item: 'https://artifactguesser.com/blog/how-to-play-artifact-guesser',
        },
      ],
    },
  }

  return (
    <>
      <Head>
        <title>How to Play Artifact Guesser — Guess Date &amp; Origin of Artifacts</title>
        <meta name="viewport" content="initial-scale=1.0, maximum-scale=1, width=device-width" />
        <meta
          name="description"
          content="Complete guide to Artifact Guesser: how to guess the date and origin of historical artifacts, how scoring works, daily challenge tips, and why it's the best free history guessing game online."
        />
        <meta property="og:title" content="How to Play Artifact Guesser — Guess Date &amp; Origin of Artifacts" />
        <meta
          property="og:description"
          content="Complete guide to Artifact Guesser: how to guess the date and origin of historical artifacts, how scoring works, daily challenge tips, and why it's the best free history guessing game online."
        />
        <meta property="og:type" content="article" />
        <meta
          property="og:url"
          content="https://artifactguesser.com/blog/how-to-play-artifact-guesser"
        />
        <link rel="canonical" href="https://artifactguesser.com/blog/how-to-play-artifact-guesser" />
        <link rel="icon" href="/icon-sm.png" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </Head>

      <Layout
        title="How to Play Artifact Guesser"
        theme={blogTheme}
        contentCSS={{
          fontFamily: 'monospace',
          background: 'linear-gradient(180deg, var(--backgroundColor), var(--backgroundColorDark))',
          minHeight: '100vh',
        }}
      >
        <article className="max-w-2xl mx-auto py-8 px-4">
          {/* Breadcrumb */}
          <nav className="text-xs mb-6" css={{ opacity: 0.6 }} aria-label="Breadcrumb">
            <Link href="/" className="hover:underline">Home</Link>
            {' / '}
            <Link href="/blog" className="hover:underline">Blog</Link>
            {' / '}
            <span>How to Play</span>
          </nav>

          <h1 className="text-2xl font-bold mb-2 leading-tight">
            How to Play Artifact Guesser: Guess the Date &amp; Origin of Historical Artifacts
          </h1>

          <p className="text-sm mb-8" css={{ opacity: 0.55 }}>Updated May 2025</p>

          <p className="mb-5" css={{ lineHeight: 1.8 }}>
            <Link href="/" className="text-blue-400 hover:underline">Artifact Guesser</Link>{' '}
            is a free browser-based history guessing game where you’re shown photographs of real
            historical artifacts from museum collections around the world. Your job: guess where the
            artifact is from and when it was made. The closer your guesses, the higher your score.
          </p>

          <p className="mb-5" css={{ lineHeight: 1.8 }}>
            If you’ve played Wordle, GeoGuessr, or TimeGuessr, you already understand the format.
            Artifact Guesser takes the same satisfying daily-puzzle structure and applies it to the
            world of archaeology and museum collections — making it one of the best free daily
            history games online for anyone curious about the ancient world.
          </p>

          <h2 className="text-xl font-bold mt-8 mb-3">The Basic Mechanics</h2>

          <p className="mb-4" css={{ lineHeight: 1.8 }}>
            Each game (or “run”) consists of multiple rounds. In every round you’re shown one or
            more high-resolution photographs of a single artifact. Two things are hidden from you:
          </p>

          <ul className="list-disc ml-6 mb-5" css={{ lineHeight: 1.9 }}>
            <li>
              <strong>The date</strong> — when the artifact was created or deposited. You guess
              by sliding a timeline to a specific year.
            </li>
            <li>
              <strong>The origin</strong> — which country the artifact comes from. You guess by
              clicking a location on a world map.
            </li>
          </ul>

          <p className="mb-5" css={{ lineHeight: 1.8 }}>
            Once you’ve placed both guesses and hit “Submit”, the round reveals the correct
            answers. You’ll see how far off your date guess was (in years) and how far off your
            location guess was (in kilometres). Points are deducted based on the margin of error.
          </p>

          <h2 className="text-xl font-bold mt-8 mb-3">How Scoring Works</h2>

          <p className="mb-4" css={{ lineHeight: 1.8 }}>
            Artifact Guesser uses a combined scoring system. Each round awards up to 200 points:
            100 for the date guess and 100 for the origin/location guess. Across three rounds that’s
            a maximum of 600 points — the perfect score.
          </p>

          <ul className="list-disc ml-6 mb-5" css={{ lineHeight: 1.9 }}>
            <li>
              <strong>Date score:</strong> The fewer years off you are, the higher your date score.
              An exact match gives a perfect 100. A guess hundreds of years off scores near zero.
            </li>
            <li>
              <strong>Origin score:</strong> The score decreases with geographic distance from the
              correct country. Neighbouring countries score nearly as well as a direct hit.
            </li>
          </ul>

          <p className="mb-5" css={{ lineHeight: 1.8 }}>
            Scores above 500/600 are considered excellent. A perfect 600 requires exact knowledge
            of both the date and the artifact’s origin — or an extraordinary lucky guess.
          </p>

          <h2 className="text-xl font-bold mt-8 mb-3">The Daily Artifact Challenge</h2>

          <p className="mb-4" css={{ lineHeight: 1.8 }}>
            Every day a new set of artifacts is selected for the{' '}
            <Link href="/daily" className="text-blue-400 hover:underline">
              daily artifact challenge
            </Link>
            . The same artifacts are shown to every player worldwide, so your score is directly
            comparable. This is the Wordle-style element: one puzzle per day, shared globally,
            and you can share your result without spoiling the answers.
          </p>

          <p className="mb-5" css={{ lineHeight: 1.8 }}>
            The daily run resets at midnight UTC. If you start a run and don’t finish it, the
            game saves your progress automatically — you can pick up where you left off.
          </p>

          <h2 className="text-xl font-bold mt-8 mb-3">Tips for Guessing Artifact Origins</h2>

          <ul className="list-disc ml-6 mb-5" css={{ lineHeight: 1.9 }}>
            <li>
              <strong>Look at the style, not just the material.</strong> Egyptian artifacts often
              feature hieroglyphs or distinctive bas-relief carving. Greek pottery has characteristic
              red-figure or black-figure painting. Roman bronze and marble have distinct finishing.
            </li>
            <li>
              <strong>Read the form carefully.</strong> Amphorae point to the Mediterranean.
              Jade objects are overwhelmingly East Asian. Terracotta warrior fragments are almost
              certainly Chinese.
            </li>
            <li>
              <strong>Check for inscriptions.</strong> Script style narrows geography dramatically.
              Cuneiform = Mesopotamia. Hieroglyphs = Egypt. Chinese characters = East Asia.
            </li>
            <li>
              <strong>Use the map zoom.</strong> On desktop you can zoom the origin map to place
              a very precise guess — this is worth doing for artefacts you’re fairly confident about.
            </li>
          </ul>

          <h2 className="text-xl font-bold mt-8 mb-3">Tips for Guessing Artifact Dates</h2>

          <ul className="list-disc ml-6 mb-5" css={{ lineHeight: 1.9 }}>
            <li>
              <strong>Understand the collection bias.</strong> The Metropolitan Museum of Art (the
              primary source for Artifact Guesser’s database) holds objects from 3000 BCE to the
              modern era, with a heavy concentration in ancient Mediterranean and Near East material
              from 3000–100 BCE.
            </li>
            <li>
              <strong>Metal artifacts are often older than they look.</strong> Bronze survives
              exceptionally well. A pristine-looking bronze helmet may be 2,500 years old.
            </li>
            <li>
              <strong>Condition is not a reliable age signal.</strong> Well-preserved limestone
              carvings can date to 3000 BCE; poorly preserved medieval ironwork may be only 800 years old.
            </li>
            <li>
              <strong>Start with a wide bracket.</strong> On the timeline, place your initial guess
              in the centre of the probable period (e.g. “this looks Bronze Age — 1500 BCE”) rather
              than agonising over the exact century.
            </li>
          </ul>

          <h2 className="text-xl font-bold mt-8 mb-3">Free vs. Logged-In Play</h2>

          <p className="mb-4" css={{ lineHeight: 1.8 }}>
            You can{' '}
            <Link href="/" className="text-blue-400 hover:underline">
              play Artifact Guesser completely free
            </Link>{' '}
            without creating an account. Guest play gives you access to the main game and the daily
            challenge. Creating a free account unlocks leaderboard rankings, game history, the
            artifact favourites list, and multiplayer lobbies.
          </p>

          <h2 className="text-xl font-bold mt-8 mb-3">Why Artifact Guesser Is Different</h2>

          <p className="mb-4" css={{ lineHeight: 1.8 }}>
            Unlike geography games that show street-level photography, Artifact Guesser is a
            pure <em>historical</em> artifact guessing game — every object in the database is a
            real museum piece with verified provenance data. The challenge isn’t just geography:
            it’s archaeology, art history, and chronology all at once.
          </p>

          <p className="mb-8" css={{ lineHeight: 1.8 }}>
            The artifacts come from the{' '}
            <a
              href="https://www.metmuseum.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:underline"
            >
              Metropolitan Museum of Art
            </a>
            , with more museum sources in development. This means you’re guessing on objects that
            have been researched, dated, and attributed by professional archaeologists and curators —
            making every answer verifiable and genuinely educational.
          </p>

          <div className="rounded p-4 mt-4 mb-8" css={{ background: 'var(--backgroundColorBarelyLight)' }}>
            <p className="font-bold mb-1">Ready to play?</p>
            <p className="text-sm" css={{ lineHeight: 1.7 }}>
              Start with the{' '}
              <Link href="/daily" className="text-blue-400 hover:underline">
                daily artifact challenge
              </Link>{' '}
              for a shared experience, or jump straight into the{' '}
              <Link href="/" className="text-blue-400 hover:underline">
                free artifact guessing game
              </Link>{' '}
              for unlimited practice rounds.
            </p>
          </div>

          <nav className="text-sm mt-8" css={{ opacity: 0.6 }}>
            <Link href="/blog" className="text-blue-400 hover:underline">
              ← Back to Blog
            </Link>
          </nav>
        </article>
      </Layout>
    </>
  )
}
