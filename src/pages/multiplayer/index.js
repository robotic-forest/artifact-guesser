import { useEffect, useState } from 'react'; // Import useEffect and useState
import { useRouter } from 'next/router'; // Import useRouter
import { useTheme } from "@emotion/react";
import { createStyles } from "@/components/GlobalStyles";
import { artifactsTheme } from "../artifacts";
import { LobbyChoice } from "@/components/multiplayer/LobbyChoice";
import Multiplayer from "@/components/multiplayer/Multiplayer";
import { useMultiplayer } from "@/components/multiplayer/context/MultiplayerContext"; // Import Provider and hook
// Removed incorrect GlobalChatProvider import

// Inner component to access context after provider is mounted
const MultiplayerPageContent = () => {
  const router = useRouter(); // Get router instance
  const [isNavigating, setIsNavigating] = useState(false); // State for navigation status
  const { currentLobbyId, isConnected, isRegistered, isLeaving, setIsLeaving } = useMultiplayer(); // Get isLeaving and setIsLeaving

  // Reset the isLeaving flag when landing on this page
  useEffect(() => {
    if (isLeaving) {
      console.log("[MultiplayerPageContent] Resetting isLeaving flag.");
      setIsLeaving(false);
    }
  }, [isLeaving, setIsLeaving]); // Add dependencies

  // Effect to track route changes
  useEffect(() => {
    const handleRouteChangeStart = () => {
      console.log('Route change start...');
      setIsNavigating(true);
    };
    const handleRouteChangeComplete = () => {
      console.log('Route change complete.');
      setIsNavigating(false);
    };
    const handleRouteChangeError = () => {
      console.error('Route change error.');
      setIsNavigating(false); // Also reset on error
    };

    router.events.on('routeChangeStart', handleRouteChangeStart);
    router.events.on('routeChangeComplete', handleRouteChangeComplete);
    router.events.on('routeChangeError', handleRouteChangeError);

    // Cleanup function to remove listeners
    return () => {
      router.events.off('routeChangeStart', handleRouteChangeStart);
      router.events.off('routeChangeComplete', handleRouteChangeComplete);
      router.events.off('routeChangeError', handleRouteChangeError);
    };
  }, [router.events]); // Dependency on router.events

  // 1. Handle initial connection/registration phase
  if (!isConnected || !isRegistered || (currentLobbyId && isNavigating)) {
    return <div className="relative"><div className="flex items-center justify-center h-screen text-black">Connecting...</div></div>;
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
