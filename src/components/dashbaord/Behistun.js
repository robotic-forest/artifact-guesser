import { useArtifacts } from "@/hooks/artifacts/useArtifacts"
import { themeCSS } from "../GlobalStyles"
import { Dropdown } from "../dropdown/Dropdown"
import { formatDate } from "@/lib/artifactUtils"
import Link from "next/link"
import { IconButton } from "../buttons/IconButton"
import { IoMdClose } from "react-icons/io"
import { useArtifact } from "@/hooks/artifacts/useArtifact"
import toast from "react-hot-toast"
import { GiWaxTablet } from "react-icons/gi"

export const behistunTheme = {
  backgroundColor: '#cb788a',
  primaryColor: '#cb788a',
  textColor: '#000000',
}

export const Behistun = () => {
  const { artifacts } = useArtifacts({
    filter: { inPostQueue: true },
    paginate: {
      defaultPageSize: 12
    }
  })

  return (
    <div css={themeCSS(behistunTheme)}>
      <div className='mb-2' css={{
        background: 'var(--backgroundColorBarelyLight)',
        border: '1px outset',
        borderColor: '#ffffff77 #00000077 #00000077 #ffffff77',
      }}>
        <div className='p-3 pb-2 flex items-center justify-between'>
          <div className='flex items-center'>
            <GiWaxTablet className='mr-2 scale-x-[-1]' />
            <b className='mr-2'>Behistun</b>
            <a href='https://reddit.com/r/ArtefactPorn' className='underline mr-2' target='_blank'>
              r/ArtefactPorn
            </a>
            Post Queue
          </div>
        </div>
        {artifacts?.length> 0 && (
          <div className='m-1 mt-0 p-1 pb-0 pr-0 text-xs flex flex-wrap' css={{
            background: `var(--backgroundColorGhostDark)`,
            borderRadius: 3
          }}>
            {artifacts?.map(artifact =>
              <QueueArtifact key={artifact._id} artifact={artifact} />
            )}
          </div>
        )}
      </div>
    </div>
  )
}

const QueueArtifact = ({ artifact }) => {
  const { updateArtifact } = useArtifact({ artifact })

  const t = artifact.time
  const time = t.start == t.end ? formatDate(t.start) : `${formatDate(t.start)} → ${formatDate(t.end)}`

  return (
    <Link href={`/artifacts/${artifact._id}`} className='min-w-[fit-content]' css={{
      '&:hover': {
        color: 'var(--textColor)',
        '& #remove': {
          opacity: 1,
        }
      }
    }}>
      <Dropdown
        top={4}
        dropdownStyle={{ borderRadius: 4, width: '200px', left: '0' }}
        onHover
        button={(
          <div className='flex items-center justify-between mr-1 mb-1 rounded-[4px] overflow-hidden min-w-[fit-content]' css={{
            border: '1px solid var(--backgroundColorSlightlyDark)',
            background: 'var(--backgroundColorSlightlyLight)',
            cursor: 'pointer',
            transition: 'all 0.2s',
            '&:hover': {
              filter: 'brightness(1.1)',
            },
            boxShadow: 'rgb(0 0 0 / 0%) 0px 0px 0px 0px, rgb(0 0 0 / 0%) 0px 0px 0px 0px, rgb(0 0 0 / 12%) ' +
              '0px 0px 0px 0px, rgb(0 0 0 / 0%) 0px 0px 0px 0px, rgb(64 68 82 / 8%) 0px 2px 5px 0px',
          }}>
            <div className='flex items-center'>
              <img src={artifact.images.external[0]} className='block h-6 w-8 object-cover' />
              <div className='pl-2 pr-2'>
                {artifact.name.length > 32 ? artifact.name.slice(0, 32) + '...' : artifact.name}
              </div>
            </div>
            <IconButton
              id='remove'
              size={18}
              tooltip='Remove'
              css={{
                background: 'transparent',
                marginRight: 3,
                '&:hover': {
                  background: 'var(--backgroundColorBarelyDark)',
                },
                opacity: 0,
                transition: 'all 0.2s',
              }}
              onClick={e => {
                e.preventDefault()
                e.stopPropagation()

                updateArtifact({ inPostQueue: false })
                toast.success('Removed from post queue!')
              }}
            >
              <IoMdClose />
            </IconButton>
          </div>
        )}
      >
        <div css={{ padding: 2 }}>
          <div className='mb-2'>
            <b>{artifact.name}</b>, {artifact.location.country}, {time}
          </div>
          <img src={artifact.images.external[0]} className='rounded' />
        </div>
      </Dropdown>
    </Link>
  )
}
