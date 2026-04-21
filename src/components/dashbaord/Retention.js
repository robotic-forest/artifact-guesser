import useSWR from "swr"
import { useState } from "react"
import { Spinner } from "../loading/Spinner"
import { IoMdAnalytics } from "react-icons/io"

export const Retention = () => {
  const [period, setPeriod] = useState('30d')
  const [expanded, setExpanded] = useState(false)

  return (
    <div>
      <div
        className='flex items-center justify-between cursor-pointer text-xs'
        css={{ marginBottom: expanded ? 8 : 0, color: 'var(--textLowOpacity)' }}
        onClick={() => setExpanded(e => !e)}
      >
        <div className='flex items-center'>
          <IoMdAnalytics className='mr-2' />
          Retention & Engagement
          <span className='ml-2'>{expanded ? '▼' : '▶'}</span>
        </div>
        {expanded && (
          <div className='flex gap-1'>
            {['7d', '30d', '90d'].map(p => (
              <button
                key={p}
                onClick={(e) => { e.stopPropagation(); setPeriod(p) }}
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
        )}
      </div>

      {expanded && (
        <>
          <CohortRetention />
          <EngagementMetrics period={period} />
        </>
      )}
    </div>
  )
}

const CohortRetention = () => {
  const { data, error } = useSWR('/api/analytics/report?type=retention&weeks=6')

  if (error) return <div className='text-xs text-red-400 mb-2'>Failed to load retention</div>
  if (!data) return <div className='mb-2'><Spinner /></div>
  if (!data.cohorts?.length) return <div className='text-xs mb-2' css={{ color: 'var(--textLowOpacity)' }}>No cohort data yet</div>

  return (
    <div className='mb-3'>
      <div className='text-[10px] uppercase tracking-wider mb-1' css={{ color: 'var(--textLowOpacity)' }}>
        Weekly Cohort Retention
      </div>
      <div className='overflow-x-auto'>
        <table className='text-xs w-full' css={{ borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th className='text-left p-1' css={{ color: 'var(--textLowOpacity)' }}>Cohort</th>
              <th className='text-center p-1' css={{ color: 'var(--textLowOpacity)' }}>Size</th>
              {data.cohorts[0]?.retention?.map((_, i) => (
                <th key={i} className='text-center p-1' css={{ color: 'var(--textLowOpacity)' }}>
                  W{i}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.cohorts.map(cohort => (
              <tr key={cohort.cohort}>
                <td className='p-1 font-mono'>{cohort.cohort}</td>
                <td className='text-center p-1'>{cohort.size}</td>
                {cohort.retention.map((r, i) => (
                  <td
                    key={i}
                    className='text-center p-1'
                    css={{
                      background: r.rate > 0 ? `rgba(122, 233, 144, ${r.rate / 100 * 0.6})` : 'transparent',
                    }}
                  >
                    {r.rate > 0 ? `${r.rate}%` : '—'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

const EngagementMetrics = ({ period }) => {
  const { data, error } = useSWR(`/api/analytics/report?type=engagement&period=${period}`)

  if (error) return <div className='text-xs text-red-400 mb-2'>Failed to load engagement</div>
  if (!data) return <div className='mb-2'><Spinner /></div>

  return (
    <div className='mb-2'>
      {/* DAU chart */}
      {data.dailyActive?.length > 1 && (
        <>
          <div className='text-[10px] uppercase tracking-wider mb-1' css={{ color: 'var(--textLowOpacity)' }}>
            Daily Active Users
          </div>
          <div className='flex items-end gap-[2px] h-[40px] mb-2 w-full'>
            {(() => { const max = Math.max(...data.dailyActive.map(x => x.users), 1); return data.dailyActive.map(d => (
                <div
                  key={d.date}
                  className='flex-1 flex items-center justify-center'
                  css={{
                    height: `${Math.max(8, (d.users / max) * 100)}%`,
                    background: '#4f95ff',
                    opacity: 0.8,
                    fontSize: 9,
                    fontWeight: 700,
                    color: '#000',
                  }}
                  title={`${d.date}: ${d.users} users`}
                >
                  {d.users}
                </div>
              ))})()}
          </div>
        </>
      )}

      {/* Return rates */}
      {data.returnRates?.length > 0 && (
        <>
          <div className='text-[10px] uppercase tracking-wider mb-1' css={{ color: 'var(--textLowOpacity)' }}>
            Day-over-Day Return Rate
          </div>
          <div className='flex items-end gap-[2px] h-[40px] mb-2 w-full'>
            {data.returnRates.map(d => (
              <div
                key={d.date}
                className='flex-1 flex items-center justify-center'
                css={{
                  height: `${Math.max(8, d.rate)}%`,
                  background: d.rate >= 50 ? '#7ae990' : d.rate >= 25 ? '#ffc045' : '#ff8a45',
                  fontSize: 9,
                  fontWeight: 700,
                  color: '#000',
                }}
                title={`${d.date}: ${d.rate}% of yesterday's users returned (${d.returning} returning, ${d.dau} active today)`}
              >
                {d.rate}%
              </div>
            ))}
          </div>
        </>
      )}

      {/* Challenge funnel — always render so zero state is visible */}
      {data.challengeFunnel?.length > 0 && (
        <>
          <div className='text-[10px] uppercase tracking-wider mb-1' css={{ color: 'var(--textLowOpacity)' }}>
            Challenge Funnel
          </div>
          <ChallengeFunnel steps={data.challengeFunnel} />
          {data.challengeFunnel.every(s => s.count === 0) && (
            <div className='text-[10px] mt-1' css={{ color: 'var(--textLowOpacity)' }}>
              No challenges tracked yet in this period.
            </div>
          )}
        </>
      )}
    </div>
  )
}

const ChallengeFunnel = ({ steps }) => {
  const max = Math.max(...steps.map(s => s.count), 1)

  return (
    <div className='text-xs'>
      {steps.map((step, i) => {
        const pct = max > 0 ? (step.count / max) * 100 : 0
        const dropoff = i > 0 && steps[i - 1].count > 0
          ? Math.round((1 - step.count / steps[i - 1].count) * 100)
          : null

        return (
          <div key={step.step} className='flex items-center mb-0.5'>
            <div className='w-[130px] truncate' css={{ color: 'var(--textLowOpacity)' }}>
              {step.step}
            </div>
            <div className='flex-1 h-[14px] overflow-hidden mx-2' css={{ background: 'var(--backgroundColorLight)' }}>
              <div
                className='h-full'
                css={{ width: `${pct}%`, background: '#e67e22', opacity: 1 - (i * 0.15), transition: 'width 0.3s' }}
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
