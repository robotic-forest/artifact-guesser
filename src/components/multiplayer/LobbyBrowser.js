import React from 'react';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import { useMultiplayer } from '@/components/multiplayer/context/MultiplayerContext';
import useUser from '@/hooks/useUser';
import { Tag } from '@/components/tag/Tag';
import { Dropdown } from '@/components/dropdown/Dropdown';
import { modes } from '@/components/gameui/ModeButton';
import AAAAAA from '@/components/art/AAAAAA';
import { generateInsult } from '@/hooks/useInsult';

export const LobbyBrowser = () => {
  const { lobbies, joinLobby } = useMultiplayer();
  const { user } = useUser();
  const router = useRouter(); // Although joinLobby handles navigation, keep it for potential future use

  // Filter out lobbies that are currently in progress
  const availableLobbies = lobbies?.filter(lobby => !lobby.inProgress) || [];

  if (availableLobbies.length === 0) {
    return null; // Render nothing if no available lobbies
  }

  const handleJoinClick = (lobbyId) => {
    console.log('called')
    if (user?.isLoggedIn) {
      joinLobby(lobbyId);
      router.push(`/multiplayer/${lobbyId}`); // Navigate to the lobby page after joining
    } else {
      toast.custom(
        <AAAAAA
          initialAngry
          initialText={(
            <>
              Log in or sign up<br/>
              to join a lobby,<br/>
              you {generateInsult('name')}!
            </>
          )}
          initialWidth={280}
          angle={-5}
          textColor='#ffffff'
          style={{ padding: '0 12px 12px 0' }}
        />,
        { position: 'bottom-center' }
      );
    }
  };

  return (
    // Position this container appropriately relative to GlobalChat
    // Using similar styling to GlobalChat's inactive state for consistency
    <div className="p-1 px-2 text-xs"
      css={{ background: 'var(--backgroundColor)', color: 'var(--textColorLowOpacity)', border: '1px solid var(--borderColor)', marginTop: '2px', borderRadius: '6px', width: 'fit-content' }}>
      <span className=" mr-2" css={{ color: 'var(--textColor)' }}>Lobbies</span>
      <div className="inline-flex flex-wrap gap-1"> {/* Use flex-wrap for multiple lobbies */}
        {availableLobbies.map((lobby) => {
          // Access data based on provided structure
          const mode = lobby.settings?.mode;
          const rounds = lobby.settings?.rounds;
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
                {playerCount} {/* Show player count in the tag */}
              </Tag>
            </div>
          );

          return (
            <Dropdown
              key={lobby._id}
              onHover // Use onHover prop to trigger on mouse enter/leave
              button={triggerElement} // Pass the wrapper div as the 'button' prop
              dropdownStyle={{ width: 'auto', minWidth: '100px', right: 'auto', left: 0, padding: 0, border: 'none' }} // Adjust dropdown style
              top={-120} // Adjust vertical offset slightly if needed
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
                {/* Add italic, low-opacity text */}
                <div className="mt-1 text-xs italic opacity-70">
                  click to join
                </div>
              </div>
            </Dropdown>
          );
        })}
      </div>
    </div>
  );
};
