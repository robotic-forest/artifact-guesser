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
  // (Note: Game UI itself is now primarily handled by [lobbyid].js, but Multiplayer component might still be needed for lobby view)
  if (currentLobbyId && typeof window !== 'undefined' && sessionStorage.getItem('ag_gameActive') === 'true') {
    // If we have a lobby ID and the game was marked active in session storage,
    // render the Multiplayer component. It will show the lobby view until the game state fully loads
    // or if the game ended. The [lobbyid].js page handles the actual game UI rendering.
    return <div className="relative"><Multiplayer /></div>;
  }

  if (currentLobbyId) {
    return <div className="relative"><div className="flex items-center justify-center h-screen text-black">Entering lobby...</div></div>;
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
