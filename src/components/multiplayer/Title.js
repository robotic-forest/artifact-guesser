import { GiGreekSphinx } from "react-icons/gi"
import { Artifact3D } from "../art/Artifact3D"
import { GrReturn } from "react-icons/gr";
import { IconButton } from "../buttons/IconButton";
// import { useQuery } from "@/hooks/useQuery"; // No longer needed
// import { socket } from "@/pages/_app"; // Use context socket
// import useUser from "@/hooks/useUser"; // User info comes from context actions if needed
import { useMultiplayer } from "./context/MultiplayerContext"; // Use context hook

export const Title = () => { // Remove isLobby prop
  const { currentLobbyId, leaveLobby } = useMultiplayer(); // Get state and action from context

  return (
    <div className='flex items-center mr-6 relative left-[-16px] overflow-hidden w-full max-w-[85vw]' css={{
      justifyContent: currentLobbyId ? 'space-between' : 'start', // Adjust based on context state
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
      {/* Show leave button only if in a lobby */}
      {currentLobbyId && (
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
          onClick={leaveLobby} // Call the leaveLobby function from context
        >
          <GrReturn />
        </IconButton>
      )}
    </div>
  )
}
