import { Chat } from "./chat/Chat";
import { Lobby } from "./Lobby";
import { Title } from "./Title";
import { Options } from "./Options";
import { useEffect, useState } from 'react'; // Import useEffect and useState
import { useRouter } from 'next/router'; // Import useRouter
// import { useClients } from "./hooks/useClients"; // Remove this import
import { useMultiplayer } from "./context/MultiplayerContext"; // Use context hook
import { useMultiplayerGame } from "./hooks/useMultiplayerGame";
import { MultiplayerGameUI } from "./MultiplayerGameUI";

const Multiplayer = () => {
  const router = useRouter(); // Get router instance
  const [isNavigating, setIsNavigating] = useState(false); // State to track navigation
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
    restoredGameState // Get restored state from context
  } = useMultiplayer();

  // Remove the separate useClients hook call
  // const { clients } = useClients(currentLobbyId);
  // Use lobbyClients from context instead
  const clients = lobbyClients;

  // Get multiplayer game state
  const { gameState, submitGuess, proceedAfterSummary } = useMultiplayerGame(_socket, currentLobbyId);

  // --- Navigation Effect ---
  // Navigate back to lobby list when game is acknowledged as ended
  useEffect(() => {
    // Check if the flag is true and we aren't already navigating
    if (gameState.gameEndedAcknowledged && !isNavigating) {
      console.log("[Multiplayer] Game ended acknowledged. Setting navigating flag and navigating back to lobby list.");
      setIsNavigating(true); // Set navigating flag
      // Navigate to the lobby list page - DO NOT call leaveLobby here
      router.push('/multiplayer');
    }
    // Only depend on the flag, router, and isNavigating state
  }, [gameState.gameEndedAcknowledged, router, isNavigating]);

  // --- Cleanup Effect ---
  // Call leaveLobby when the component unmounts *if* we triggered the navigation
  useEffect(() => {
    // Store isNavigating in a ref to access the latest value in the cleanup function
    const isNavigatingRef = { current: isNavigating };
    isNavigatingRef.current = isNavigating;

    return () => {
      // Check the ref's value on unmount
      if (isNavigatingRef.current) {
        console.log("[Multiplayer] Unmounting after navigation trigger. Calling leaveLobby.");
        leaveLobby(); // Call leaveLobby here during cleanup
      }
    };
    // Add leaveLobby to dependencies here so the cleanup function has access to the correct instance
  }, [isNavigating, leaveLobby]); // Depend on isNavigating and leaveLobby

  // Decide what to render: Show Game UI if the hook's state indicates an active game OR if the context has restored state waiting to be applied by the hook.
  const shouldRenderGameUI = restoredGameState || gameState.isActive || gameState.phase === 'round-summary' || gameState.phase === 'game-summary';

  console.log('[Multiplayer Render] Deciding UI:', { shouldRenderGameUI, hasRestoredState: !!restoredGameState, gameStateIsActive: gameState.isActive, gameStatePhase: gameState.phase, isNavigating });

  // If navigating, render nothing to prevent flicker/state issues
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
