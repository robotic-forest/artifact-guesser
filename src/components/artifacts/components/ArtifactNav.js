import { formatDateRange } from "@/lib/artifactUtils"
import { useRouter } from "next/router"
import { GiAmphora } from "react-icons/gi"
import useUser from "@/hooks/useUser"
import { IconButton } from "@/components/buttons/IconButton"

export const ArtifactNav = ({ artifact: a, previousRoute }) => {
  const { user } = useUser()
  const router = useRouter()

  return (
    <div className='absolute top-1 left-1.5 z-10 flex items-center' css={{
      padding: user?.isLoggedIn ? 0 : '8px 0 0 40px',
      '@media (max-width: 768px)': {
        padding: '8px 0 0 40px',
      }
    }}>
      <IconButton onClick={() => router.push(previousRoute?.includes('/artifacts?') ? previousRoute : '/artifacts')} css={{
        background: 'black',
        color: 'white',
        border: '1px solid #ffffff55',
        '&:hover': {
          background: '#343434',
          color: 'white'
        },
        marginRight: 4
      }}>
        <GiAmphora />
      </IconButton>
      <div className='p-[1px_6px_1.5px] rounded text-white bg-black border border-white/30 hidden' css={{
        '@media (min-width: 768px)': {
          display: 'flex'
        }
      }}>
        {a.name}, {a?.location.country}, {formatDateRange(a?.time.start, a?.time.end)}
      </div>
    </div>
  )
}