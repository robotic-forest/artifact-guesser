import { useGoat } from "@/hooks/useGoat"
import moment from "moment"
import { useState } from "react"
import { Tag } from "../tag/Tag"
import { Spinner } from "../loading/Spinner"
import { GiGoat } from "react-icons/gi"

export const GoatStats = () => {
  const [expanded, setExpanded] = useState(false)

  return (
    <div>
      <div
        className='flex items-center justify-between cursor-pointer text-xs'
        css={{ marginBottom: expanded ? 8 : 0, color: 'var(--textLowOpacity)' }}
        onClick={() => setExpanded(e => !e)}
      >
        <div className='flex items-center'>
          <GiGoat className='mr-2' />
          Goatcounter Views
          <span className='ml-2'>{expanded ? '▼' : '▶'}</span>
        </div>
        {expanded && (
          <a
            href='https://artifactguesser.goatcounter.com/'
            target='_blank'
            rel='noreferrer'
            onClick={e => e.stopPropagation()}
            css={{ textDecoration: 'underline' }}
          >
            open dashboard
          </a>
        )}
      </div>

      {expanded && (
        <div className='flex items-center' css={{ flexFlow: 'row wrap' }}>
          <Views {...{ amount: 10, unit: 'years', title: 'All' }} />
          <Views {...{ amount: 1, unit: 'month', title: 'Last month' }} />
          <Views {...{ amount: 1, unit: 'day', title: 'Last day' }} />
        </div>
      )}
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
    <div className='flex items-center' css={{
      margin: '0 8px 8px 0'
    }}>
      <span css={{ color: 'var(--textLowOpacity)', marginRight: 10 }}>{title}</span>
      {data?.total ? <Tag bold big noBorder>{data?.total}</Tag> : <Spinner />}
    </div>
  )
}