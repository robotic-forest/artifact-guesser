import { useState, useCallback, useEffect } from "react";
import { GiGreekSphinx, GiWaxTablet } from "react-icons/gi";
import { Button } from "../buttons/Button";
import { BiRefresh, BiPlay } from "react-icons/bi";
import { IoMdAddCircleOutline } from "react-icons/io";
import { IconButton } from "../buttons/IconButton";
import { ModeButton, modes as gameModesObject } from "../gameui/ModeButton";
import useUser from "@/hooks/useUser";
import { useMultiplayer } from "./context/MultiplayerContext";

const modeKeys = Object.keys(gameModesObject);

const RoundButton = ({ css, isActive, disabled, children, ...p }) => (
  <Button
    variant='outlined'
    css={{
      background: isActive ? 'var(--primaryColor)' : 'var(--backgroundColorBarelyLight)',
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.5 : 1,
      '&:hover': {
        background: disabled ? (isActive ? 'var(--primaryColor)' : 'var(--backgroundColorBarelyLight)') : 'var(--backgroundColorLight)',
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
  const [isSelectingMode, setIsSelectingMode] = useState(false);

  // Effect to sync local state with lobby data from context
  useEffect(() => {
    console.log(`[Options useEffect] Running. currentLobbyId: ${currentLobbyId}`);
    if (currentLobbyData?.settings) {
      const newMode = currentLobbyData.settings.mode || modeKeys[0];
      const newRounds = currentLobbyData.settings.rounds || 5;
      console.log(`[Options useEffect] Syncing state from lobby data: Mode=${newMode}, Rounds=${newRounds}`);
      setSelectedMode(newMode);
      setSelectedRounds(newRounds);
      setIsSelectingMode(false); // Ensure selection view is closed on update
    } else if (!currentLobbyId) {
      // Reset to defaults only if NOT in a lobby anymore
      console.log("[Options useEffect] Not in lobby, resetting defaults.");
      setSelectedMode(modeKeys[0]);
      setSelectedRounds(5);
      setIsSelectingMode(false);
    }
    // Add isHost as dependency? No, derived from context data which is already a dependency via currentLobbyData
  }, [currentLobbyData, currentLobbyId]); // Rerun when lobby data or ID changes

  const enoughPlayersPresent = (lobbyClients?.length || 0) >= 1;

  const handleCreateLobby = () => {
    if (onCreateLobby) {
      onCreateLobby({ settings: { mode: selectedMode, rounds: selectedRounds } });
    }
  };

  // Emit setting changes if host
  const emitSettingChange = (newSettings) => {
    if (isHost && _socket && currentLobbyId) {
      console.log(`Host emitting update-settings:`, newSettings);
      _socket.emit('update-settings', {
        lobbyId: currentLobbyId,
        settings: newSettings
      });
    }
  };

  const handleModeSelect = (modeKey) => {
    setSelectedMode(modeKey);
    setIsSelectingMode(false);
    emitSettingChange({ mode: modeKey, rounds: selectedRounds });
  };

  const handleRoundsSelect = (rounds) => {
    setSelectedRounds(rounds);
    emitSettingChange({ mode: selectedMode, rounds: rounds });
  };

  const handleStartGame = () => {
    if (_socket && currentLobbyId && isHost) {
      // Use the state that reflects the latest selection/sync
      const currentSettings = { mode: selectedMode, rounds: selectedRounds };
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
                     css={{ marginRight: 14, background: 'var(--backgroundColorLight)', '&:hover': { background: 'var(--backgroundColorLight)', filter: 'brightness(1.1)' } }}
                   >
                     <BiRefresh />
                   </IconButton>
                 )}
                 {!currentLobbyId && ( // Show cycle button only when not in lobby
                     <IconButton
                       size={28}
                       tooltip={'Cycle Mode'}
                       tooltipPlace='left'
                       onClick={cycleMode}
                       css={{ marginRight: 14, background: 'var(--backgroundColorLight)', '&:hover': { background: 'var(--backgroundColorLight)', filter: 'brightness(1.1)' } }}
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
      </div>

      {/* Action Buttons */}
      <div className='mt-6 p-3 flex justify-between items-end'>
        {currentLobbyId ? (
          <>
            <div className='text-sm' css={{ color: 'var(--textLowOpacity)' }}>
              {isHost ? (enoughPlayersPresent ? 'Ready to start.' : 'Waiting for players...') : 'Waiting for host to start...'}
            </div>
            {isHost && (
              <Button
                variant='outlined'
                onClick={handleStartGame}
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
