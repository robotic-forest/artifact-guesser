import { useGoat } from "@/hooks/useGoat"
import moment from "moment"
import { Tag } from "../tag/Tag"
import { Spinner } from "../loading/Spinner"
import Link from "next/link"
import { GiGoat } from "react-icons/gi"

export const GoatStats = () => {
  
  return (
    <>
      <Link href='https://artifactguesser.goatcounter.com/' target='_blank' rel='noreferrer' css={{ textDecoration: 'none', '&:hover': { color: 'var(--textColor)' } }}>
        <div className='p-3 pb-1 mb-2 cursor-pointer' css={{
          border: '1px solid #ffffff33',
          background: 'var(--backgroundColorBarelyLight)',
          '&:hover': { background: 'var(--backgroundColorSlightlyLight)' }
        }}>
          <div className='flex items-center text-sm' css={{
            marginBottom: 8
          }}>
            <GiGoat style={{ marginRight: 10 }} />
            Goatcounter Views
          </div>
          <div className='mt-4 flex items-center' css={{ flexFlow: 'row wrap' }}>
            <Views {...{ amount: 10, unit: 'years', title: 'All' }} />
            <Views {...{ amount: 1, unit: 'month', title: 'Last month' }} />
            <Views {...{ amount: 1, unit: 'day', title: 'Last day' }} />
          </div>
        </div>
      </Link>
      <iframe src='https://artifactguesser.goatcounter.com?access-token=23tsomunmqdat18fd3116omwxtrdlb1e894rn9holxx2qzgc8t' title='Goatcounter' css={{ width: '100%', height: 300, border: 'none', marginBottom: 8  }} />
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
    <div className='flex items-center' css={{
      margin: '0 8px 8px 0'
    }}>
      <span css={{ color: 'var(--textLowOpacity)', marginRight: 10 }}>{title}</span>
      {data?.total ? <Tag bold big noBorder>{data?.total}</Tag> : <Spinner />}
    </div>
  )
}