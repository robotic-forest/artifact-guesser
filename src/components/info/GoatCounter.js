import { useGoat } from "@/hooks/useGoat"
import moment from "moment"

export const GoatStats = () => {
  
  return (
    <a href='https://artifactguesser.goatcounter.com/' target='_blank' rel='noreferrer' css={{ textDecoration: 'none', '&:hover': { color: 'var(--textColor)' } }}>
      <div className='text-sm p-3 mr-2 mb-2 flex items-center cursor-pointer hover:bg-white/10' css={{
        border: '1px solid var(--textVeryLowOpacity)',
        borderRadius: 4,
        display: 'flex',
        flexFlow: 'row wrap',
        width: 'fit-content',
        minHeight: 49.6
      }}>
        <Views {...{ amount: 10, unit: 'years', title: 'All Time' }} />
        <Views {...{ amount: 1, unit: 'month', title: 'Last Month' }} />
        <Views {...{ amount: 1, unit: 'day', title: 'Last Day' }} />
      </div>
    </a>
  )
}

const Views = ({ amount, unit, title }) => {
  const data = useGoat({
    path: 'stats/total',
    params: {
      start: moment().subtract(amount, unit).startOf(unit).toISOString()
    }
  })

  return (
    <div css={{
      marginRight: 16
    }}>
      {title}: {data?.total}
    </div>
  )
}