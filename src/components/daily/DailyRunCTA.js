import Link from 'next/link'
import useSWR from 'swr'
import { IoCalendar } from 'react-icons/io5'

export const DailyRunCTA = () => {
  const today = new Date().toISOString().slice(0, 10)
  const { data } = useSWR(`/api/daily/leaderboard?dateKey=${today}`)
  const top = data?.scores?.[0]

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
