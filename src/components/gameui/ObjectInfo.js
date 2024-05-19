import { VscLinkExternal } from "react-icons/vsc"
import { Button } from "../buttons/Button"
import { useRouter } from "next/router"
import { IoIosArrowRoundForward } from "react-icons/io"
import { FaHeart, FaSave } from "react-icons/fa"
import { IconButton } from "../buttons/IconButton"
import useUser from "@/hooks/useUser"
import { convertMet } from "@/lib/objectConverters"
import { useArtifacts } from "@/hooks/useArtifacts"

export const ObjectInfo = ({ object, selectedDate, selectedCountry }) => {
  const { isAdmin } = useUser()
  const router = useRouter()
  const { createArtifact } = useArtifacts()

  const dateIsCorrect = object?.objectBeginDate <= selectedDate && object?.objectEndDate >= selectedDate
  const distanceToDate = Math.min(Math.abs(object?.objectBeginDate - selectedDate), Math.abs(object?.objectEndDate - selectedDate))
  const datePoints = dateIsCorrect ? 100 : Math.round(distanceToDate > 300 ? 0 : 100 - (distanceToDate / 3))
  const countryIsCorrect = convertCountries(object?.country).includes(selectedCountry)

  const points = datePoints + (countryIsCorrect ? 100 : 0)

  const saveForPublic = () => createArtifact(convertMet(object))

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
            className='p-[0px_4px] rounded text-black flex'
            css={{ background: datePoints === 100 ? '#7ae990' : datePoints > 50 ? '#ffc045' : datePoints > 0 ? '#ff7145' :'#ff9999' }}
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
            <IconButton onClick={saveForPublic} tooltip='Save for Public' css={{
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
        background: points > 175 ? '#7ae990' : points > 100 ? '#ffc045' : '#ff9999'
      }}>
        <div className='flex justify-between text-sm mb-2'>
          <div className='text-black/70'>Points</div>
          <div>{points} / 200</div>
        </div>
        <div className='flex justify-between'>
          {points === 200 ? 'Perfect! Thats amazing!' : points > 160 ? 'Wow, impressive!' : points > 100 ? 'Not bad!' : points > 0 ? 'Oh well. Try again!' : 'Oof.'}
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

const convertCountries = country => {
  if (['United States', 'USA', 'US'].includes(country)) return 'United States'
  if (['United Kingdom', 'UK', 'England', 'Great Britain'].includes(country)) return 'United Kingdom'
  if (['South Korea', 'Korea'].includes(country)) return 'South Korea'
  if (['Czech Republic', 'Czechia'].includes(country)) return 'Czech Republic'
  if (['Congo', 'Congo Republic', 'Republic of Congo'].includes(country)) return 'Congo'
  if (['Congo Democratic Republic', 'DR Congo', 'DRC'].includes(country)) return 'Democratic Republic of the Congo'
  if (['Ivory Coast', 'Côte d’Ivoire'].includes(country)) return 'Ivory Coast'
  if (['Burma', 'Myanmar'].includes(country)) return 'Myanmar'
  if (['East Timor', 'Timor-Leste'].includes(country)) return 'Timor-Leste'
  if (['Cape Verde', 'Cabo Verde'].includes(country)) return 'Cape Verde'
  if (['São Tomé and Príncipe', 'Sao Tome and Principe'].includes(country)) return 'São Tomé and Príncipe'

  return country
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