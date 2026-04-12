import { ImageResponse } from '@vercel/og'

export const config = {
  runtime: 'edge',
}

/**
 * GET /api/og/daily?score=N&dateKey=YYYY-MM-DD&by=username&tease=<https-image-url>
 *
 * Generates a dynamic Open Graph card for a daily-run share.
 * Returns a 1200x630 PNG.
 *
 * All params are optional — defaults render a generic "Today's Run" card.
 */
export default function handler(req) {
  const url = new URL(req.url)
  const origin = url.origin
  const { searchParams } = url
  const score = searchParams.get('score')
  const dateKey = searchParams.get('dateKey') || ''
  const by = searchParams.get('by') || ''
  const tease = searchParams.get('tease') || ''
  const mode = searchParams.get('mode') || '' // 'challenge' for challenge cards

  // Format the date nicely (e.g. "April 11, 2026")
  let dateLabel = ''
  if (dateKey) {
    try {
      const d = new Date(dateKey + 'T12:00:00Z')
      dateLabel = d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    } catch {}
  }

  const hasScore = score !== null && score !== ''
  const scoreNum = hasScore ? Number(score) : null
  const scoreColor =
    scoreNum === 600 ? '#00ff88' :
    scoreNum >= 420 ? '#7ae990' :
    scoreNum >= 300 ? '#ffc045' :
    scoreNum >= 0 ? '#ff8a45' : '#ffffff'

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
        {/* Random artifact image on the right — full opacity, doesn't
             reveal today's run since it's a random highlight, just visual intrigue */}
        {tease && (
          <div
            style={{
              display: 'flex',
              position: 'absolute',
              top: 30,
              right: 30,
              bottom: 30,
              width: 480,
              borderRadius: 0,
              overflow: 'hidden',
            }}
          >
            <img
              src={tease}
              width={480}
              height={570}
              style={{
                objectFit: 'cover',
              }}
            />
          </div>
        )}

        {/* Left content */}
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
              color: '#ffffff',
              fontWeight: 700,
              marginBottom: 8,
            }}
          >
            <img
              src={`${origin}/icon-sm.png`}
              style={{ width: 36, height: 36, marginRight: 24 }}
            />
            ARTIFACT GUESSER
          </div>

          <div
            style={{
              display: 'flex',
              fontSize: 62,
              fontWeight: 900,
              letterSpacing: -1,
              marginBottom: 6,
              lineHeight: 1,
              color: '#4f95ff',
            }}
          >
            TODAY'S RUN
          </div>

          {dateLabel && (
            <div
              style={{
                display: 'flex',
                fontSize: 26,
                color: 'rgba(255,255,255,0.55)',
                marginBottom: 40,
              }}
            >
              {dateLabel}
            </div>
          )}

          {hasScore ? (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {by && (
                <div
                  style={{
                    display: 'flex',
                    fontSize: 28,
                    color: mode === 'challenge' ? '#ffc045' : 'rgba(255,255,255,0.7)',
                    fontWeight: mode === 'challenge' ? 700 : 400,
                    marginBottom: 8,
                  }}
                >
                  {mode === 'challenge' ? `${by} challenges you!` : `${by} scored`}
                </div>
              )}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  marginBottom: 28,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    fontSize: 120,
                    fontWeight: 900,
                    color: scoreColor,
                    lineHeight: 1,
                    letterSpacing: -3,
                  }}
                >
                  {score}
                </div>
                <div
                  style={{
                    display: 'flex',
                    fontSize: 36,
                    color: 'rgba(255,255,255,0.4)',
                    marginLeft: 10,
                  }}
                >
                  / 600
                </div>
              </div>
              <div
                style={{
                  display: 'flex',
                  fontSize: 34,
                  color: '#ffc045',
                  fontWeight: 700,
                }}
              >
                Can you beat it?
              </div>
            </div>
          ) : (
            <div
              style={{
                display: 'flex',
                fontSize: 36,
                color: 'rgba(255,255,255,0.8)',
                marginTop: 20,
              }}
            >
              Same 3 artifacts for everyone today.
            </div>
          )}
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}
