import { IconButton } from "@/components/buttons/IconButton"
import { useArtifact } from "@/hooks/artifacts/useArtifact"
import useUser from "@/hooks/useUser"
import { formatDateRange } from "@/lib/artifactUtils"
import Link from "next/link"
import toast from "react-hot-toast"
import { BiLinkExternal } from "react-icons/bi"
import { FaRedditAlien } from "react-icons/fa"
import { IoCheckmarkSharp } from "react-icons/io5"

export const ArtifactImage = ({ artifact, immersive, newTab }) => {
  const { isAdmin } = useUser()
  const { updateArtifact } = useArtifact({ artifact })

  return (
    <div css={{
      position: 'relative',
      width: '100%',
      cursor: 'pointer',
      overflow: 'hidden',
      '&:hover': {
        '.overlay': {
          opacity: 1
        }
      },
    }}>
      <img
        src={immersive
          ? artifact.images.external[0]
          : artifact.images.thumbnail || artifact.images.external[0]
        }
        alt={artifact.name}
        css={{
          display: 'block',
          width: '100%',
          height: 'auto',
        }}
      />
      <Link
        className='overlay'
        css={{
          opacity: 0,
          position: 'absolute',
          height: '100%',
          width: '100%',
          zIndex: 1,
          top: 0,
          transition: 'opacity 0.1s ease',
          background: immersive
            ? 'transparent'
            : `linear-gradient(0deg, rgba(0, 0, 0, 0.6) 0%, rgba(0, 0, 0, 0.1) 40%, rgba(0, 0, 0, 0.1) 100%)`,
          '@media (max-width: 800px)': {
            background: 'transparent'
          },
          '&:hover': {
            color: 'var(--textColor)'
          }
        }}
        href={`/artifacts/${artifact._id}`}
        target={newTab ? '_blank' : '_self'}
      >
        <div className='absolute top-2 right-2'>
          <a
            href={artifact?.source.url}
            target='_blank'
            onClick={e => e.stopPropagation()}
          >
            <IconButton tooltip='View Source' size={20} css={{
              background: '#ffffff55',
              '&:hover': {
                background: '#ffffffaa'
              }
            }}>
              <BiLinkExternal />
            </IconButton>
          </a>
          {/* {isAdmin && (
            <IconButton size={20} tooltip={artifact.inPostQueue ? 'Remove from post queue' : 'Add to post queue'} css={{
              background: '#ffffff55',
              '&:hover': {
                background: '#ffffffaa'
              },
              marginTop: 6
            }} onClick={e => {
              e.preventDefault()
              e.stopPropagation()

              if (artifact.postUrl) return toast.error('This artifact has already been posted!')

              updateArtifact({ inPostQueue: !artifact.inPostQueue })
              toast.success(`${artifact.inPostQueue ? 'Removed from' : 'Added to'} post queue!`)
            }}>
              {artifact.inPostQueue ? <IoCheckmarkSharp /> :  <FaRedditAlien />}
            </IconButton>
          )} */}
        </div>
        <div css={{
          color: 'white',
          position: 'absolute',
          bottom: 0,
          padding: 8,
          fontSize: '0.8em',
          display: immersive ? 'none' : 'block',
          '@media (max-width: 800px)': {
            display: 'none'
          }
        }}>
          {artifact.name}, {artifact?.location.country}, {formatDateRange(artifact?.time.start, artifact?.time.end)}
        </div>
      </Link>
    </div>
  )
}