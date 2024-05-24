import { VscLinkExternal } from "react-icons/vsc"
import { FaHeart } from "react-icons/fa"
import { formatLocation, formatTime } from "@/lib/artifactUtils"
import { IconButton } from "@/components/buttons/IconButton"
import { DetailsDoubleItem, DetailsItem } from "@/components/info/Details"
import { GameButton } from "@/components/buttons/GameButton"
import { useFavorites } from "@/hooks/artifacts/useFavorites"
import { GiAmphora } from "react-icons/gi"
import Link from "next/link"

export const ArtifactInfo = ({ artifact, style }) => {
  const { isFavorite, toggleFavorite } = useFavorites({ artifactId: artifact?._id })

  const relatedArtifactsHref = `/artifacts?location.country=${artifact?.location.country}` +
    `&startDateAfter=${artifact.time.start - 10}&endDateBefore=${artifact.time.end + 10}` +
    '&imageMode=true'

  return (
    <div className='bg-black rounded border border-white/30 w-full' css={{ padding: '5px 5px 5px 8px', ...style }}>
      <div className='mb-4 flex justify-between items-start'>
        <div className='flex'>
          <img
            src={artifact?.images.thumbnail || artifact?.images.external[0]}
            css={{ width: 50, height: 50, objectFit: 'cover' }}
            className='mr-2.5 mt-1 rounded'
          />
          <div>
            <div className='mb-0.5 flex justify-between items-start mr-2'>
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
          <Link href={relatedArtifactsHref}>
            <IconButton
              tooltip='View Related Artifacts'
              size={22}
              iconSize={10}
              css={{
                border: '1px solid #ffffff66',
                color: 'black',
                background: '#35ad8d',
                marginRight: 6,
                borderRadius: 3,
                '&:hover': {
                  background: '#35ad8dcc',
                  color: 'black'
                }
              }}
            >
              <GiAmphora />
            </IconButton>
          </Link>
          <IconButton
            tooltip={isFavorite ? 'Unfavorite' : 'Favorite'}
            onClick={toggleFavorite}
            size={22}
            iconSize={10}
            css={{
              border: '1px solid #ffffff66',
              marginRight: 6,
              borderRadius: 3,
              '&:hover': { background: 'var(--backgroundColorLight2)' }
            }}
          >
            <FaHeart color={isFavorite ? 'green' :  '#ff4f4f'} />
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
            <GameButton css={{ padding: '2px 6px', '@media (max-width: 800px)': { display: 'none' } }}>
              <VscLinkExternal className='mr-2 text-xs' />
              <span className='relative -top-[1px]'>
                Source
              </span>
            </GameButton>
            <IconButton size={22} css={{
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
          item1={{ label: 'Location', value: formatLocation(artifact?.location) }}
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