import { VscLinkExternal } from "react-icons/vsc"
import { FaHeart } from "react-icons/fa"
import { formatLocation, formatTime } from "@/lib/artifactUtils"
import { IconButton } from "@/components/buttons/IconButton"
import { DetailsDoubleItem } from "@/components/info/Details"
import { GameButton } from "@/components/buttons/GameButton"
import { useFavorites } from "@/hooks/artifacts/useFavorites"
import { GiAmphora } from "react-icons/gi"
import Link from "next/link"
import { TbEyeFilled } from "react-icons/tb"

export const ArtifactInfo = ({ artifact, style }) => {
  const { isFavorite, toggleFavorite } = useFavorites({ artifactId: artifact?._id })

  const relatedArtifactsHref = `/artifacts?location.country=${artifact?.location.country}` +
    `&startDateAfter=${artifact.time.start - 10}&endDateBefore=${artifact.time.end + 10}` +
    '&imageMode=true'

  return (
    <div className='rounded border border-white/30 w-full' css={{
      background: 'var(--backgroundColor)',
      padding: '5px 5px 5px 8px',
      ...style
    }}>
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
                <div className='mb-1' css={{ color: 'var(--textLowOpacity)' }}>
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
              size={24}
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
            size={24}
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
          <Link
            css={{
              textDecoration: 'none',
              fontSize: '0.9em'
            }}
            href={`/artifacts/${artifact?._id}`}
          >
            <GameButton css={{ padding: '2px 6px', '@media (max-width: 800px)': { display: 'none' } }}>
              <TbEyeFilled className='mr-2 text-xs' />
              <span className='relative -top-[1px]'>
                View
              </span>
            </GameButton>
            <IconButton size={22} css={{
              '@media (min-width: 800px)': { display: 'none' },
              border: '1px solid #ffffff66',
              borderRadius: 3
            }}>
              <TbEyeFilled />
            </IconButton>
          </Link>
        </div>
      </div>
      <div>
        <DetailsDoubleItem mb={12}
          item1={{ label: 'Location', value: formatLocation(artifact?.location) }}
          item2={{ label: 'Time', value: formatTime(artifact?.time) }}
        />
        <DetailsDoubleItem mb={8}
          item1={{ label: 'Medium', value: artifact?.medium }}
          item2={{ label: 'Source', value: (
            <a href={artifact?.source.url} target='_blank' rel='noreferrer' className='inline underline'>
              {artifact?.source.name} <VscLinkExternal size={10} className='inline ml-2 relative top-[-1px]' />
            </a>
          ) }}
        />
      </div>
    </div>
  )
}