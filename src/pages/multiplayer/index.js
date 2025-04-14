import { useTheme } from "@emotion/react";
import { createStyles } from "@/components/GlobalStyles";
import { artifactsTheme } from "../artifacts";
import { LobbyChoice } from "@/components/multiplayer/LobbyChoice";
import Multiplayer from "@/components/multiplayer/Multiplayer";
import { MultiplayerProvider, useMultiplayer } from "@/components/multiplayer/context/MultiplayerContext"; // Import Provider and hook

// Inner component to access context after provider is mounted
const MultiplayerPageContent = () => {
  const { currentLobbyId, isConnected } = useMultiplayer(); // Use the context hook

  // Display loading or connection state if needed
  // This logic might be better placed inside LobbyChoice now
  // if (!isConnected) {
  //   return <div>Connecting...</div>;
  // }

  return (
    <div className='relative'>
      {/* Render LobbyChoice if not in a lobby, otherwise render the Multiplayer component */}
      {currentLobbyId ? <Multiplayer /> : <LobbyChoice />}
    </div>
  );
}

const MultiplayerPage = () => {
  useTheme(artifactsTheme);

  // Wrap the content with the Provider
  return (
    <MultiplayerProvider>
      <div css={createStyles(artifactsTheme)}>
        <MultiplayerPageContent />
      </div>
    </MultiplayerProvider>
  );
};

export default MultiplayerPage;
