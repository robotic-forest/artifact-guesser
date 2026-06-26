import dynamic from 'next/dynamic'
import { useEffect, useRef, useState } from 'react'
import useSWR from 'swr'
import useUser from '@/hooks/useUser'
import { track } from '@/lib/analytics'
import { Game } from './Game'
import { DailyGame } from '../daily/DailyGame'
import { Spinner } from '../loading/Spinner'

const todayKey = () => new Date().toISOString().slice(0, 10)

// Cold-visitor entry gate (strategy "entry flip"): a visitor with no in-progress
// endless game who hasn't completed today's run lands on the daily run, which
// flows into endless via the daily summary's "Resume Personal Game" link once
// it's done. Pure UI on the same `/` URL — NO redirects — so the SEO'd homepage
// (and /daily) stay independently indexed. A per-day "skip to free play" escape
// keeps returning grinders from being toll-boothed.
const HomeEntryInner = () => {
  const { user } = useUser()

  const [ready, setReady] = useState(false)
  const [anonId, setAnonId] = useState(null)
  const [hasLocalGame, setHasLocalGame] = useState(false)
  const [skippedToday, setSkippedToday] = useState(false)
  const [mode, setMode] = useState(null) // 'daily' | 'endless'
  const tracked = useRef(false)

  useEffect(() => {
    try {
      setAnonId(localStorage.getItem('ag_anon_id'))
      setHasLocalGame(!!localStorage.getItem('game'))
      setSkippedToday(localStorage.getItem('skipDailyEntry') === todayKey())
    } catch {}
    setReady(true)
  }, [])

  // Today's daily completion: anon keyed by anonymousId, logged-in by session.
  const statusKey = ready ? `/api/daily/status${anonId ? `?anonymousId=${anonId}` : ''}` : null
  const { data: dailyStatus, error: statusErr } = useSWR(statusKey)

  // In-progress personal (endless) game — server-truth for logged-in users;
  // anon users carry it in localStorage ('game'), read above.
  const { data: activeRun } = useSWR(user?.isLoggedIn ? '/api/active-run' : null)

  useEffect(() => {
    if (mode) return // decide once
    if (!ready || !user) return
    const statusReady = dailyStatus !== undefined || statusErr
    const activeReady = !user.isLoggedIn || activeRun !== undefined
    if (!statusReady || !activeReady) return

    const inProgressEndless = user.isLoggedIn ? activeRun?.kind === 'personal' : hasLocalGame
    const dailyCompleted = !!dailyStatus?.completed
    setMode((!inProgressEndless && !dailyCompleted && !skippedToday) ? 'daily' : 'endless')
  }, [ready, user, dailyStatus, statusErr, activeRun, hasLocalGame, skippedToday, mode])

  // Tag the entry path so we can watch daily-start vs endless-start (cannibalization).
  useEffect(() => {
    if (mode && !tracked.current) {
      tracked.current = true
      track('home_entry', { mode, skipped: skippedToday })
    }
  }, [mode, skippedToday])

  const skipToEndless = () => {
    try { localStorage.setItem('skipDailyEntry', todayKey()) } catch {}
    track('home_entry_skip', {})
    setMode('endless')
  }

  if (!mode) {
    return (
      <div className='fixed inset-0 flex items-center justify-center' css={{ background: 'black' }}>
        <Spinner />
      </div>
    )
  }

  if (mode === 'daily') {
    return (
      <>
        <DailyGame />
        <button
          onClick={skipToEndless}
          title='Skip to the endless free-play game'
          className='fixed z-50'
          css={{
            top: 8,
            left: '50%',
            transform: 'translateX(-50%)',
            '@media (max-width: 600px)': { top: 110 },
            background: 'rgba(0,0,0,0.55)',
            color: '#fff',
            border: '1px solid #ffffff44',
            borderRadius: 999,
            padding: '4px 14px',
            fontSize: 12,
            cursor: 'pointer',
            backdropFilter: 'blur(4px)',
            whiteSpace: 'nowrap',
            '&:hover': { background: 'rgba(0,0,0,0.85)' },
          }}
        >
          skip to free play →
        </button>
      </>
    )
  }

  return <Game />
}

export const HomeEntry = dynamic(() => Promise.resolve(HomeEntryInner), { ssr: false })
