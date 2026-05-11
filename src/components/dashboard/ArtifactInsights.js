export const ArtifactInsights = ({ stats }) => {
  if (!stats) return null
  return (
    <div className='p-3 pt-0 text-xs'>
      <div className='mb-3 flex items-center justify-between' css={{ color: 'var(--textLowOpacity)' }}>
        <span className='text-[10px] uppercase tracking-wider'>Favorites</span>
        <span className='font-bold text-sm' css={{ color: 'var(--textColor)' }}>{stats.favoritesCount ?? 0}</span>
      </div>

      <EraHistogram byEra={stats.byEra} />
      <SourceMix bySource={stats.bySource} />
      <CoverageGaps gaps={stats.coverageGaps} />
      <DifficultyByCountry rows={stats.difficultyByCountry} />
    </div>
  )
}

const formatCentury = c => {
  if (c == null) return '?'
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

const SourceMix = ({ bySource }) => {
  if (!bySource?.length) return null
  const total = bySource.reduce((s, r) => s + r.count, 0)
  const max = bySource[0].count

  return (
    <div className='mb-3'>
      <div className='text-[10px] uppercase tracking-wider mb-1' css={{ color: 'var(--textLowOpacity)' }}>
        Source Mix
      </div>
      {bySource.slice(0, 8).map(r => (
        <div key={r._id} className='flex items-center mb-0.5'>
          <div className='w-[130px] truncate' css={{ color: 'var(--textLowOpacity)' }} title={r._id}>{r._id}</div>
          <div className='flex-1 h-[14px] overflow-hidden mx-2' css={{ background: 'var(--backgroundColorLight)' }}>
            <div className='h-full' css={{ width: `${(r.count / max) * 100}%`, background: '#7ae990', opacity: 0.85 }} />
          </div>
          <div className='w-[50px] text-right font-bold' title='Artifacts'>{r.count}</div>
          <div className='w-[40px] text-right text-[10px]' css={{ opacity: 0.6 }} title='Share of catalog'>
            {Math.round((r.count / total) * 100)}%
          </div>
        </div>
      ))}
    </div>
  )
}

const CoverageGaps = ({ gaps }) => {
  if (!gaps) return null
  const { threshold, scarceCountries, scarceCountriesTotal, scarceCenturies } = gaps
  if (!scarceCountries?.length && !scarceCenturies?.length) return null

  return (
    <div className='mb-3'>
      <div className='text-[10px] uppercase tracking-wider mb-1' css={{ color: 'var(--textLowOpacity)' }}>
        Coverage Gaps (&lt;{threshold} artifacts)
      </div>

      {scarceCountries.length > 0 && (
        <div className='mb-2'>
          <div className='text-[10px] mb-0.5' css={{ color: 'var(--textLowOpacity)' }}>
            Countries ({scarceCountriesTotal})
          </div>
          <div className='flex flex-wrap gap-1'>
            {scarceCountries.map(c => (
              <span
                key={c._id}
                className='px-1.5 py-0.5 text-[10px]'
                css={{ background: 'var(--backgroundColorLight)' }}
                title={`${c.count} artifact${c.count === 1 ? '' : 's'}`}
              >
                {c._id} <b>{c.count}</b>
              </span>
            ))}
          </div>
        </div>
      )}

      {scarceCenturies.length > 0 && (
        <div>
          <div className='text-[10px] mb-0.5' css={{ color: 'var(--textLowOpacity)' }}>
            Centuries ({scarceCenturies.length})
          </div>
          <div className='flex flex-wrap gap-1'>
            {scarceCenturies.map(c => (
              <span
                key={c._id}
                className='px-1.5 py-0.5 text-[10px]'
                css={{ background: 'var(--backgroundColorLight)' }}
                title={`${c.count} artifact${c.count === 1 ? '' : 's'}`}
              >
                {formatCentury(c._id)} <b>{c.count}</b>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

const DifficultyByCountry = ({ rows }) => {
  if (!rows?.length) return null
  const sorted = [...rows].sort((a, b) => a.avgPoints - b.avgPoints)
  const hardest = sorted.slice(0, 5)
  const easiest = sorted.slice(-5).reverse()

  return (
    <div className='mb-2'>
      <div className='text-[10px] uppercase tracking-wider mb-1' css={{ color: 'var(--textLowOpacity)' }}>
        Difficulty by Country (avg points out of 200)
      </div>
      <div className='grid grid-cols-2 gap-2'>
        <DiffColumn title='Hardest' rows={hardest} />
        <DiffColumn title='Easiest' rows={easiest} />
      </div>
    </div>
  )
}

const DiffColumn = ({ title, rows }) => (
  <div>
    <div className='text-[10px] mb-0.5' css={{ color: 'var(--textLowOpacity)' }}>{title}</div>
    {rows.map(r => (
      <div key={r.country} className='flex items-center p-1 px-2 mb-0.5' css={{ background: 'var(--backgroundColorLight)' }}>
        <div className='flex-1 truncate' title={`${r.artifacts} artifacts, ${r.totalPlays} plays`}>
          {r.country || '(unknown)'}
        </div>
        <div
          className='font-bold'
          title='Average points per play (out of 200)'
          css={{ color: r.avgPoints < 80 ? '#ff8a45' : r.avgPoints > 140 ? '#2f8f4a' : 'inherit' }}
        >
          {r.avgPoints}
        </div>
      </div>
    ))}
  </div>
)
