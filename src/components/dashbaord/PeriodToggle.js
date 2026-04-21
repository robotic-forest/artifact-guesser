export const periods = ['24h', '7d', '30d', '90d', 'all']

export const periodLabels = {
  '24h': 'Last 24h',
  '7d': 'Last 7 days',
  '30d': 'Last 30 days',
  '90d': 'Last 90 days',
  'all': 'All time',
}

export const PeriodToggle = ({ period, setPeriod }) => (
  <div className='flex gap-1'>
    {periods.map(p => (
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
)
