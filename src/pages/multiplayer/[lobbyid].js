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
import useUser from '@/hooks/useUser';

const LobbyPage = () => {
  useTheme(artifactsTheme); // Apply the theme
  const router = useRouter();
  const { user, isLoading: userLoading } = useUser(); // Get user status
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
     lobbyJoinStatus, // Get the new join status
     // Add any other necessary state/actions from context
   } = useMultiplayer();

  // Get game actions if needed
  const { submitGuess, proceedAfterSummary } = useMultiplayerGame(_socket, currentLobbyId);

  useEffect(() => {
    // Removed the redirect block based on !userLoading && !user.
    // Authentication checks should ideally be handled higher up (e.g., _app.js or Layout)
    // or rely on the rendering logic below which already checks user state.

    // Join the lobby when the component mounts, lobbyid is available, socket is connected,
    // user is loaded and logged in, we are not currently leaving, the current lobby ID doesn't match the URL ID,
    // AND the join status is idle (not pending or failed).
    if (!userLoading && user && lobbyid && typeof lobbyid === 'string' && isConnected && !isLeaving && currentLobbyId !== lobbyid && lobbyJoinStatus === 'idle') {
      console.log(`[LobbyPage] Attempting to join lobby: ${lobbyid} (Status: ${lobbyJoinStatus})`);
      joinLobby(lobbyid);
    }

    // Cleanup for the join logic effect (no longer handles leaving)
    return () => {};
  }, [lobbyid, isConnected, joinLobby, currentLobbyId, isLeaving, lobbyJoinStatus, user, userLoading, router]); // Removed leaveLobby from dependencies here

  // Effect to handle leaving the lobby on route change
  useEffect(() => {
    const handleRouteChangeStart = (url) => {
      // Check if we are currently in the lobby corresponding to the URL's lobbyid
      // and if the navigation is actually taking us away from this lobby page.
      // A simple check might be if the new URL doesn't contain the current lobbyid,
      // but more robust checks might be needed depending on app structure.
      // Check if the navigation is actually taking us away from this specific lobby page.
      // If the new URL still matches the pattern /multiplayer/[lobbyid] AND the lobbyid is the same,
      // it might be a refresh or internal navigation within the lobby context we don't want to leave for.
      // A simple check: if the new URL is different from the current lobby page URL.
      const currentPath = `/multiplayer/${lobbyid}`;
      if (currentLobbyId === lobbyid && typeof lobbyid === 'string' && url !== currentPath) {
        console.log(`[LobbyPage] routeChangeStart detected. Leaving lobby: ${lobbyid}. Navigating to: ${url}`);
        leaveLobby();
      } else if (url === currentPath) {
         console.log(`[LobbyPage] routeChangeStart detected for the same URL (${url}). Assuming refresh or internal navigation, not leaving lobby.`);
      }
    };

    router.events.on('routeChangeStart', handleRouteChangeStart);

    // Cleanup function to remove the event listener
    return () => {
      router.events.off('routeChangeStart', handleRouteChangeStart);
    };
  }, [router.events, leaveLobby, currentLobbyId, lobbyid]); // Dependencies for the leave logic


  // --- Loading / Error States ---
  // Show loading if user status is still loading
  if (userLoading) {
    return (
      <div css={createStyles(artifactsTheme)}>
        <div className="flex items-center justify-center min-h-screen"><SuperKaballah speed={500} color={'#000000'} /></div>
      </div>
    );
  }

  // If user is loaded but not logged in, show loading briefly while redirect happens (or null)
  // The useEffect above should handle the redirect quickly.
  if (!user) {
     return (
      <div css={createStyles(artifactsTheme)}>
        <div className="flex items-center justify-center min-h-screen"><SuperKaballah speed={500} color={'#000000'} /></div>
      </div>
    ); // Or return null;
  }

  // Wrap the entire return in the themed div (only render if user is logged in)
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
