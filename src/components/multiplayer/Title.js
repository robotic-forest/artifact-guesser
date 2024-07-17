import { GiGreekSphinx } from "react-icons/gi"
import { Artifact3D } from "../art/Artifact3D"
import { GrReturn } from "react-icons/gr"
import { IconButton } from "../buttons/IconButton"
import { useQuery } from "@/hooks/useQuery"
import { socket } from "@/pages/_app"
import useUser from "@/hooks/useUser"

export const Title = ({ isLobby }) => {
  const { user } = useUser()
  const { query, setQuery } = useQuery()

  return (
    <div className='flex items-center mr-6 relative left-[-16px] overflow-hidden w-full max-w-[85vw]' css={{
      justifyContent: isLobby ? 'space-between' : 'start',
    }}>
      <div className='flex items-center'>
        <Artifact3D
          url='/3D/ram-amun.glb'
          canvasStyle={{ width: 120, height: 120 }}
          scale={1}
          cameraPosition={[5, 5, 5]}
          noZoom
        />
        <div className='ml-4'>
          <div className='flex items-center' css={{
            color: 'var(--textLowOpacity)',
          }}>
            <GiGreekSphinx className ='mr-2' />
            Artifact Guesser
          </div>
          <div className='mt-1 text-3xl font-bold'>
            Multiplayer
          </div>
        </div>
      </div>
      {isLobby && (
        <IconButton
          size={28}
          tooltip='Leave Lobby'
          tooltipPlace='left'
          css={{
            background: 'var(--backgroundColorLight)',
            '&:hover': {
              background: 'var(--backgroundColorLight)',
              filter: 'brightness(1.1)',
            }
          }}
          onClick={() => {
            socket.emit('leave', { username: user.username, lobby: query.lobby })
            setQuery()
          }}
        >
          <GrReturn />
        </IconButton>
      )}
    </div>
  )
}