import { ImageResponse } from '@vercel/og'

export const config = { runtime: 'edge' }

/**
 * GET /api/og/artifact?name=...&country=...&year=...&source=...&img=<https-image-url>
 *
 * Renders an OG card for a single artifact detail page. The page passes the
 * resolved artifact metadata via query params so this edge function can stay
 * dependency-free.
 */
const formatYear = (raw) => {
  if (raw === '' || raw == null) return ''
  const y = Number(raw)
  if (Number.isNaN(y)) return ''
  if (y < 0) return `${Math.abs(y)} BCE`
  return `${y} CE`
}

export default function handler(req) {
  const url = new URL(req.url)
  const origin = url.origin
  const { searchParams } = url
  const name = (searchParams.get('name') || 'Unknown Artifact').slice(0, 80)
  const country = searchParams.get('country') || ''
  const yearLabel = formatYear(searchParams.get('year'))
  const source = searchParams.get('source') || ''
  const img = searchParams.get('img') || ''

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
        {img && (
          <div
            style={{
              display: 'flex',
              position: 'absolute',
              top: 30,
              right: 30,
              bottom: 30,
              width: 480,
              overflow: 'hidden',
              background: '#111',
            }}
          >
            <img src={img} width={480} height={570} style={{ objectFit: 'cover' }} />
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
              fontSize: 24,
              letterSpacing: 4,
              fontWeight: 700,
              marginBottom: 18,
              color: 'rgba(255,255,255,0.85)',
            }}
          >
            <img src={`${origin}/icon-sm.png`} style={{ width: 28, height: 28, marginRight: 18 }} />
            ARTIFACT GUESSER
          </div>

          <div
            style={{
              display: 'flex',
              fontSize: 52,
              fontWeight: 900,
              letterSpacing: -1,
              lineHeight: 1.1,
              marginBottom: 26,
              color: '#ffffff',
            }}
          >
            {name}
          </div>

          {(country || yearLabel) && (
            <div
              style={{
                display: 'flex',
                fontSize: 28,
                color: '#4f95ff',
                fontWeight: 700,
                marginBottom: 14,
              }}
            >
              {[country, yearLabel].filter(Boolean).join(' · ')}
            </div>
          )}

          {source && (
            <div
              style={{
                display: 'flex',
                fontSize: 22,
                color: 'rgba(255,255,255,0.55)',
                marginBottom: 28,
              }}
            >
              {source}
            </div>
          )}

          <div
            style={{
              display: 'flex',
              fontSize: 22,
              color: '#ffc045',
              fontWeight: 700,
              marginTop: 'auto',
            }}
          >
            Explore the artifact database →
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  )
}
