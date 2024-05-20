import { useGoat } from "@/hooks/useGoat"
import moment from "moment"
import { GiGoat } from "react-icons/gi"

export const GoatStats = () => {
  
  return (
    <div className='text-sm p-3 mr-2 mb-2 flex items-center' css={{
      border: '1px solid var(--textVeryLowOpacity)',
      borderRadius: 6,
      display: 'flex',
      flexFlow: 'row wrap',
      width: 'fit-content'
    }}>
      <Views {...{ amount: 10, unit: 'years', title: 'All Time' }} />
      <Views {...{ amount: 1, unit: 'month', title: 'Last Month' }} />
      <Views {...{ amount: 1, unit: 'day', title: 'Last Day' }} />
    </div>
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
      {title}: {data?.total || <span className='text-white/50'>N/A</span>}
    </div>
  )
}