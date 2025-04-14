import { dashbaordTheme } from "@/pages/dashboard";
import { themeCSS } from "../GlobalStyles";
import { Title } from "./Title";
import { gamesTheme } from "@/pages/games";
import { PulseLoader } from "react-spinners";
import { Tag } from "../tag/Tag";
import { modes } from "../gameui/ModeButton";
import { MasonryLayout } from "../layout/MasonryLayout";
import { useMultiplayer } from "./context/MultiplayerContext"; // Import the context hook
import { Button } from "../buttons/Button";

// Reusable button component for selecting lobby type
const LobbyTypeButton = ({ className, theme, disabled, ...p }) => {
  return (
    <div css={theme ? themeCSS(theme) : {}}>
      <button
        className={`p-3 block text-left w-[360px] max-w-[calc(100vw_-_70px)] mb-2 mr-2 ${className}`}
        css={{
          background: 'var(--backgroundColorBarelyLight)',
          border: '1px outset',
          opacity: disabled ? 0.6 : 1,
          cursor: disabled ? 'not-allowed' : 'pointer',
          borderColor: '#ffffff77 #00000077 #00000077 #ffffff77',
          '&:hover': {
            background: disabled ? 'var(--backgroundColorBarelyLight)' : 'var(--backgroundColorLight)', // Prevent hover effect if disabled
            color: 'var(--textColor)',
          }
        }}
        {...p}
        disabled={disabled}
      />
    </div>
  );
};

export const LobbyChoice = () => {
  // Use the useMultiplayer context hook
  const { lobbies, createLobby, joinLobby, isConnected, isRegistered } = useMultiplayer();

  // Default settings for creating a lobby from this view
  // TODO: Allow user to configure these before creating?
  const defaultSettings = { mode: 'Balanced', rounds: 5 };

  // Handle creating a lobby
  const handleCreateLobby = (isPublic = false) => {
    // Check connection and registration status
    if (createLobby && isConnected && isRegistered) {
      // Pass settings in the structure expected by the backend
      createLobby({ settings: defaultSettings /*, public: isPublic */ });
      // Note: useLobby doesn't automatically join the created lobby.
      // Need logic elsewhere (e.g., watching currentLobbyId) to navigate/update UI.
    } else {
      console.error("Cannot create lobby: Not connected, not registered, or createLobby function missing.");
    }
  };

  // Handle joining a lobby
  const handleJoinLobby = (lobbyId) => {
     // Check connection and registration status
    if (joinLobby && isConnected && isRegistered) {
      joinLobby(lobbyId);
      // Need logic elsewhere to navigate/update UI upon successful join.
    } else {
       console.error("Cannot join lobby: Not connected, not registered, or joinLobby function missing.");
    }
  };

  // TODO: Add effect or logic to redirect/change view if currentLobbyId becomes set

  return (
    <div className='flex flex-col items-center min-h-screen justify-center font-mono w-full' css={{
      '& *': { transition: 'all 0.2s ease-in-out, width 0s, max-width 0s' }
    }}>
      <div className='p-6 w-screen flex flex-col max-w-[1200px]'>
        <Title />
        {/* Create Lobby Section */}
        <div className='mt-4 w-[fit-content]'>
          <div css={{ color: 'var(--textLowOpacity)' }}>
            Create a new Lobby
          </div>
          <div className='mt-2 p-0 pb-2 pr-2 flex flex-wrap'>
             {/* Disable button if not connected OR not registered */}
            <LobbyTypeButton theme={dashbaordTheme} onClick={() => handleCreateLobby(false)} disabled={!isConnected || !isRegistered}>
              <div><b>Create Private Lobby</b></div>
              <div className="text-xs opacity-80">
                Only players with a link can join (Not Implemented)
              </div>
            </LobbyTypeButton>
            {/* Disable button if not connected OR not registered */}
            <LobbyTypeButton theme={gamesTheme} onClick={() => handleCreateLobby(true)} disabled={!isConnected || !isRegistered}>
              <div><b>Create Public Lobby</b></div>
              <div className="text-xs opacity-80">
                Anyone can join
              </div>
            </LobbyTypeButton>
          </div>
        </div>

        {/* Join Lobby Section */}
        <div className='mt-4 w-full'>
          <div css={{ color: 'var(--textLowOpacity)' }}>
            Join an existing Lobby
          </div>
          <div className='mt-2 p-2 pb-0' css={{
            background: `var(--backgroundColorBarelyDark)`,
            borderRadius: 3
            // minHeight: '100px' // Removed min-height
          }}>
            {!isConnected && <div className='text-center pt-2 pb-4' css={{ color: 'var(--textLowOpacity)' }}>Connecting...</div>}
            {/* Show registering message if connected but not yet registered */}
            {isConnected && !isRegistered && <div className='text-center pt-2 pb-4' css={{ color: 'var(--textLowOpacity)' }}>Registering client...</div>}
            {/* Show loading lobbies only if connected AND registered */}
            {isConnected && isRegistered && !lobbies && (
              <div className='flex justify-center items-center pt-2 pb-4' css={{ color: 'var(--textLowOpacity)' }}>
                <PulseLoader color='var(--textLowOpacity)' size={5} className='mr-4' />
                Loading Lobbies...
              </div>
            )}
            {isConnected && isRegistered && lobbies?.length === 0 && (
              <div className='text-center pt-2 pb-4' css={{ color: 'var(--textLowOpacity)' }}>
                No Lobbies available. Create one!
              </div>
            )}
            {/* Render Lobby List only if connected AND registered */}
            {isConnected && isRegistered && lobbies && lobbies.length > 0 && (
              <MasonryLayout gutter={6}>
                {lobbies.map(lobby => {
                  // Extract data safely
                  const hostUsername = lobby?.host?.username || 'Unknown Host';
                  const mode = lobby?.settings?.mode || 'Unknown';
                  const rounds = lobby?.settings?.rounds || '?';
                  const playerCount = lobby?.playerCount || lobby?.clients?.length || 0; // Use playerCount if provided by backend
                  const modeColor = modes[mode]?.color || '#cccccc'; // Fallback color

                  return (
                    <div key={lobby._id} className='p-2 px-4 mb-2 rounded-[6px] flex justify-between items-center' css={{
                      background: 'var(--backgroundColorBarelyLight)',
                      boxShadow: 'rgb(0 0 0 / 0%) 0px 0px 0px 0px, rgb(0 0 0 / 0%) 0px 0px 0px 0px, rgb(0 0 0 / 12%) 0px 0px 0px 0px, rgb(0 0 0 / 0%) 0px 0px 0px 0px, rgb(64 68 82 / 8%) 0px 2px 5px 0px',
                    }}>
                      <div> {/* Content div */}
                        <div className='font-bold mb-1'>{hostUsername}'s Lobby</div>
                        <div className='text-xs flex items-center flex-wrap gap-x-3 gap-y-1 mb-2'>
                           <span>Players: <b>{playerCount}</b></span>
                           <span>Rounds: <b>{rounds}</b></span>
                           <div className='flex items-center'>
                             <span className='mr-1'>Mode:</span>
                             <Tag className='' bold color={modeColor} css={{padding: '1px 4px'}}>
                               {mode}
                             </Tag>
                           </div>
                        </div>
                      </div>
                      {/* Wrapper div for right alignment */}
                      <div css={{ display: 'flex', justifyContent: 'flex-end' }}>
                         <Button
                           onClick={() => handleJoinLobby(lobby._id)}
                           size='sm'
                           // Adjust padding for smaller size, remove width: 100%
                           css={{ padding: '4px 12px' }}
                           disabled={!isConnected || !isRegistered}
                         >
                           Join Lobby
                         </Button>
                      </div>
                    </div>
                  );
                })}
              </MasonryLayout>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
