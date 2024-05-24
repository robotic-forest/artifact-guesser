import { IconButton } from "@/components/buttons/IconButton"
import { BiLinkExternal } from "react-icons/bi"

export const ArtifactImage = ({ artifact, immersive }) => {

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
      <a
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
            : `linear-gradient(0deg, rgba(0, 0, 0, 0.6) 0%, rgba(0, 0, 0, 0.1) 40%, rgba(0, 0, 0, 0.1) 100%)`
        }}
        href={artifact.source.url}
        target='_blank'
      >
        <a
          css={{
            position: 'absolute',
            top: 8,
            right: 8,
          }}
          href={artifact.source.url}
          target='_blank'
          onClick={e => e.stopPropagation()}
        >
          <IconButton tooltip='View Source' css={{
            background: '#ffffff55',
            '&:hover': {
              background: '#ffffffaa'
            }
          }}>
            <BiLinkExternal />
          </IconButton>
        </a>
        <div css={{
          color: 'white',
          position: 'absolute',
          bottom: 0,
          padding: 8,
          display: immersive ? 'none' : 'block',
        }}>
          {artifact.name.length > 60 ? `${artifact.name.slice(0, 60)}...` : artifact.name}
        </div>
      </a>
    </div>
  )
}