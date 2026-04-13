import useSWR from "swr"
import { Spinner } from "../loading/Spinner"

/**
 * Individual player journey view. Shown on admin account pages.
 * Pass accountId to fetch the full player story.
 */
export const PlayerJourney = ({ accountId }) => {
  const { data, error } = useSWR(
    accountId ? `/api/analytics/report?type=player-journey&accountId=${accountId}` : null
  )

  if (error) return <div className='text-xs text-red-400'>Failed to load journey</div>
  if (!data) return <Spinner />

  const { account, arrivalSource, preSignupEvents, games, daily, challenges, timeline, lastActive } = data

  return (
    <div className='text-sm'>
      <div className='text-[10px] uppercase tracking-wider mb-2' css={{ color: 'var(--textLowOpacity)' }}>
        Player Journey
      </div>

      {/* Arrival */}
      {arrivalSource && (
        <div className='mb-3 p-2 rounded' css={{ background: 'var(--backgroundColorSlightlyLight)' }}>
          <div className='text-[10px] uppercase tracking-wider mb-1' css={{ color: 'var(--textLowOpacity)' }}>
            Arrived via
          </div>
          <div className='flex flex-wrap gap-x-4 gap-y-1 text-xs'>
            {arrivalSource.referrer && <div><span css={{ color: 'var(--textLowOpacity)' }}>Referrer:</span> {arrivalSource.referrer}</div>}
            {arrivalSource.utmSource && <div><span css={{ color: 'var(--textLowOpacity)' }}>Source:</span> {arrivalSource.utmSource}</div>}
            {arrivalSource.utmCampaign && <div><span css={{ color: 'var(--textLowOpacity)' }}>Campaign:</span> {arrivalSource.utmCampaign}</div>}
            {arrivalSource.path && <div><span css={{ color: 'var(--textLowOpacity)' }}>Landing:</span> {arrivalSource.path}</div>}
          </div>
        </div>
      )}

      {/* Pre-signup */}
      {preSignupEvents > 0 && (
        <div className='mb-2 text-xs'>
          <span css={{ color: 'var(--textLowOpacity)' }}>Pre-signup events:</span> {preSignupEvents}
        </div>
      )}

      {/* Stats grid */}
      <div className='grid grid-cols-2 md:grid-cols-4 gap-2 mb-3'>
        <StatCard label='Games' value={games.total} />
        <StatCard label='Avg Score' value={`${games.avgScorePct}%`} />
        <StatCard label='Daily Streak' value={daily.streak} />
        <StatCard label='Dailies Played' value={daily.totalPlayed} />
        <StatCard label='Challenges Sent' value={challenges.sent} />
        <StatCard label='Challenges Done' value={challenges.completed} />
        <StatCard label='Last Daily' value={daily.lastPlayed || '—'} small />
        <StatCard label='Last Active' value={lastActive ? new Date(lastActive).toLocaleDateString() : '—'} small />
      </div>

      {/* Score trend */}
      {games.scoreTrend?.length > 1 && (
        <>
          <div className='text-[10px] uppercase tracking-wider mb-1' css={{ color: 'var(--textLowOpacity)' }}>
            Score Trend (last {games.scoreTrend.length} — <span css={{ color: '#7ae990' }}>personal</span> / <span css={{ color: '#4f95ff' }}>daily</span>)
          </div>
          <MiniScoreChart data={games.scoreTrend} />
        </>
      )}

      {/* Games timeline */}
      {timeline?.length > 1 && (
        <>
          <div className='text-[10px] uppercase tracking-wider mb-1 mt-2' css={{ color: 'var(--textLowOpacity)' }}>
            Activity Timeline
          </div>
          <MiniTimeline data={timeline} />
        </>
      )}
    </div>
  )
}

const StatCard = ({ label, value, small }) => (
  <div className='p-2 rounded text-center' css={{ background: 'var(--backgroundColorSlightlyLight)' }}>
    <div className={small ? 'text-xs font-bold' : 'text-lg font-bold'}>{value}</div>
    <div className='text-[10px] uppercase tracking-wider' css={{ color: 'var(--textLowOpacity)' }}>{label}</div>
  </div>
)

const MiniScoreChart = ({ data }) => {
  return (
    <div className='flex items-end gap-[2px] h-[40px] mb-2'>
      {data.map((d, i) => {
        const max = d.maxScore || 1000
        const pct = (d.score / max) * 100
        const isDaily = d.type === 'daily'
        return (
          <div
            key={i}
            className='flex-1'
            css={{
              height: `${pct}%`,
              minHeight: 2,
              background: isDaily
                ? (pct >= 70 ? '#4f95ff' : pct >= 50 ? '#7baaf0' : '#a0c4f0')
                : (pct >= 70 ? '#7ae990' : pct >= 50 ? '#ffc045' : '#ff8a45'),
            }}
            title={`${new Date(d.date).toLocaleDateString()}: ${d.score}/${max} (${d.mode})`}
          />
        )
      })}
    </div>
  )
}

const MiniTimeline = ({ data }) => {
  const max = Math.max(...data.map(d => d.count), 1)
  return (
    <div className='flex items-end gap-[2px] h-[30px] mb-2'>
      {data.map(d => (
        <div
          key={d.date}
          className='flex-1'
          css={{
            height: `${Math.max(8, (d.count / max) * 100)}%`,
            background: '#4f95ff',
            opacity: 0.8,
          }}
          title={`${d.date}: ${d.count} games`}
        />
      ))}
    </div>
  )
}
