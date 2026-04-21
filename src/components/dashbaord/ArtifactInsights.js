import Link from "next/link"

export const ArtifactInsights = ({ stats }) => {
  if (!stats) return null
  return (
    <div className='p-3 pt-0 text-xs'>
      <EraHistogram byEra={stats.byEra} />
      <PlayList title='Hardest (lowest avg score)' rows={stats.hardest} showScore />
      <PlayList title='Most Seen' rows={stats.mostSeen} />
    </div>
  )
}

const formatYear = y => {
  if (y == null) return '?'
  return y < 0 ? `${-y} BCE` : `${y} CE`
}

const formatCentury = c => {
  // c is floor(year/100). e.g. 19 -> 20th century CE, -1 -> 1st century BCE
  if (c >= 0) return `${c + 1}C`
  return `${-c}BC`
}

const EraHistogram = ({ byEra }) => {
  if (!byEra?.length) return null
  const max = Math.max(...byEra.map(e => e.count))

  return (
    <div className='mb-3'>
      <div className='text-[10px] uppercase tracking-wider mb-1' css={{ color: 'var(--textLowOpacity)' }}>
        Era Distribution
      </div>
      <div className='flex items-end gap-[1px] h-[50px]'>
        {byEra.map(e => (
          <div
            key={e._id}
            className='flex-1'
            css={{
              height: `${Math.max(4, (e.count / max) * 100)}%`,
              background: e._id < 0 ? '#c97b4e' : '#4f95ff',
              opacity: 0.85,
              '&:hover': { opacity: 1 },
              minWidth: 2,
            }}
            title={`${formatCentury(e._id)}: ${e.count} artifacts`}
          />
        ))}
      </div>
      <div className='flex justify-between text-[9px] mt-0.5' css={{ color: 'var(--textLowOpacity)' }}>
        <span>{formatCentury(byEra[0]._id)}</span>
        <span>{formatCentury(byEra[byEra.length - 1]._id)}</span>
      </div>
    </div>
  )
}

const PlayList = ({ title, rows, showScore }) => {
  if (!rows?.length) return null
  return (
    <div className='mb-2'>
      <div className='text-[10px] uppercase tracking-wider mb-1' css={{ color: 'var(--textLowOpacity)' }}>
        {title}
      </div>
      {rows.map(r => (
        <Link key={r.artifactId} href={`/artifacts/${r.artifactId}`} css={{ textDecoration: 'none', color: 'inherit' }}>
          <div className='flex items-center p-1 px-2 mb-0.5 cursor-pointer' css={{
            background: 'var(--backgroundColorLight)',
            '&:hover': { background: 'var(--backgroundColorLight2)' },
          }}>
            <div className='flex-1 truncate'>
              <b>{r.name || r.artifactId.slice(0, 6)}</b>
              <span className='ml-2 text-[10px]' css={{ color: 'var(--textLowOpacity)' }}>
                {r.country || '?'}{r.year != null && ` · ${formatYear(r.year)}`}
              </span>
            </div>
            {showScore && (
              <div
                className='w-[40px] text-right font-bold'
                css={{ color: r.avgPoints < 80 ? '#ff8a45' : 'inherit' }}
                title='Average points per play (out of 200)'
              >
                {r.avgPoints}
              </div>
            )}
            <div className='w-[40px] text-right text-[10px]' css={{ opacity: 0.6 }} title='Times played'>{r.plays}p</div>
          </div>
        </Link>
      ))}
    </div>
  )
}
