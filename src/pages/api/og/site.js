import { ImageResponse } from '@vercel/og'

export const config = { runtime: 'edge' }

/**
 * GET /api/og/site?tease=<https-image-url>
 *
 * Generic homepage Open Graph card. The page that links here (pages/index.js)
 * passes a freshly-sampled tease URL so every Discord/Twitter unfurl shows a
 * different artifact on the right panel.
 */
export default function handler(req) {
  const url = new URL(req.url)
  const origin = url.origin
  const tease = url.searchParams.get('tease') || ''

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          width: '100%',
          height: '100%',
          background: '#000000',
          position: 'relative',
          fontFamily: 'system-ui, sans-serif',
          color: '#ffffff',
        }}
      >
        {tease && (
          <div
            style={{
              display: 'flex',
              position: 'absolute',
              top: 30,
              right: 30,
              bottom: 30,
              width: 480,
              overflow: 'hidden',
            }}
          >
            <img src={tease} width={480} height={570} style={{ objectFit: 'cover' }} />
          </div>
        )}

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            padding: '60px 70px',
            width: 780,
            zIndex: 1,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              fontSize: 30,
              letterSpacing: 4,
              fontWeight: 700,
              marginBottom: 24,
            }}
          >
            <img src={`${origin}/icon-sm.png`} style={{ width: 36, height: 36, marginRight: 24 }} />
            ARTIFACT GUESSER
          </div>

          <div
            style={{
              display: 'flex',
              fontSize: 72,
              fontWeight: 900,
              letterSpacing: -2,
              marginBottom: 18,
              lineHeight: 1,
              color: '#4f95ff',
            }}
          >
            Guess the past.
          </div>

          <div
            style={{
              display: 'flex',
              fontSize: 30,
              color: 'rgba(255,255,255,0.85)',
              lineHeight: 1.25,
              marginBottom: 36,
            }}
          >
            Date and place real museum artifacts from across human history.
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              fontSize: 22,
              color: '#ffc045',
              fontWeight: 700,
            }}
          >
            New daily run every day · play free
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  )
}
