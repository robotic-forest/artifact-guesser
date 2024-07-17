import { Chat } from "./chat/Chat"
import { Lobby } from "./Lobby"
import { Title } from "./Title"
import { Options } from "./Options"
import { useClients } from "./hooks/useClients"
import { useQuery } from "@/hooks/useQuery"

const Multiplayer = () => {
  const { lobby } = useLobby()
  const { clients } = useClients()

  return (
    <div className='flex flex-col items-center min-h-screen justify-center font-mono absolute top-0 w-full' css={{
      '& *': { transition: 'all 0.2s ease-in-out, width 0s, max-width 0s' }
    }}>
      <div className='p-6 w-screen grid grid-cols-2 gap-6 max-w-[1200px]' css={{
        '@media (max-width: 800px)': { gridTemplateColumns: '1fr' }
      }}>
        <div className='flex flex-col' css={{
          '@media (max-width: 800px)': { alignItems: 'center' }
        }}>
          <Title isLobby />
          <Lobby {...{ clients }} />
          <Chat />
        </div>
        <div css={{
          '@media (min-width: 800px)': { marginTop: 60 }
        }}>
          <Options {...{ clients }} />
        </div>
      </div>
    </div>
  )
}

export default Multiplayer