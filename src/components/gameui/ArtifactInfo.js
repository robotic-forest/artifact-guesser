import { VscLinkExternal } from "react-icons/vsc"
import { Button } from "../buttons/Button"
import { IoIosArrowRoundForward } from "react-icons/io"
import { FaHeart, FaSave } from "react-icons/fa"
import { IconButton } from "../buttons/IconButton"
import useUser from "@/hooks/useUser"
import { DetailsDoubleItem, DetailsItem } from "../info/Details"
import { convertCountries, formatDate, formatLoaction, formatTime } from "@/lib/artifactUtils"
import { useArtifacts } from "@/hooks/artifacts/useArtifacts"

export const ArtifactInfo = ({ artifact, getNewArtifact, selectedDate, selectedCountry }) => {
  const dateIsCorrect = artifact?.time.start <= selectedDate && artifact?.time.end >= selectedDate
  const distanceToDate = Math.min(Math.abs(artifact?.time.start - selectedDate), Math.abs(artifact?.time.end - selectedDate))
  const datePoints = dateIsCorrect ? 100 : Math.round(distanceToDate > 300 ? 0 : 100 - (distanceToDate / 3))
  const countryIsCorrect = convertCountries(artifact?.location.country).includes(selectedCountry)

  const points = datePoints + (countryIsCorrect ? 100 : 0)

  return (
    <>
      <div className='fixed p-1 bottom-0 left-0 z-10 w-[450px] select-none' css={{
        '@media (max-width: 800px)': { display: 'none' }
      }}>
        <ExtraInfo artifact={artifact} />
      </div>

      <div className='fixed p-1 bottom-0 right-0 z-10 w-[350px] select-none' css={{
        '@media (max-width: 800px)': {
          width: '100vw',
        }
      }}>
        <div className='bg-black rounded border border-white/30 mb-1' css={{ padding: '6px 8px' }}>
          {/* <div className='mb-2 flex justify-between items-start'>
            <b><span dangerouslySetInnerHTML={{ __html: artifact?.name }} /></b>
          </div> */}
          <div className='text-white/70 flex justify-between text-sm mb-1'>
            <div>Origin</div>
            <div>Your Guess</div>
          </div>
          <div className='flex justify-between items-start mb-1'>
            {artifact?.time.start == artifact?.time.end
              ? formatDate(artifact?.time.start)
              : `${formatDate(artifact?.time.start)} → ${formatDate(artifact?.time.end)}`
            }
            <div
              className='p-[0px_4px] rounded text-black flex'
              css={{ background: datePoints === 100 ? '#7ae990' : datePoints > 50 ? '#ffc045' : datePoints > 0 ? '#ff7145' :'#ff9999' }}
            >
              {Math.abs(selectedDate)} {selectedDate > 0 ? 'AD' : 'BC'}
            </div>
          </div>
          <div className='flex justify-between items-start mb-1 border-white/30'>
            <div>{artifact?.location.country}</div>
            <div
              className='p-[0px_4px] rounded text-black'
              css={{ background: countryIsCorrect ? '#7ae990' : '#ff9999' }}
            >
              {selectedCountry}
            </div>
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
              onClick={() => getNewArtifact()}
              className='relative right-[-5px]'
              css={{
                background: '#90d6f8',
                color: '#000000',
                ':hover': { background: '#4db4e6' }
              }}
            >
              <IoIosArrowRoundForward className='mr-1' />
              Next Artifact
            </Button>
          </div>
        </div>
        <div className='pt-1' css={{
          '@media (min-width: 800px)': { display: 'none' }
        }}>
          <ExtraInfo artifact={artifact} />
        </div>
      </div>
    </>
  )
}

const ExtraInfo = ({ artifact }) => {
  const { isAdmin } = useUser()
  const { createArtifact } = useArtifacts({ skip: true })

  return (
    <div className='bg-black rounded border border-white/30 mb-1' css={{ padding: '5px 5px 5px 8px' }}>
      <div className='mb-4 flex justify-between items-start'>
        <div className='flex'>
          <img
            src={artifact?.images.thumbnail || artifact?.images.external[0]}
            css={{ width: 50, height: 50, objectFit: 'cover' }}
            className='mr-2.5 mt-1 rounded'
          />
          <div>
            <div className='mb-0.5 flex justify-between items-start'>
              <b><span dangerouslySetInnerHTML={{ __html: artifact?.name }} /></b>
            </div>
            <div className='text-sm'>
              {artifact?.culture && (
                <div className='text-white/70 mb-1'>
                  {artifact?.culture}
                </div>
              )}
            </div>
          </div>
        </div>
        <div className='flex justify-end mb-1.5'>
          {isAdmin && (
            <IconButton onClick={() => createArtifact(artifact)} tooltip='Save for Public' css={{
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
            href={artifact?.source.url}
            target='_blank'
            rel='noreferrer'
          >
            <Button css={{ padding: '2px 6px', '@media (max-width: 800px)': { display: 'none' } }}>
              <VscLinkExternal className='mr-2 text-xs' />
              <span className='relative -top-[1px]'>
                Source
              </span>
            </Button>
            <IconButton css={{
              '@media (min-width: 800px)': { display: 'none' },
              border: '1px solid #ffffff66',
              borderRadius: 3
            }}>
              <VscLinkExternal />
            </IconButton>
          </a>
        </div>
      </div>
      <div>
        <DetailsDoubleItem mb={12}
          item1={{ label: 'Location', value: formatLoaction(artifact?.location) }}
          item2={{ label: 'Time', value: formatTime(artifact?.time) }}
        />
        <DetailsDoubleItem mb={8}
          item1={{ label: 'Medium', value: artifact?.medium }}
          item2={{ label: 'Source', value: artifact?.source.name }}
        />
        <DetailsItem label='Dimensions' value={artifact?.dimensions} />
      </div>
    </div>
  )
}