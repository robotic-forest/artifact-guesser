import { formatLocation, formatTime } from "@/lib/artifactUtils"
import { DetailsDoubleItem } from "@/components/info/Details"
import { FavoritesToggle } from "./FavoritesToggle"
import { useArtifact } from "@/hooks/artifacts/useArtifact"
import useUser from "@/hooks/useUser"
import { IconButton } from "@/components/buttons/IconButton"
import { FaRedditAlien } from "react-icons/fa"
import toast from "react-hot-toast"
import { IoCheckmarkSharp } from "react-icons/io5"

export const ArtifactOverview = ({ artifact, style }) => {
  const { updateArtifact } = useArtifact({ artifact })
  const { isAdmin } = useUser()

  return (
    <div className='w-full' css={style}>
      <div className='mb-4 flex justify-between items-start'>
        <div className='flex'>
          <img
            src={artifact?.images.thumbnail || artifact?.images.external[0]}
            css={{ width: 50, height: 50, objectFit: 'cover' }}
            className='mr-2.5 rounded'
          />
          <div>
            <div className='mb-0.5 flex justify-between items-start mr-2 text-[1.3em]'>
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
        <div className='flex items-center'>
          {isAdmin && (
            <IconButton tooltip={artifact.inPostQueue ? 'Remove from post queue' : 'Add to post queue'} css={{
              background: '#ffffff55',
              '&:hover': {
                background: '#ffffffaa'
              },
              marginRight: 6,
              borderRadius: 3
            }} onClick={() => {
              updateArtifact({ inPostQueue: !artifact.inPostQueue })
              toast.success(`${artifact.inPostQueue ? 'Removed from' : 'Added to'} post queue!`)
            }}>
              {artifact.inPostQueue ? <IoCheckmarkSharp /> :  <FaRedditAlien />}
            </IconButton>
          )}
          <FavoritesToggle artifactId={artifact?._id} />
        </div>
      </div>
      <div>
        <DetailsDoubleItem mb={12}
          item1={{ label: 'Location', value: formatLocation(artifact?.location) }}
          item2={{ label: 'Time', value: formatTime(artifact?.time) }}
        />
        <DetailsDoubleItem mb={8}
          item1={{ label: 'Medium', value: artifact?.medium }}
          item2={{ label: 'Dimensions', value: artifact?.dimensions }}
        />
      </div>
    </div>
  )
}