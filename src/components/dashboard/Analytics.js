import useSWR from "swr"
import { useState } from "react"
import { Tag } from "../tag/Tag"
import { Spinner } from "../loading/Spinner"
import { IoMdAnalytics } from "react-icons/io"
import { Retention } from "./Retention"
import { GoatStats } from "../info/GoatCounter"
import { PeriodToggle } from "./PeriodToggle"

export const Analytics = () => {
  const [period, setPeriod] = useState('24h')

  return (
    <div className='mb-2' css={{
      border: '1px outset',
      borderColor: '#ffffff77 #00000077 #00000077 #ffffff77',
      background: 'var(--backgroundColorBarelyLight)',
    }}>
      <div className='p-3 pb-2'>
        <div className='flex items-center justify-between mb-3'>
          <div className='flex items-center'>
            <IoMdAnalytics className='mr-2' />
            Analytics
          </div>
          <PeriodToggle period={period} setPeriod={setPeriod} />
        </div>

        <OverviewPanel period={period} />
        <EventsPanel period={period} />
        <DailyLeaderboardPanel />
        <TrafficPanel period={period} />
        <div className='mt-3'>
          <Retention />
        </div>
        <div className='mt-3'>
          <GoatStats />
        </div>
      </div>
    </div>
  )
}

const OverviewPanel = ({ period }) => {
  const { data, error } = useSWR(`/api/analytics/report?type=overview&period=${period}`)

  if (error) return <div className='text-xs text-red-400 mb-2'>Failed to load overview</div>
  if (!data) return <div className='mb-2'><Spinner /></div>

  return (
    <div className='mb-3'>
      <div className='flex gap-3 mb-1'>
        <StatBox label='Views' value={data.totalViews} />
        <StatBox label='Unique Visitors' value={data.uniqueVisitors} />
      </div>
      <div className='text-[10px] mb-2 text-right' css={{ color: 'var(--textLowOpacity)' }}>
        filtered {data.botViews ?? 0} bot views from {data.botVisitors ?? 0} bot visitors
      </div>
    </div>
  )
}

// Daily vs Endless event counts, side by side. Each column shows the same three
// lifecycle events mapped to that mode's event names.
const EVENT_ROWS = [
  { label: 'Game started',    daily: 'daily_run_started',    endless: 'game_started' },
  { label: 'Round completed', daily: 'daily_round_completed', endless: 'round_completed' },
  { label: 'Game completed',  daily: 'daily_run_completed',   endless: 'game_completed' },
]

const EventsPanel = ({ period }) => {
  const { data, error } = useSWR(`/api/analytics/report?type=overview&period=${period}`)

  if (error) return <div className='text-xs text-red-400 mb-3'>Failed to load events</div>
  if (!data) return <div className='mb-3'><Spinner /></div>

  const counts = Object.fromEntries((data.eventBreakdown || []).map(e => [e.type, e.count]))
  const colRows = (key) => EVENT_ROWS.map(r => ({ label: r.label, count: counts[r[key]] || 0 }))

  return (
    <div className='mb-3'>
      <div className='text-[10px] uppercase tracking-wider mb-1' css={{ color: 'var(--textLowOpacity)' }}>
        Events
      </div>
      <div className='grid grid-cols-2 gap-3'>
        <EventColumn title='Daily' rows={colRows('daily')} />
        <EventColumn title='Endless' rows={colRows('endless')} />
      </div>
    </div>
  )
}

const EventColumn = ({ title, rows }) => (
  <div className='p-2 rounded' css={{ background: 'var(--backgroundColorLight)' }}>
    <div className='text-[10px] uppercase tracking-wider mb-1 font-bold'>{title}</div>
    <div className='text-xs'>
      {rows.map(r => (
        <div key={r.label} className='flex justify-between mb-0.5'>
          <span css={{ color: 'var(--textLowOpacity)' }}>{r.label}</span>
          <span className='font-bold ml-2'>{r.count}</span>
        </div>
      ))}
    </div>
  </div>
)

const dateKeyToday = () => new Date().toISOString().slice(0, 10)
const shiftDateKey = (key, days) => {
  const d = new Date(`${key}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().slice(0, 10)
}
const fmtDateKey = (key) =>
  new Date(`${key}T00:00:00Z`).toLocaleDateString('en-US', { timeZone: 'UTC', month: 'short', day: 'numeric' })

const DailyLeaderboardPanel = () => {
  const [dateKey, setDateKey] = useState(dateKeyToday())
  const { data } = useSWR(`/api/daily/leaderboard?dateKey=${dateKey}&includeAnon=1`)
  const isToday = dateKey >= dateKeyToday()
  const top5 = (data?.scores || []).slice(0, 5)

  return (
    <div className='mb-3'>
      <div className='flex items-center justify-between mb-1'>
        <div className='text-[10px] uppercase tracking-wider' css={{ color: 'var(--textLowOpacity)' }}>
          Daily Leaderboard
        </div>
        <div className='flex items-center text-xs select-none'>
          <button
            onClick={() => setDateKey(k => shiftDateKey(k, -1))}
            className='px-1 cursor-pointer'
            css={{ '&:hover': { color: 'var(--textColor)' } }}
          >‹</button>
          <span className='mx-1 font-bold text-center' css={{ minWidth: 52 }}>{fmtDateKey(dateKey)}</span>
          <button
            onClick={() => { if (!isToday) setDateKey(k => shiftDateKey(k, 1)) }}
            disabled={isToday}
            className='px-1'
            css={{ cursor: isToday ? 'default' : 'pointer', opacity: isToday ? 0.3 : 1, '&:hover': { color: isToday ? undefined : 'var(--textColor)' } }}
          >›</button>
        </div>
      </div>
      {!data ? <Spinner /> : (
        <div className='text-xs leading-relaxed'>
          <b>{data.totalGames ?? 0} games</b>
          {top5.length === 0 ? (
            <span css={{ color: 'var(--textLowOpacity)' }}> · no scores yet</span>
          ) : (
            <>
              <span css={{ color: 'var(--textLowOpacity)' }}> · </span>
              {top5.map((s, i) => (
                <span key={s.rank}>
                  {i > 0 && <span css={{ color: 'var(--textLowOpacity)' }}>, </span>}
                  <span css={{ color: 'var(--textLowOpacity)' }}>{s.username}</span> <b>{s.score}</b>
                </span>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  )
}

const TrafficPanel = ({ period }) => {
  const { data, error } = useSWR(`/api/analytics/report?type=traffic&period=${period}`)

  if (error || !data) return null

  return (
    <div className='mb-2'>
      {data.viewsByDay?.length > 1 && (
        <>
          <div className='text-[10px] uppercase tracking-wider mb-1' css={{ color: 'var(--textLowOpacity)' }}>
            Views by Day
          </div>
          <MiniChart data={data.viewsByDay} />
        </>
      )}

      {data.topPaths?.length > 0 && (
        <>
          <div className='text-[10px] uppercase tracking-wider mb-1 mt-2' css={{ color: 'var(--textLowOpacity)' }}>
            Top Pages
          </div>
          <div className='text-xs'>
            {[...data.topPaths].slice(0, 8).sort((a, b) => a.path.localeCompare(b.path)).map(p => (
              <div key={p.path} className='flex justify-between mb-0.5'>
                <span css={{ color: 'var(--textLowOpacity)' }} className='truncate mr-2'>{p.path}</span>
                <span className='font-bold'>{p.count}</span>
              </div>
            ))}
          </div>
        </>
      )}

      {data.topReferrers?.length > 0 && (
        <>
          <div className='text-[10px] uppercase tracking-wider mb-1 mt-2' css={{ color: 'var(--textLowOpacity)' }}>
            Top Referrers
          </div>
          <div className='text-xs'>
            {data.topReferrers.slice(0, 5).map(r => (
              <div key={r.referrer} className='flex justify-between mb-0.5'>
                <span css={{ color: 'var(--textLowOpacity)' }} className='truncate mr-2'>{r.referrer}</span>
                <span className='font-bold'>{r.count}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

const MiniChart = ({ data }) => {
  const max = Math.max(...data.map(d => d.count), 1)
  const dense = data.length > 60
  const gap = dense ? 0 : 2

  return (
    <div
      className='flex items-end h-[50px] mb-1 w-full'
      css={{ gap, overflow: 'hidden' }}
    >
      {data.map(d => (
        <div
          key={d.date}
          className='flex items-center justify-center'
          css={{
            flex: 1,
            minWidth: 0,
            height: `${Math.max(8, (d.count / max) * 100)}%`,
            background: '#4f95ff',
            opacity: 0.8,
            '&:hover': { opacity: 1 },
            fontSize: 9,
            fontWeight: 700,
            color: '#000',
            overflow: 'hidden',
          }}
          title={`${d.date}: ${d.count} views`}
        >
          {dense ? '' : d.count}
        </div>
      ))}
    </div>
  )
}

const StatBox = ({ label, value, dim }) => (
  <div className='flex-1 p-2 rounded text-center' css={{
    background: 'var(--backgroundColorLight)',
    opacity: dim ? 0.5 : 1,
  }}>
    <div className='text-lg font-bold'>{value ?? <Spinner />}</div>
    <div className='text-[10px] uppercase tracking-wider' css={{ color: 'var(--textLowOpacity)' }}>{label}</div>
  </div>
)

