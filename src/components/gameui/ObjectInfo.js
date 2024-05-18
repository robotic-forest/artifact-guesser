import { VscLinkExternal } from "react-icons/vsc"
import { Button } from "../buttons/Button"
import { useRouter } from "next/router"
import { IoIosArrowRoundForward } from "react-icons/io"
import { FaHeart, FaSave } from "react-icons/fa"
import { IconButton } from "../buttons/IconButton"
import useUser from "@/hooks/useUser"

export const ObjectInfo = ({ object, selectedDate, selectedCountry }) => {
  const { isAdmin } = useUser()
  const router = useRouter()
  console.log({ object })

  const dateIsCorrect = object?.objectEndDate >= selectedDate && object?.objectBeginDate <= selectedDate
  const countryIsCorrect = object?.country.includes(selectedCountry)

  const points = (dateIsCorrect ? 1 : 0) + (countryIsCorrect ? 1 : 0)

  return (
    <div className='w-[300px]'>
      <div className='bg-black rounded border border-white/30 mb-1' css={{ padding: '3px 8px' }}>
        <div className='mb-2 flex justify-between items-start'>
          <b><span dangerouslySetInnerHTML={{ __html: object?.title }} /></b>
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
        <div className='flex justify-between items-start mb-4 border-white/30'>
          {/* <div>{createArea(object)}</div> */}
          <div>{object?.country}</div>
          <div
            className='p-[0px_4px] rounded text-black'
            css={{ background: countryIsCorrect ? '#7ae990' : '#ff9999' }}
          >
            {selectedCountry}
          </div>
        </div>
        <div className='flex justify-end mb-1.5'>
          {isAdmin && (
            <IconButton tooltip='Save for Public' css={{
              border: '1px solid #ffffff66',
              marginRight: 4,
              borderRadius: 3
            }}>
              <FaSave />
            </IconButton>
          )}
          <IconButton tooltip='Favorite' css={{
            border: '1px solid #ffffff66',
            marginRight: 4,
            borderRadius: 3
          }}>
            <FaHeart />
          </IconButton>
          <a
            css={{
              textDecoration: 'none',
              fontSize: '0.9em'
            }}
            href={object?.objectURL}
            target='_blank'
            rel='noreferrer'
          >
            <Button css={{ padding: '2px 6px' }}>
              <VscLinkExternal className='mr-2 text-xs' />
              <span className='relative -top-[1px]'>View Source</span>
            </Button>
          </a>
        </div>
      </div>
      <div className='rounded' css={{
        color: 'black',
        padding: '3px 8px',
        border: '3px solid #ffffff55',
        background: points === 1 ? '#ffc045' : points === 2 ? '#7ae990' : '#ff9999'
      }}>
        <div className='flex justify-between text-sm mb-2'>
          <div className='text-black/70'>Points</div>
          <div>{points} / 2</div>
        </div>
        <div className='flex justify-between'>
          {points === 1 ? 'Almost! You got one!' : points === 2 ? 'Perfect! Exceptional!' : 'Sad. Try again!'}
          <Button
            onClick={() => router.reload()}
            className='relative right-[-5px]'
            css={{
              background: '#90d6f8',
              color: '#000000',
              ':hover': { background: '#4db4e6' }
            }}
          >
            <IoIosArrowRoundForward className='mr-1' />
            Next
          </Button>
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