import useSWR from "swr"
import { useState } from "react"
import { Tag } from "../tag/Tag"
import { Spinner } from "../loading/Spinner"
import { IoMdAnalytics } from "react-icons/io"

const periods = ['24h', '7d', '30d', '90d']

const periodLabels = {
  '24h': 'Last 24h',
  '7d': 'Last 7 days',
  '30d': 'Last 30 days',
  '90d': 'Last 90 days'
}

export const Analytics = () => {
  const [period, setPeriod] = useState('7d')

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
          <div className='flex gap-1'>
            {periods.map(p => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className='px-2 py-0.5 text-xs rounded'
                css={{
                  background: p === period ? 'var(--primaryColor)' : 'var(--backgroundColorLight)',
                  color: p === period ? '#000' : 'var(--textColor)',
                  '&:hover': { background: p === period ? 'var(--primaryColor)' : 'var(--backgroundColorLight2)' }
                }}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <OverviewPanel period={period} />
        <FunnelPanel period={period} />
        <TrafficPanel period={period} />
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

      {data.eventBreakdown?.length > 0 && (
        <div className='text-xs'>
          <div className='text-[10px] uppercase tracking-wider mb-1' css={{ color: 'var(--textLowOpacity)' }}>
            Events
          </div>
          <div className='grid grid-cols-2 gap-x-6 gap-y-0.5'>
            {[...data.eventBreakdown].sort((a, b) => a.type.localeCompare(b.type)).map(e => (
              <div key={e.type} className='flex justify-between'>
                <span css={{ color: 'var(--textLowOpacity)' }}>{formatEventType(e.type)}</span>
                <span className='font-bold ml-2'>{e.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

const FunnelPanel = ({ period }) => {
  const { data, error } = useSWR(`/api/analytics/report?type=funnel&period=${period}`)

  if (error || !data) return null

  return (
    <div className='mb-3'>
      <div className='text-[10px] uppercase tracking-wider mb-1' css={{ color: 'var(--textLowOpacity)' }}>
        Game Funnel
      </div>
      <FunnelBar steps={data.gameFunnel} color='#7ae990' />

      {data.dailyFunnel?.some(s => s.count > 0) && (
        <>
          <div className='text-[10px] uppercase tracking-wider mb-1 mt-2' css={{ color: 'var(--textLowOpacity)' }}>
            Daily Run Funnel
          </div>
          <FunnelBar steps={data.dailyFunnel} color='#4f95ff' />
        </>
      )}
    </div>
  )
}

const FunnelBar = ({ steps, color }) => {
  const max = Math.max(...steps.map(s => s.count), 1)

  return (
    <div className='text-xs'>
      {steps.map((step, i) => {
        const pct = max > 0 ? (step.count / max) * 100 : 0
        const dropoff = i > 0 && steps[i - 1].count > 0
          ? Math.round((1 - step.count / steps[i - 1].count) * 100)
          : null

        return (
          <div key={step.type} className='flex items-center mb-0.5'>
            <div className='w-[130px] truncate' css={{ color: 'var(--textLowOpacity)' }}>
              {formatEventType(step.type)}
            </div>
            <div className='flex-1 h-[14px] overflow-hidden mx-2' css={{ background: 'var(--backgroundColorLight)' }}>
              <div
                className='h-full'
                css={{ width: `${pct}%`, background: color, opacity: 1 - (i * 0.15), transition: 'width 0.3s' }}
              />
            </div>
            <div className='w-[40px] text-right font-bold'>{step.count}</div>
            <div className='w-[45px] text-right text-[10px]'>
              {dropoff !== null && dropoff > 0 && (
                <span css={{ color: '#ff6b6b' }}>-{dropoff}%</span>
              )}
            </div>
          </div>
        )
      })}
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
  const barWidth = Math.max(4, Math.floor(100 / data.length) - 1)

  return (
    <div className='flex items-end gap-[2px] h-[50px] mb-1 w-full'>
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
          }}
          title={`${d.date}: ${d.count} views`}
        >
          {d.count}
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

const formatEventType = (type) => {
  return type
    .replace(/_/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())
}
