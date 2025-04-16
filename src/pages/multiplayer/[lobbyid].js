import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useTheme } from "@emotion/react"; // Import useTheme
import { createStyles } from "@/components/GlobalStyles"; // Import createStyles
import { artifactsTheme } from "../artifacts"; // Import artifactsTheme
import { useMultiplayer } from '@/components/multiplayer/context/MultiplayerContext';
import { MultiplayerGameUI } from '@/components/multiplayer/MultiplayerGameUI';
import { Lobby } from '@/components/multiplayer/Lobby';
import { Chat } from '@/components/multiplayer/chat/Chat';
import { Options } from '@/components/multiplayer/Options';
import { Title } from '@/components/multiplayer/Title';
import { AuthHeader } from '@/components/layout/AuthHeader';
import { useMultiplayerGame } from '@/components/multiplayer/hooks/useMultiplayerGame'; // Assuming this is needed for game actions
import { SuperKaballah } from '@/components/art/Kaballah';

const LobbyPage = () => {
  useTheme(artifactsTheme); // Apply the theme
  const router = useRouter();
  const { lobbyid } = router.query; // Get lobbyid from URL

  const {
    lobbies, // Maybe not needed directly here, but Lobby component might use it
    currentLobbyId,
    isConnected,
    joinLobby,
    leaveLobby, // Needed if user navigates away or explicitly leaves
    _socket,
    chatMessages,
    lobbyClients,
    gameState,
    isLeaving, // Get the new leaving flag
    // Add any other necessary state/actions from context
  } = useMultiplayer();

  // Get game actions if needed
  const { submitGuess, proceedAfterSummary } = useMultiplayerGame(_socket, currentLobbyId);

  useEffect(() => {
    // Join the lobby when the component mounts, lobbyid is available, socket is connected,
    // we are not currently leaving, and the current lobby ID doesn't match the URL ID.
    if (lobbyid && typeof lobbyid === 'string' && isConnected && !isLeaving && currentLobbyId !== lobbyid) {
      console.log(`Attempting to join lobby: ${lobbyid}`);
      joinLobby(lobbyid);
    }

    // Optional: Handle leaving the lobby when the component unmounts or lobbyid changes
    // This might be complex depending on desired UX (e.g., navigating back vs closing tab)
    // return () => {
    //   if (currentLobbyId === lobbyid && typeof lobbyid === 'string') {
    //     console.log(`Leaving lobby: ${lobbyid}`);
    //     leaveLobby(); // Consider if this is the desired behavior on component unmount
    //   }
    // };
  }, [lobbyid, isConnected, joinLobby, currentLobbyId, leaveLobby, isLeaving]); // Add isLeaving to dependencies

  // --- Loading / Error States ---
  // Wrap the entire return in the themed div
  return (
    <div css={createStyles(artifactsTheme)}>
      {!isConnected && <div className="flex items-center justify-center min-h-screen">Connecting...</div>}
      {isConnected && (!lobbyid || typeof lobbyid !== 'string') && (
        // Wait for router query to be populated
        <div className="flex items-center justify-center min-h-screen"><SuperKaballah speed={500} color={'#000000'} /></div>
      )}
      {isConnected && lobbyid && typeof lobbyid === 'string' && currentLobbyId !== lobbyid && (
        // Check if we are actually in the lobby specified by the URL
        // Show loading state while joining
        <div className="flex items-center justify-center min-h-screen">
          <SuperKaballah speed={500} color={'#000000'} />
        </div>
      )}
      {isConnected && lobbyid && typeof lobbyid === 'string' && currentLobbyId === lobbyid && (() => {
        // --- Decide what to render based on gameState ---
        const shouldRenderGameUI = gameState.phase === 'guessing' || gameState.phase === 'round-summary' || gameState.phase === 'game-summary';

        if (shouldRenderGameUI) {
          // --- Render Game View ---
          return (
            <MultiplayerGameUI
              gameState={gameState}
              submitGuess={submitGuess}
              proceedAfterSummary={proceedAfterSummary}
            />
          );
        }

        // --- Render Lobby View ---
        // Reusing the structure from Multiplayer.js (consider refactoring into a shared Layout component later)
        return (
          <div className='flex flex-col items-center min-h-screen justify-center font-mono absolute top-0 w-full' css={{
            background: 'var(--backgroundColor)', // Use theme variable if available
            '& *': { transition: 'all 0.2s ease-in-out, width 0s, max-width 0s' }
          }}>
            <div css={{ position: 'absolute', top: 16, right: 16, zIndex: 10 }}>
              <AuthHeader />
            </div>
            <div className='p-6 pb-[180px] w-screen grid grid-cols-2 gap-6 max-w-[1200px]' css={{
              '@media (max-width: 800px)': {
                gridTemplateColumns: '1fr'
              }
            }}>
              <div className='flex flex-col' css={{
                '@media (max-width: 800px)': { alignItems: 'center' }
              }}>
                <Title isLobby={!!currentLobbyId} />
                {/* Pass necessary props to Lobby */}
                <Lobby clients={lobbyClients} lobbies={lobbies} joinLobby={joinLobby} currentLobbyId={currentLobbyId} leaveLobby={leaveLobby} />
                {/* Pass necessary props to Chat */}
                <Chat lobbyId={currentLobbyId} _socket={_socket} chatMessages={chatMessages} />
              </div>
              <div css={{
                '@media (min-width: 800px)': { marginTop: 60 }
              }}>
                {/* Pass necessary props to Options. createLobby is likely not needed here. */}
                {/* Game start logic needs to be handled via socket events triggered by Options */}
                <Options clients={lobbyClients} currentLobbyId={currentLobbyId} _socket={_socket} />
              </div>
            </div>
            {!isConnected && <div className="fixed bottom-2 left-2 bg-red-500 text-white p-2 rounded">Disconnected</div>}
          </div>
        );
      })()}
    </div>
  );
};

export default LobbyPage;
