import { formatLocation, formatTime } from "@/lib/artifactUtils"
import { DetailsDoubleItemAlt } from "@/components/info/Details"
import { FavoritesToggle } from "./FavoritesToggle"
import { useArtifact } from "@/hooks/artifacts/useArtifact"
import useUser from "@/hooks/useUser"
import { IconButton } from "@/components/buttons/IconButton"
import { FaShare } from "react-icons/fa"
import toast from "react-hot-toast"

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
        <div className='flex items-center gap-1.5'>
          <IconButton
            tooltip='Copy link'
            onClick={() => {
              const url = `${window.location.origin}/artifacts/${artifact?._id}`
              navigator.clipboard.writeText(url)
                .then(() => toast.success('Artifact link copied!'))
                .catch(() => toast.error('Could not copy link'))
            }}
            css={{
              background: 'var(--backgroundColorBarelyLight)',
              '&:hover': {
                background: 'var(--backgroundColorLight)',
                boxShadow: 'none',
              },
              border: '1px outset',
              borderColor: '#ffffff77 #00000077 #00000077 #ffffff77',
              boxShadow: 'none',
              borderRadius: 0,
              height: 24,
              minWidth: 24,
            }}
          >
            <FaShare style={{ fontSize: 11 }} />
          </IconButton>
          <FavoritesToggle artifactId={artifact?._id} />
        </div>
      </div>
      <div>
        <DetailsDoubleItemAlt mb={12}
          item1={{ label: 'Location', value: formatLocation(artifact?.location) }}
          item2={{ label: 'Time', value: formatTime(artifact?.time) }}
        />
        <DetailsDoubleItemAlt mb={12}
          item1={{ label: 'Medium', value: artifact?.medium }}
          item2={artifact?.classification && { label: 'Classification', value: artifact?.classification }}
        />
        {isAdmin && artifact?.quality_score !== undefined && (
          <DetailsDoubleItemAlt mb={12}
            item1={{ label: 'Quality Score', value: `${artifact.quality_score} / 10` }}
            item2={artifact?.source?.name && { label: 'Source', value: artifact.source.name }}
          />
        )}
      </div>
    </div>
  )
}