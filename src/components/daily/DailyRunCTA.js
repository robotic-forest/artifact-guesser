import Link from 'next/link'
import useSWR from 'swr'
import { useEffect, useState } from 'react'
import { IoCalendar } from 'react-icons/io5'

export const DailyRunCTA = () => {
  const today = new Date().toISOString().slice(0, 10)

  // Anonymous players are tracked by a localStorage id; read it client-side so
  // we can ask the server whether THIS browser already played today.
  const [anonymousId, setAnonymousId] = useState(null)
  const [ready, setReady] = useState(false)
  useEffect(() => {
    try { setAnonymousId(localStorage.getItem('ag_anon_id')) } catch {}
    setReady(true)
  }, [])

  const statusKey = ready
    ? `/api/daily/status${anonymousId ? `?anonymousId=${anonymousId}` : ''}`
    : null
  const { data: status, error: statusError } = useSWR(statusKey)

  const { data } = useSWR(`/api/daily/leaderboard?dateKey=${today}`)
  const top = data?.scores?.[0]

  // Wait until we actually know this player's status before showing anything —
  // otherwise the banner would flash in and then vanish for someone who already
  // played, which is exactly the behaviour we're fixing.
  const statusResolved = status !== undefined || statusError
  if (!ready || !statusResolved) return null

  // Hide the CTA entirely once today's run is done for this player.
  if (status?.completed) return null

  return (
    <Link href='/daily' css={{ textDecoration: 'none', color: 'inherit' }}>
      <div css={{
        position: 'fixed',
        top: 56,
        '@media (max-width: 600px)': { top: 80 },
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '5px 28px',
        background: 'rgba(79, 149, 255, 0.35)',
        backdropFilter: 'blur(6px)',
        color: '#fff',
        border: '1px solid #4f95ff',
        borderRadius: 999,
        boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
        cursor: 'pointer',
        fontWeight: 600,
        fontSize: 12,
        whiteSpace: 'nowrap',
        transition: 'background 0.15s',
        '&:hover': {
          background: 'rgba(79, 149, 255, 0.7)',
        },
      }}>
        <IoCalendar size={14} />
        <span>Play Today's Run</span>
        {top && (
          <>
            <span css={{ opacity: 0.7 }}>·</span>
            <span css={{ fontSize: 12, fontWeight: 600, opacity: 0.95 }}>
              Current Highscore: {top.score} / 600
            </span>
          </>
        )}
      </div>
    </Link>
  )
}
