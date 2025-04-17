import { useState, useCallback, useEffect } from "react";
import { GiGreekSphinx, GiWaxTablet } from "react-icons/gi";
import { Button } from "../buttons/Button";
import { BiRefresh, BiPlay } from "react-icons/bi";
import { IoMdAddCircleOutline } from "react-icons/io";
import { IconButton } from "../buttons/IconButton";
import { ModeButton, modes as gameModesObject } from "../gameui/ModeButton";
import useUser from "@/hooks/useUser";
import { useMultiplayer } from "./context/MultiplayerContext";
import toast from "react-hot-toast"; // Import toast

const modeKeys = Object.keys(gameModesObject);
const timerOptions = [5, 15, 30, null]; // null represents 'No Timer'

const RoundButton = ({ css, isActive, disabled, children, ...p }) => (
  <Button
    variant='outlined'
    css={{
      background: isActive ? 'var(--primaryColor)' : 'var(--backgroundColorBarelyLight)',
      cursor: disabled ? 'not-allowed' : 'pointer',
      '&:hover': {
        background: disabled
          ? isActive ? 'var(--primaryColor)' : 'var(--backgroundColorBarelyLight)'
          : isActive ? 'var(--primaryColorLight)' : 'var(--backgroundColorLight)',
        boxShadow: 'none',
      },
      border: '1px outset',
      borderColor: '#ffffff77 #00000077 #00000077 #ffffff77',
      boxShadow: 'none',
      borderRadius: 0,
      marginRight: 4,
      padding: '4px 8px',
      minWidth: '40px',
      textAlign: 'center',
      ...css
    }}
    {...p}
    disabled={disabled}
  >
    {children}
  </Button>
);

export const Options = ({ onCreateLobby, currentLobbyId, _socket }) => {
  const { user } = useUser();
  const { lobbies, lobbyClients } = useMultiplayer(); // Use context

  const currentLobbyData = lobbies?.find(l => l._id === currentLobbyId);
  const isHost = currentLobbyId && currentLobbyData?.host?.userId === user?._id;

  // Local state for selections
  const [selectedMode, setSelectedMode] = useState(modeKeys[0]);
  const [selectedRounds, setSelectedRounds] = useState(5);
  const [selectedTimer, setSelectedTimer] = useState(15); // Default timer: 15s
  const [isPublic, setIsPublic] = useState(true); // Default to Public
  const [isSelectingMode, setIsSelectingMode] = useState(false);

  // Effect to sync local state with lobby data from context
  useEffect(() => {
    console.log(`[Options useEffect] Running. currentLobbyId: ${currentLobbyId}`);
    if (currentLobbyData?.settings) {
      const newMode = currentLobbyData.settings.mode || modeKeys[0];
      const newRounds = currentLobbyData.settings.rounds || 5;
      const newTimer = currentLobbyData.settings.timer !== undefined ? currentLobbyData.settings.timer : 15; // Sync timer, default 15s
      // Default isPublic to true if not specified in settings
      const newIsPublic = currentLobbyData.settings.isPublic === undefined ? true : currentLobbyData.settings.isPublic;
      console.log(`[Options useEffect] Syncing state from lobby data: Mode=${newMode}, Rounds=${newRounds}, Timer=${newTimer}, IsPublic=${newIsPublic}`);
      setSelectedMode(newMode);
      setSelectedRounds(newRounds);
      setSelectedTimer(newTimer);
      setIsPublic(newIsPublic);
      setIsSelectingMode(false); // Ensure selection view is closed on update
    } else if (!currentLobbyId) {
      // Reset to defaults only if NOT in a lobby anymore
      console.log("[Options useEffect] Not in lobby, resetting defaults.");
      setSelectedMode(modeKeys[0]);
      setSelectedRounds(5);
      setSelectedTimer(15); // Reset timer to default
      setIsPublic(true); // Reset to default when not in lobby
      setIsSelectingMode(false);
    }
    // Add isHost as dependency? No, derived from context data which is already a dependency via currentLobbyData
  }, [currentLobbyData, currentLobbyId]); // Rerun when lobby data or ID changes

  // Update check to require at least 2 players
  const enoughPlayersPresent = (lobbyClients?.length || 0) >= 2;
  const waitingMessage = isHost ? (enoughPlayersPresent ? 'Ready to start.' : 'Waiting for more players (min 2)...') : 'Waiting for host to start...';


  const handleCreateLobby = () => {
    if (onCreateLobby) {
      onCreateLobby({ settings: { mode: selectedMode, rounds: selectedRounds, timer: selectedTimer, isPublic: isPublic } });
    }
  };

  // Emit setting changes if host
  const emitSettingChange = (settingUpdate) => {
    if (isHost && _socket && currentLobbyId) {
      // Construct the full settings object based on current state + update
      const currentSettings = {
        mode: selectedMode,
        rounds: selectedRounds,
        timer: selectedTimer, // Include timer in settings
        isPublic: isPublic,
        ...settingUpdate // Apply the specific change
      };
      console.log(`Host emitting update-settings:`, currentSettings);
      _socket.emit('update-settings', {
        lobbyId: currentLobbyId,
        settings: currentSettings
      });
    }
  };

  const handleModeSelect = (modeKey) => {
    setSelectedMode(modeKey);
    setIsSelectingMode(false);
    emitSettingChange({ mode: modeKey }); // Only send the changed setting
  };

  const handleRoundsSelect = (rounds) => {
    setSelectedRounds(rounds);
    emitSettingChange({ rounds: rounds }); // Only send the changed setting
  };

  const handleLobbyTypeSelect = (type) => {
    const newIsPublic = type === 'public';
    setIsPublic(newIsPublic);
    emitSettingChange({ isPublic: newIsPublic }); // Only send the changed setting
  };

  const handleTimerSelect = (timerValue) => {
    setSelectedTimer(timerValue);
    emitSettingChange({ timer: timerValue }); // Send timer change
  };

  const handleStartGame = () => {
    // Add client-side check before emitting (belt-and-suspenders)
    if (!enoughPlayersPresent) {
       toast.error("Need at least 2 players to start."); // Use toast for feedback
       return;
    }
    if (_socket && currentLobbyId && isHost) {
      // Use the state that reflects the latest selection/sync
      const currentSettings = { mode: selectedMode, rounds: selectedRounds, timer: selectedTimer, isPublic: isPublic }; // Include timer and isPublic
      console.log(`Emitting start-game for lobby ${currentLobbyId} with settings:`, currentSettings);
      _socket.emit('start-game', {
        lobbyId: currentLobbyId,
        settings: currentSettings
      });
    } else {
       console.error("Cannot start game: Socket not available, not in lobby, or not host.");
    }
  };

  const roundsOptions = [1, 5, 10, 15]; // Added 1 round option

  return (
    <div css={{
      background: 'var(--backgroundColorBarelyLight)',
      border: '1px outset',
      borderColor: '#ffffff77 #00000077 #00000077 #ffffff77',
    }}>
      <div className='p-3 pb-2 flex items-center justify-between'>
        <div className='flex items-center'>
          <GiWaxTablet className='mr-2 scale-x-[-1]' />
          Game Options
        </div>
      </div>

      <div className='mt-3 p-3'>
        {/* Visibility Selection */}
         <div className="mb-4">
           <div className='text-sm mb-2'>Visibility</div>
           <div className='p-2 text-sm flex' css={{ background: 'var(--backgroundColorSlightlyLight)', borderRadius: 6 }}>
             {currentLobbyId && !isHost ? (
               // Non-host view: Show the current setting, disabled
               <RoundButton isActive={true} disabled={true}>
                 {isPublic ? 'Public' : 'Private'}
               </RoundButton>
             ) : (
               // Host view or lobby creation view: Allow selection
               <>
                  <RoundButton
                    key="private"
                    onClick={() => handleLobbyTypeSelect('private')}
                    isActive={!isPublic}
                    disabled={false} // Host/Creator can always change
                    css={{
                    background: isPublic ? "var(--backgroundColorBarelyLight)" : '#78c9ab',
                    '&:hover': {
                      background: isPublic ? "var(--backgroundColorLight)" : '#78c9ab',
                    }
                    }}
                  >
                    Private
                  </RoundButton>
                 <RoundButton
                   key="public"
                   onClick={() => handleLobbyTypeSelect('public')}
                   isActive={isPublic}
                   disabled={false} // Host/Creator can always change
                   css={{
                    background: !isPublic ? "var(--backgroundColorBarelyLight)" :  '#abb4f5',
                    '&:hover': {
                      background: !isPublic ? "var(--backgroundColorLight)" : '#abb4f5',
                    }
                   }}
                 >
                   Public
                 </RoundButton>
               </>
             )}
           </div>
         </div>

        {/* Mode Selection */}
        <div className="mb-4">
          <div className='text-sm mb-2'>{currentLobbyId && isHost && isSelectingMode ? 'Select New Mode' : 'Mode'}</div>
          <div className='p-2 text-sm' css={{ background: 'var(--backgroundColorSlightlyLight)', borderRadius: 6, minHeight: '40px' }}>
            {currentLobbyId && isHost && isSelectingMode ? (
              <div className="flex flex-wrap gap-2">
                {modeKeys.map(modeKey => (
                  <ModeButton
                    key={modeKey}
                    mode={modeKey}
                    onClick={() => handleModeSelect(modeKey)}
                    css={{ padding: '4px 8px' }}
                  />
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-between">
                 <ModeButton mode={selectedMode} css={{ padding: '6px 10px', cursor: 'default', '&:hover': { filter: 'brightness(1)' } }}/>
                 {isHost && currentLobbyId && ( // Show edit button only to host when in lobby
                   <IconButton
                     size={28}
                     tooltip={'Change Mode'}
                     tooltipPlace='left'
                     onClick={() => setIsSelectingMode(true)}
                     css={{ marginRight: 14, marginLeft: 8, background: 'var(--backgroundColorLight)', '&:hover': { background: 'var(--backgroundColorLight)', filter: 'brightness(1.1)' } }}
                   >
                     <BiRefresh />
                   </IconButton>
                 )}
              </div>
            )}
          </div>
        </div>

        {/* Rounds Selection */}
        <div className='mt-4'>
          <div className='text-sm mb-2'>Rounds</div>
          <div className='p-2 text-sm flex' css={{ background: 'var(--backgroundColorSlightlyLight)', borderRadius: 6 }}>
            {currentLobbyId && !isHost ? (
               <RoundButton isActive={true} disabled={true}>
                 {selectedRounds} {/* Display the selected rounds */}
               </RoundButton>
            ) : (
              roundsOptions.map(rounds => (
                <RoundButton
                  key={rounds}
                  onClick={() => handleRoundsSelect(rounds)}
                  isActive={selectedRounds === rounds}
                  disabled={false} // Host/Creator can always change
                >
                  {rounds}
                </RoundButton>
              ))
            )}
          </div>
        </div>

        {/* Timer Selection */}
        <div className='mt-4'>
          <div className='text-sm mb-2'>Timer (seconds)</div>
          <div className='p-2 text-sm flex' css={{ background: 'var(--backgroundColorSlightlyLight)', borderRadius: 6 }}>
            {currentLobbyId && !isHost ? (
               <RoundButton isActive={true} disabled={true}>
                 {selectedTimer === null ? 'None' : `${selectedTimer}s`} {/* Display the selected timer */}
               </RoundButton>
            ) : (
              timerOptions.map(timerValue => (
                <RoundButton
                  key={timerValue === null ? 'none' : timerValue}
                  onClick={() => handleTimerSelect(timerValue)}
                  isActive={selectedTimer === timerValue}
                  disabled={false} // Host/Creator can always change
                >
                  {timerValue === null ? 'None' : `${timerValue}s`}
                </RoundButton>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className='mt-6 p-3 flex justify-between items-end'>
        {currentLobbyId ? (
          <>
            {/* Updated waiting message */}
            <div className='text-sm' css={{ color: 'var(--textLowOpacity)' }}>
              {waitingMessage}
            </div>
            {isHost && (
              <Button
                variant='outlined'
                onClick={handleStartGame}
                // Disable button if not enough players
                disabled={!enoughPlayersPresent || isSelectingMode}
                css={{
                  background: (enoughPlayersPresent && !isSelectingMode) ? 'var(--primaryColor)' : 'var(--backgroundColor)',
                  cursor: (enoughPlayersPresent && !isSelectingMode) ? 'pointer' : 'not-allowed',
                  opacity: (enoughPlayersPresent && !isSelectingMode) ? 1 : 0.6,
                  '&:hover': { background: (enoughPlayersPresent && !isSelectingMode) ? 'var(--primaryColorLight)' : 'var(--backgroundColor)', boxShadow: 'none' },
                  border: (enoughPlayersPresent && !isSelectingMode) ? '1px outset' : 'none',
                  borderColor: '#ffffff77 #00000077 #00000077 #ffffff77',
                  boxShadow: 'none', borderRadius: 0
                }}
              >
                <BiPlay className='mr-3 text-sm' />
                Start Game
              </Button>
            )}
          </>
        ) : (
          <>
            <div className='text-sm' css={{ color: 'var(--textLowOpacity)' }}>
              Configure and create a lobby.
            </div>
            <Button
              variant='outlined'
              onClick={handleCreateLobby}
              css={{
                background: 'var(--primaryColor)',
                '&:hover': { background: 'var(--primaryColorLight)', boxShadow: 'none' },
                border: '1px outset', borderColor: '#ffffff77 #00000077 #00000077 #ffffff77',
                boxShadow: 'none', borderRadius: 0
              }}
            >
              <IoMdAddCircleOutline className='mr-3 text-sm' />
              Create Lobby
            </Button>
          </>
        )}
      </div>
    </div>
  );
};
