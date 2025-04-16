import { useTheme } from "@emotion/react";
import { createStyles } from "@/components/GlobalStyles";
import { artifactsTheme } from "../artifacts";
import { LobbyChoice } from "@/components/multiplayer/LobbyChoice";
import Multiplayer from "@/components/multiplayer/Multiplayer";
import { useMultiplayer } from "@/components/multiplayer/context/MultiplayerContext"; // Import Provider and hook
// Removed incorrect GlobalChatProvider import

// Inner component to access context after provider is mounted
const MultiplayerPageContent = () => {
  const { currentLobbyId, isConnected, isRegistered } = useMultiplayer();
  console.log({ currentLobbyId, isConnected, isRegistered })

  // 1. Handle initial connection/registration phase
  if (!isConnected || !isRegistered) {
    return <div className="relative"><div className="flex items-center justify-center h-screen text-black">Connecting...</div></div>;
  }

  // 2. Handle the rejoin scenario after refresh OR normal lobby entry when game is active
  if (currentLobbyId && typeof window !== 'undefined' && sessionStorage.getItem('ag_gameActive') === 'true') {
    // If we have a lobby ID and the game was marked active in session storage,
    // render the Multiplayer component immediately.
    // The useMultiplayerGame hook inside Multiplayer will handle applying the
    // restored state correctly if it exists for the rejoining user.
    // For the user who didn't refresh, this ensures they stay in the game view.
    return <div className="relative"><Multiplayer /></div>;
  }

  // 3. Handle being in a lobby normally (game not started, or joined after game ended)
  if (currentLobbyId) {
    return <div className="relative"><Multiplayer /></div>; // Render Multiplayer which shows lobby details/start button
  }

  // 4. Default: Connected and registered, but not in any lobby
  return <div className="relative"><LobbyChoice /></div>;
}

const MultiplayerPage = () => {
  useTheme(artifactsTheme);

  // Wrap the content with the Multiplayer Provider only
  return (
    <div css={createStyles(artifactsTheme)}>
      <MultiplayerPageContent />
    </div>
  );
};

export default MultiplayerPage;
