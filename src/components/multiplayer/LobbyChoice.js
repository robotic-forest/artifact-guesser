import dynamic from 'next/dynamic'; // Import dynamic
import { dashboardTheme } from "@/pages/dashboard";
import { themeCSS } from "../GlobalStyles";
import { Title } from "./Title";
import { gamesTheme } from "@/pages/games";
import { PulseLoader } from "react-spinners";
import { Tag } from "../tag/Tag";
import { modes } from "../gameui/ModeButton";
import useUser from "@/hooks/useUser"; // Import useUser
import useAAAAtoast from '@/hooks/useAAAAtoast'; // Import the hook
import { generateInsult } from '@/hooks/useInsult'; // Import generateInsult
import { MasonryLayout } from "../layout/MasonryLayout";
import { useMultiplayer } from "./context/MultiplayerContext"; // Import the context hook
import { GlobalChat } from "../chat/GlobalChat"; // Import Global Chat component
import { Button } from "../buttons/Button";
import { AuthHeader } from "../layout/AuthHeader";

// Dynamically import AAAAAAConfetti
const AAAAAAConfettiDynamic = dynamic(() => import('@/components/art/AAAAAAConfetti'), {
  ssr: false,
});

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
  const { triggerAAAAtoast, showConfetti } = useAAAAtoast(); // Initialize the hook
  const { lobbies: l, createLobby, joinLobby, isConnected, isRegistered } = useMultiplayer()
  const { user } = useUser(); // Get user state

  const lobbies = l.filter(lobby => lobby.settings?.isPublic !== false)

  // Default settings for creating a lobby from this view
  const defaultSettings = { mode: 'Balanced', rounds: 5, timer: 30 }; // Set default timer to 30s

  // Handle creating a lobby
  const handleCreateLobby = (isPublic = true) => { // Default to public if not specified, though buttons explicitly pass it
    if (createLobby && isConnected && isRegistered) {
      // Combine default settings with the desired visibility
      const settingsToCreate = {
        ...defaultSettings,
        isPublic: isPublic
      };
      console.log("Creating lobby with settings:", settingsToCreate);
      createLobby({ settings: settingsToCreate });
    } else {
      console.error("Cannot create lobby: Not connected, not registered, or createLobby function missing.");
    }
  };

  // Handle joining a lobby
  const handleJoinLobby = (lobbyId) => {
    if (joinLobby && isConnected && isRegistered) {
      joinLobby(lobbyId);
    } else {
       console.error("Cannot join lobby: Not connected, not registered, or joinLobby function missing.");
    }
  };

  return (
    <div className='flex flex-col items-center min-h-screen justify-center font-mono w-full pb-[180px]' css={{
      '& *': { transition: 'all 0.2s ease-in-out, width 0s, max-width 0s' }
    }}>
      {/* Conditionally render confetti */}
      {showConfetti && <AAAAAAConfettiDynamic />}
      <div css={{ position: 'absolute', top: 16, right: 16, zIndex: 10 }}>
        <AuthHeader
          loginCss={{
            background: '#81b5e4',
            color: '#000000',
            '&:hover': {
              background: '#4d9dcf'
            }
          }}
          signupCss={{
            background: '#87cfb4',
            '&:hover': {
              background: '#4dba91',
            }
          }}
        />
      </div>
      <div className='p-6 w-screen flex flex-col max-w-[1200px]'>
        <Title noButtons />
        {/* Create Lobby Section */}
        <div className='mt-4 w-[fit-content]'>
          <div css={{ color: 'var(--textLowOpacity)' }}>
            Create a new Lobby
          </div>
           <div className='mt-2 p-0 pb-2 pr-2 flex flex-wrap'>
             <LobbyTypeButton theme={dashboardTheme} onClick={() => {
                 if (!user?.isLoggedIn) {
                   // Extract JSX for clarity
                   const toastText = (
                     <>
                       Sign up to create a lobby,<br/>
                       you {generateInsult('adjective')} {generateInsult('name')}!
                     </>
                   );
                   // Use the hook
                   triggerAAAAtoast(
                     { // Props for AAAAAA
                       initialAngry: true,
                       initialText: toastText,
                       initialWidth: 320,
                       angle: -3,
                       backgroundColor: 'transparent',
                       textColor: '#000000',
                       style: { padding: '0 12px 12px 0' }
                     },
                     { position: 'bottom-center' } // Toast options
                   );
                 } else if (isConnected && isRegistered) {
                   handleCreateLobby(false);
                 }}}>
               <div><b>Create Private Lobby</b></div>
               <div className="text-xs opacity-80">
                 Only players with a link can join
              </div>
             </LobbyTypeButton>
             <LobbyTypeButton
               theme={gamesTheme}
               onClick={() => {
                 if (!user?.isLoggedIn) {
                   // Extract JSX for clarity
                   const toastText = (
                     <>
                       Sign up to create a lobby,<br/>
                       you {generateInsult('adjective')} {generateInsult('name')}!
                     </>
                   );
                   // Use the hook
                   triggerAAAAtoast(
                     { // Props for AAAAAA
                       initialAngry: true,
                       initialText: toastText,
                       initialWidth: 320,
                       angle: -3,
                       backgroundColor: 'transparent',
                       textColor: '#000000',
                       style: { padding: '0 12px 12px 0' }
                     },
                     { position: 'bottom-center' } // Toast options
                   );
                 } else if (isConnected && isRegistered) {
                   handleCreateLobby(true);
                 }
               }}
               disabled={!isConnected || !isRegistered}
             >
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
          }}>
            {!isConnected && <div className='text-center pt-2 pb-4' css={{ color: 'var(--textLowOpacity)' }}>Connecting...</div>}
            {isConnected && !isRegistered && <div className='text-center pt-2 pb-4' css={{ color: 'var(--textLowOpacity)' }}>Registering client...</div>}
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
            {isConnected && isRegistered && lobbies && lobbies.length > 0 && (
              <MasonryLayout gutter={6}>
                {lobbies // Filter out private lobbies
                 .map(lobby => {
                  const hostUsername = lobby?.host?.username || 'Unknown Host';
                  const mode = lobby?.settings?.mode || 'Unknown';
                  const rounds = lobby?.settings?.rounds || '?';
                  const timer = lobby?.settings?.timer || '?'; // Extract timer setting
                  const playerCount = lobby?.playerCount || lobby?.clients?.length || 0;
                   const modeColor = modes[mode]?.color || '#cccccc';
                   const isInProgress = lobby?.inProgress || false;
                   const playerIds = lobby?.playerIds || [];
                   const isUserInLobby = user?.isLoggedIn && playerIds.includes(user._id);

                   return (
                    <div key={lobby._id} className='p-2 px-4 mb-2 rounded-[6px] flex justify-between items-center' css={{
                      background: 'var(--backgroundColorBarelyLight)',
                      boxShadow: 'rgb(0 0 0 / 0%) 0px 0px 0px 0px, rgb(0 0 0 / 0%) 0px 0px 0px 0px, rgb(0 0 0 / 12%) 0px 0px 0px 0px, rgb(0 0 0 / 0%) 0px 0px 0px 0px, rgb(64 68 82 / 8%) 0px 2px 5px 0px',
                    }}>
                      <div>
                        <div className='font-bold mb-1'>{hostUsername}'s Lobby</div>
                        <div className='text-xs flex items-center flex-wrap gap-x-3 gap-y-1 mb-2'>
                           <span>Players: <b>{playerCount}</b></span>
                           <span>Rounds: <b>{rounds}</b></span>
                           <span>Timer: <b>{timer}s</b></span> {/* Add timer display */}
                           <div className='flex items-center'>
                             <span className='mr-1'>Mode:</span>
                             <Tag className='' bold color={modeColor} css={{padding: '1px 4px'}}>
                               {mode}
                              </Tag>
                            </div>
                         </div>
                       </div>
                        <div css={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                           {isUserInLobby ? (
                             <span className="text-xs italic opacity-70 mr-2">Already in lobby</span>
                           ) : (
                             <Button
                               onClick={() => {
                                 if (isInProgress) return;
                                 if (!user?.isLoggedIn) {
                                   // Extract JSX for clarity
                                   const toastText = (
                                     <>
                                       Sign up to join a lobby,<br/>
                                       you {generateInsult('name')}!
                                     </>
                                   );
                                   // Use the hook
                                   triggerAAAAtoast(
                                     { // Props for AAAAAA
                                       initialAngry: true,
                                       initialText: toastText,
                                       initialWidth: 300,
                                       angle: 4,
                                       backgroundColor: 'transparent',
                                       textColor: '#000000',
                                       style: { padding: '0 12px 12px 0' }
                                     },
                                     { position: 'bottom-center' } // Toast options
                                   );
                                 } else if (isConnected && isRegistered) {
                                   handleJoinLobby(lobby._id);
                                 }
                               }}
                               size='sm'
                               css={{ padding: '4px 12px' }}
                               disabled={!isConnected || !isRegistered || isInProgress}
                               disable={!isConnected || !isRegistered || isInProgress} // Note: 'disable' prop might be a typo, should likely be 'disabled'
                             >
                               {isInProgress ? 'In Progress' : 'Join Lobby'}
                             </Button>
                           )}
                      </div>
                    </div>
                  );
                })}
              </MasonryLayout>
            )}
          </div>
        </div>
      </div>
      <GlobalChat
        className="fixed bottom-6 left-6 z-50 hidden md:block"
      />
    </div>
  );
};
