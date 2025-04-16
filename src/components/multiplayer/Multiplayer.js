import { Chat } from "./chat/Chat";
import { Lobby } from "./Lobby";
import { Title } from "./Title";
import { Options } from "./Options";
import { useEffect, useState, useRef } from 'react'; // Import useEffect, useState, useRef
import { useRouter } from 'next/router'; // Import useRouter
// import { useClients } from "./hooks/useClients"; // Remove this import
import { useMultiplayer } from "./context/MultiplayerContext"; // Use context hook
import { useMultiplayerGame } from "./hooks/useMultiplayerGame";
import { MultiplayerGameUI } from "./MultiplayerGameUI";

const Multiplayer = () => {
  const router = useRouter(); // Get router instance
  const [isNavigating, setIsNavigating] = useState(false); // Re-introduce state
  // Get state and actions from context
  const {
    lobbies,
    currentLobbyId,
    isConnected,
    createLobby, // May not be needed here if only created in LobbyChoice
    joinLobby,   // May not be needed here if only joined in LobbyChoice
    leaveLobby,
    _socket,
    chatMessages,
    lobbyClients, // Get client list from context
    gameState // Get gameState directly from context now
  } = useMultiplayer();

  // Remove the separate useClients hook call
  // const { clients } = useClients(currentLobbyId);
  // Use lobbyClients from context instead
  const clients = lobbyClients;

  // Get only actions from the simplified useMultiplayerGame hook
  const { submitGuess, proceedAfterSummary } = useMultiplayerGame(_socket, currentLobbyId);
  // We now use the gameState obtained directly from useMultiplayer() above

  // --- Navigation Effect ---
  // Navigate back to lobby list when game is acknowledged as ended
  useEffect(() => {
    // Check if the flag is true and we aren't already navigating
    if (gameState.gameEndedAcknowledged && !isNavigating) {
      console.log("[Multiplayer] Game ended acknowledged. Setting navigating flag, calling leaveLobby and navigating.");
      setIsNavigating(true); // Prevent effect re-trigger
      leaveLobby(); // Clear context state *before* navigating
      router.push('/multiplayer'); // Navigate
    }
    // Depend on flag, router, leaveLobby, and isNavigating
  }, [gameState.gameEndedAcknowledged, router, leaveLobby, isNavigating]);

  // Remove the separate cleanup effect

  // Decide what to render based solely on the gameState from the context/hook
  const shouldRenderGameUI = gameState.phase === 'guessing' || gameState.phase === 'round-summary' || gameState.phase === 'game-summary';
  // We rely on the context setting the correct phase upon rejoin.

  console.log('[Multiplayer Render] Deciding UI:', { shouldRenderGameUI, gameStatePhase: gameState.phase, isNavigating });

  // Re-introduce check to prevent rendering during navigation
  if (isNavigating) {
    return null; // Or a loading spinner
  }

  if (shouldRenderGameUI) {
    // --- Render Game View ---
    // The useMultiplayerGame hook handles initializing from restoredGameState via useEffect
    return (
      <MultiplayerGameUI
         gameState={gameState}
         submitGuess={submitGuess}
         proceedAfterSummary={proceedAfterSummary}
         // currentUserId={_socket?.id} // Removed prop
       />
     );
   }

  console.log(lobbies, currentLobbyId, chatMessages)

  // --- Render Lobby View ---
  return (
    // Add background color here
    <div className='flex flex-col items-center min-h-screen justify-center font-mono absolute top-0 w-full' css={{
      background: 'var(--backgroundColor)', // Assuming this is your clay color
      '& *': { transition: 'all 0.2s ease-in-out, width 0s, max-width 0s' }
    }}>
      <div className='p-6 w-screen grid grid-cols-2 gap-6 max-w-[1200px]' css={{
        '@media (max-width: 800px)': { gridTemplateColumns: '1fr' }
      }}>
        <div className='flex flex-col' css={{
          '@media (max-width: 800px)': { alignItems: 'center' }
        }}>
          <Title isLobby={!!currentLobbyId} />
          {/* TODO: Pass lobby list and join/create functions to Lobby or a new LobbyList component */}
          {/* Pass lobby list and join/create functions to Lobby or a new LobbyList component */}
          <Lobby {...{ clients, lobbies, joinLobby, currentLobbyId, leaveLobby }} />
          {/* Pass lobbyId, socket instance and messages to Chat */}
          <Chat lobbyId={currentLobbyId} _socket={_socket} chatMessages={chatMessages} />
        </div>
        <div css={{
          '@media (min-width: 800px)': { marginTop: 60 }
        }}>
          {/* Pass createLobby, lobby settings state, socket instance, and potentially start game function */}
          <Options {...{ clients, createLobby, currentLobbyId, _socket }} />
        </div>
      </div>
      {/* Display connection status indicator? */}
      {!isConnected && <div className="fixed bottom-2 left-2 bg-red-500 text-white p-2 rounded">Disconnected</div>}
    </div>
  )
}

export default Multiplayer
