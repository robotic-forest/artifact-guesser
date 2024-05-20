import { useGoat } from "@/hooks/useGoat"
import moment from "moment"

export const GoatStats = () => {
  
  return (
    <>
      <div css={{
        marginLeft: 24,
        marginBottom: 4
      }}>
        Goatcounter Views
      </div>
      <div css={{
        padding: 12,
        margin: '0 0 1em',
        border: '1px solid var(--textVeryLowOpacity)',
        borderRadius: 6,
        display: 'flex',
        flexFlow: 'row wrap',
      }}>
        <Views {...{ amount: 10, unit: 'years', title: 'All Time' }} />
        <Views {...{ amount: 1, unit: 'month', title: 'Last Month' }} />
        <Views {...{ amount: 1, unit: 'day', title: 'Last Day' }} />
      </div>
    </>
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