import { VscLinkExternal } from "react-icons/vsc"

export const ObjectInfo = ({ object, selectedDate, selectedCountry }) => {
  console.log({ object })

  const dateIsCorrect = object?.objectEndDate >= selectedDate && object?.objectBeginDate <= selectedDate
  const countryIsCorrect = object?.country.includes(selectedCountry)

  const points = (dateIsCorrect ? 1 : 0) + (countryIsCorrect ? 1 : 0)

  return (
    <div className='bg-black rounded mb-1 w-[300px] border border-white/30 absolute bottom-[36px] overflow-hidden'>
      <div css={{ padding: '3px 8px', borderBottom: '1px solid #ffffff55' }}>
        <div className='mb-2 flex justify-between items-start'>
          <b><span dangerouslySetInnerHTML={{ __html: object?.title }} /></b>
          <a
            css={{
              float: 'right',
              display: 'inline-flex',
              alignItems: 'center',
              fontSize: '0.9em'
            }}
            href={object?.objectURL}
            target='_blank'
            rel='noreferrer'
          >
            <VscLinkExternal className='mr-2' />
            View
          </a>
        </div>
        <div className='text-white/70 flex justify-between text-sm mb-1'>
          <div>Origin</div>
          <div>Your Guess</div>
        </div>
        <div className='flex justify-between items-start mb-1'>
          {/* <div>{object?.objectDate}{object?.period ? ` - ${object.period}` : ''}</div> */}
          {object?.objectBeginDate == object?.objectEndDate
            ? formatDate(object?.objectBeginDate)
            : `${formatDate(object?.objectBeginDate)} → ${formatDate(object?.objectEndDate)}`
          }
          <div
            className='p-[0px_4px] rounded text-black min-w-[64px]'
            css={{ background: dateIsCorrect ? '#7ae990' : '#ff9999' }}
          >
            {Math.abs(selectedDate)} {selectedDate > 0 ? 'AD' : 'BC'}
          </div>
        </div>
        <div className='flex justify-between items-start mb-2'>
          {/* <div>{createArea(object)}</div> */}
          <div>{object?.country}</div>
          <div
            className='p-[0px_4px] rounded text-black'
            css={{ background: countryIsCorrect ? '#7ae990' : '#ff9999' }}
          >
            {selectedCountry}
          </div>
        </div>
      </div>
      <div css={{
        color: 'black',
        padding: '3px 8px',
        border: '3px solid #ffffff55',
        background: points === 1 ? '#ffc045' : points === 2 ? '#7ae990' : '#ff9999'
      }}>
        <div className='flex justify-between text-sm mb-2'>
          <div className='text-black/70'>Points</div>
          <div>{points} / 2</div>
        </div>
        <div>
          {points === 1 ? 'Almost! You got one!' : points === 2 ? 'Perfect! Exceptional!' : 'Sad. Try again!'}
        </div>
      </div>
    </div>
  )
}

const formatDate = d => {
  const date = String(d)
  if (!date) return

  if (date.includes('-')) {
    return `${date.replace(/-/g, '')} BC`
  } else {
    return `${date} AD`
  }
}

const createArea = (object) => {
  if (!object) return

  let s = ''
  if (object.city) s += object.city + ', '
  if (object.river) s += object.river + ', '
  if (object.state) s += object.state + ', '
  if (object.subregion) s += object.subregion + ', '
  if (object.region) s += object.region + ', '
  if (object.country) s += object.country

  if (s.endsWith(', ')) s = s.slice(0, -2)

  return s
}