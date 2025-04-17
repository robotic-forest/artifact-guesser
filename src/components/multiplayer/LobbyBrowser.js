import React from 'react';
import dynamic from 'next/dynamic'; // Import dynamic
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import { useMultiplayer } from '@/components/multiplayer/context/MultiplayerContext';
import useUser from '@/hooks/useUser';
import useAAAAtoast from '@/hooks/useAAAAtoast'; // Import the hook
import { Tag } from '@/components/tag/Tag';
import { Dropdown } from '@/components/dropdown/Dropdown';
import { modes } from '@/components/gameui/ModeButton';
import AAAAAA from '@/components/art/AAAAAA';
import { generateInsult } from '@/hooks/useInsult';

// Dynamically import AAAAAAConfetti
const AAAAAAConfettiDynamic = dynamic(() => import('@/components/art/AAAAAAConfetti'), {
  ssr: false,
});

export const LobbyBrowser = ({ backgroundColor }) => {
  const { triggerAAAAtoast, showConfetti } = useAAAAtoast(); // Initialize the hook
  const { lobbies, joinLobby } = useMultiplayer();
  const { user } = useUser();
  const router = useRouter(); // Although joinLobby handles navigation, keep it for potential future use

  // Filter out lobbies that are currently in progress OR private
  const availableLobbies = lobbies?.filter(lobby =>
    !lobby.inProgress &&
    (lobby.settings?.isPublic === undefined || lobby.settings?.isPublic === true) // Show public or undefined (default public)
  ) || [];

  if (availableLobbies.length === 0) {
    return null; // Render nothing if no available lobbies
  }

  const handleJoinClick = (lobbyId) => {
    console.log('called')
    if (user?.isLoggedIn) {
      joinLobby(lobbyId);
      router.push(`/multiplayer/${lobbyId}`); // Navigate to the lobby page after joining
    } else {
      // Extract JSX for clarity
      const toastText = (
        <>
          Log in or sign up<br/>
          to join a lobby,<br/>
          you {generateInsult('name')}!
        </>
      );
      // Use the hook to trigger the toast/confetti
      triggerAAAAtoast(
        { // Props for AAAAAA component
          initialAngry: true,
          initialText: toastText, // Use the variable here
          initialWidth: 280,
          angle: -5,
          textColor: '#ffffff',
          style: { padding: '0 12px 12px 0' }
        },
        { position: 'bottom-center' } // Toast options
      );
    }
  };

  return (
    <>
      {/* Conditionally render confetti */}
      {showConfetti && <AAAAAAConfettiDynamic />}
      {/* Position this container appropriately relative to GlobalChat */}
      {/* Using similar styling to GlobalChat's inactive state for consistency */}
      <div className="p-1 px-2 text-xs"
        css={{ background: backgroundColor || 'var(--backgroundColor)', color: 'var(--textColorLowOpacity)', border: '1px solid var(--borderColor)', marginTop: '2px', width: 'fit-content' }}>
        <span className=" mr-2" css={{ color: 'var(--textColor)' }}>Lobbies</span>
      <div className="inline-flex flex-wrap gap-1 items-center"> {/* Use flex-wrap for multiple lobbies, added items-center */}
        {availableLobbies.slice(0, 5).map((lobby) => {
          // Access data based on provided structure
          const mode = lobby.settings?.mode;
          const rounds = lobby.settings?.rounds;
          const timer = lobby.settings?.timer; // Add timer
          const color = modes[mode]?.color || '#cccccc'; // Default to gray if mode not found
          const playerCount = lobby.playerCount ?? lobby.clients?.length ?? 0; // Use playerCount or fallback to clients array length

          // Prepare the trigger element (div wrapping the Tag) - following Behistun.js example
          const triggerElement = (
            <div style={{ display: 'inline-block' }}> {/* Wrapper div */}
              <Tag
                style={{
                  backgroundColor: color,
                  color: 'black',
                  cursor: 'pointer', // Indicate interactivity
                  padding: '2px 6px', // Adjust padding slightly
                  fontSize: '0.8rem', // Slightly smaller font
                }}
              >
                <b className='mr-1'>{mode[0]}</b>
                {playerCount} {/* Show player count in the tag */}
              </Tag>
            </div>
          );

          return (
            <Dropdown
              key={lobby._id}
              onHover // Use onHover prop to trigger on mouse enter/leave
              button={triggerElement} // Pass the wrapper div as the 'button' prop
              dropdownStyle={{ width: 'auto', minWidth: '100px', width: 'max-content', right: 'auto', left: 0, padding: 0, border: 'none' }} // Adjust dropdown style
              top={-130} // Adjust vertical offset slightly if needed
              onClick={() => handleJoinClick(lobby._id)}
            >
              {/* Dropdown Content passed as children - Apply mode color and onClick */}
              <div
                className="p-2 text-black rounded shadow-lg border border-black/20 text-sm cursor-pointer" // Added cursor-pointer
                style={{ backgroundColor: color }} // Apply mode color to dropdown background
              >
                <div className="font-bold mb-1">{mode}</div> {/* Use mode variable */}
                <div>Players: {playerCount}</div>
                <div>Rounds: {rounds}</div> {/* Use rounds variable */}
                <div>Timer: {timer}s</div> {/* Add timer display */}
                {/* Add italic, low-opacity text */}
                <div className="mt-1 text-xs italic opacity-70">
                  click to join
                </div>
              </div>
            </Dropdown>
          );
        })}
        {/* Display '+ N more' if there are more than 5 lobbies */}
        {availableLobbies.length > 5 && (
          <span className="ml-1" style={{ color: 'var(--textColorLowOpacity)' }}>
            + {availableLobbies.length - 5} more
          </span>
        )}
      </div>
    </div>
    </>
  );
};
