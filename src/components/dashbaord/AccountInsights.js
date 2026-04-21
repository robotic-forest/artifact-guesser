import useSWR from "swr"
import Link from "next/link"
import { useState } from "react"
import { Spinner } from "../loading/Spinner"
import { PeriodToggle, periodLabels } from "./PeriodToggle"

export const AccountInsights = () => {
  const [period, setPeriod] = useState('30d')
  const { data, error } = useSWR(`/api/accounts/insights?period=${period}`)

  return (
    <div className='p-3 text-xs'>
      <div className='flex items-center justify-between mb-3'>
        <span className='text-[10px] uppercase tracking-wider' css={{ color: 'var(--textLowOpacity)' }}>
          {periodLabels[period]}
        </span>
        <PeriodToggle period={period} setPeriod={setPeriod} />
      </div>

      {error && <div className='text-red-400'>Failed to load insights</div>}
      {!data && !error && <Spinner />}
      {data && (
        <>
          <SignupFunnel data={data.signupFunnel} />
          <Activation data={data.activation} />
          <TopPlayers title='Top by Games Played' rows={data.topByGames} metric='games' />
          <TopPlayers title='Top by Total Score' rows={data.topByScore} metric='totalScore' />
        </>
      )}
    </div>
  )
}

const pct = (num, denom) => denom > 0 ? Math.round((num / denom) * 100) : 0

const SignupFunnel = ({ data }) => {
  const steps = [
    { label: 'Unique visitors', count: data.uniqueVisitors },
    { label: 'Signed up', count: data.signups },
    { label: 'Played ≥1 game', count: data.played1Plus },
    { label: 'Played ≥3 games', count: data.played3Plus },
  ]
  const max = Math.max(...steps.map(s => s.count), 1)

  return (
    <div className='mb-3'>
      <div className='text-[10px] uppercase tracking-wider mb-1' css={{ color: 'var(--textLowOpacity)' }}>
        Signup Funnel
      </div>
      {steps.map((s, i) => {
        const prev = i > 0 ? steps[i - 1].count : null
        const dropoff = prev !== null && prev > 0 ? Math.round((1 - s.count / prev) * 100) : null
        return (
          <div key={s.label} className='flex items-center mb-0.5'>
            <div className='w-[140px] truncate' css={{ color: 'var(--textLowOpacity)' }}>{s.label}</div>
            <div className='flex-1 h-[14px] overflow-hidden mx-2' css={{ background: 'var(--backgroundColorLight)' }}>
              <div
                className='h-full'
                css={{ width: `${(s.count / max) * 100}%`, background: '#7ae990', opacity: 1 - (i * 0.15), transition: 'width 0.3s' }}
              />
            </div>
            <div className='w-[40px] text-right font-bold'>{s.count}</div>
            <div className='w-[45px] text-right text-[10px]'>
              {dropoff !== null && dropoff > 0 && <span css={{ color: '#ff6b6b' }}>-{dropoff}%</span>}
            </div>
          </div>
        )
      })}
    </div>
  )
}

const Activation = ({ data }) => {
  if (data.cohortSize === 0) {
    return (
      <div className='mb-3 text-[10px]' css={{ color: 'var(--textLowOpacity)' }}>
        No new accounts in this period.
      </div>
    )
  }

  const rows = [
    { label: 'Played ≥1 game', count: data.played1Plus },
    { label: 'Played ≥3 games', count: data.played3Plus },
    { label: 'Completed a daily', count: data.completedDaily },
  ]

  return (
    <div className='mb-3'>
      <div className='text-[10px] uppercase tracking-wider mb-1' css={{ color: 'var(--textLowOpacity)' }}>
        Activation (new accounts: {data.cohortSize})
      </div>
      <div className='grid grid-cols-3 gap-2'>
        {rows.map(r => (
          <div key={r.label} className='p-2 text-center' css={{ background: 'var(--backgroundColorLight)' }}>
            <div className='text-base font-bold'>{pct(r.count, data.cohortSize)}%</div>
            <div className='text-[10px]' css={{ color: 'var(--textLowOpacity)' }}>
              {r.label}
            </div>
            <div className='text-[10px]' css={{ color: 'var(--textLowOpacity)' }}>
              {r.count} / {data.cohortSize}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

const TopPlayers = ({ title, rows, metric }) => {
  if (!rows?.length) return null
  return (
    <div className='mb-2'>
      <div className='text-[10px] uppercase tracking-wider mb-1' css={{ color: 'var(--textLowOpacity)' }}>
        {title}
      </div>
      {rows.map((r, i) => (
        <Link key={r.userId} href={`/accounts/${r.userId}`} css={{ textDecoration: 'none', color: 'inherit' }}>
          <div className='flex items-center p-1 px-2 mb-0.5 cursor-pointer' css={{
            background: 'var(--backgroundColorLight)',
            '&:hover': { background: 'var(--backgroundColorLight2)' },
          }}>
            <div className='w-5' css={{ opacity: 0.6 }}>#{i + 1}</div>
            <div className='flex-1 truncate'><b>{r.username}</b></div>
            <div className='font-bold' title={metric === 'games' ? 'Games played' : 'Total score'}>{r[metric]}</div>
            {metric === 'totalScore' && (
              <div className='w-[50px] text-right text-[10px]' css={{ opacity: 0.6 }} title='Games played'>{r.games}g</div>
            )}
          </div>
        </Link>
      ))}
    </div>
  )
}
