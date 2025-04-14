import { IconGenerator } from "../art/IconGenerator";
import { Button } from "../buttons/Button";
import { BiExit } from "react-icons/bi";

// Helper to capitalize strings
const capitalize = s => (s && typeof s === 'string' ? s[0].toUpperCase() + s.slice(1) : '');

// Component to display a single lobby in the list
const LobbyListItem = ({ lobby, onJoin }) => {
  // Extract relevant info, handle potential missing data
  const lobbyId = lobby?._id;
  const hostUsername = lobby?.host?.username || 'Unknown Host';
  const mode = lobby?.settings?.mode || 'Unknown Mode';
  const rounds = lobby?.settings?.rounds || '?';
  const playerCount = lobby?.playerCount || lobby?.clients?.length || 0; // Use playerCount if available

  if (!lobbyId) return null; // Don't render if lobby ID is missing

  return (
    <div className='p-2 mb-2 flex items-center justify-between' css={{
      background: 'var(--backgroundColorSlightlyLight)',
      borderRadius: 4,
      border: '1px solid var(--backgroundColorSlightlyDark)',
    }}>
      <div>
        <div className='font-bold'>{hostUsername}'s Lobby</div>
        <div className='text-xs mt-1' css={{ color: 'var(--textLowOpacity)' }}>
          Mode: {mode} | Rounds: {rounds} | Players: {playerCount}
        </div>
      </div>
      {/* Explicitly center the button vertically */}
      <Button onClick={() => onJoin(lobbyId)} size='sm' css={{ padding: '4px 10px', alignSelf: 'center' }}>
        Join
      </Button>
    </div>
  );
};

// Main Lobby component
export const Lobby = ({ clients, lobbies, currentLobbyId, joinLobby, leaveLobby }) => {

  if (currentLobbyId) {
    // --- Currently in a Lobby View ---
    // Find the current lobby details from the list (if available) or use placeholder
    const currentLobbyDetails = lobbies?.find(l => l._id === currentLobbyId);
    const lobbyName = currentLobbyDetails?.host?.username ? `${currentLobbyDetails.host.username}'s Lobby` : `Lobby ${currentLobbyId.slice(0, 6)}...`;

    return (
      <div className='mt-4 w-full'>
        {/* Removed the div containing the Leave button */}
        {/* <div className='flex justify-between items-center mb-1'>
          <div>{lobbyName}</div>
           <Button onClick={leaveLobby} variant='danger_subtle' size='sm' css={{ padding: '2px 6px' }}>
            <BiExit className='mr-1'/> Leave
          </Button>
        </div> */}
        {/* Display Lobby Name (moved here or could be in Title) */}
        <div className='mb-1'>{lobbyName}</div>
        <div className='p-1 pb-0 pr-0 text-sm flex flex-wrap' css={{
          background: `var(--backgroundColorBarelyDark)`,
          borderRadius: 3,
          minHeight: '40px', // Ensure some height even when empty
        }}>
          {clients?.map(c => (
            <div key={c.socketId || c.userId} className='p-[3px_8px] flex items-center justify-between mr-1 mb-1 rounded-[4px] overflow-hidden min-w-[fit-content]' css={{
              border: '1px solid var(--backgroundColorSlightlyDark)',
              background: 'var(--backgroundColorSlightlyLight)',
              boxShadow: 'rgb(0 0 0 / 0%) 0px 0px 0px 0px, rgb(0 0 0 / 0%) 0px 0px 0px 0px, rgb(0 0 0 / 12%) 0px 0px 0px 0px, rgb(0 0 0 / 0%) 0px 0px 0px 0px, rgb(64 68 82 / 8%) 0px 2px 5px 0px',
            }}>
              <IconGenerator className='mr-2' /> {/* Consider passing a seed based on userId? */}
              <b>{c.username}</b>
              {/* TODO: Indicate host? */}
            </div>
          ))}
          {(!clients || clients.length === 0) && (
             <div className='p-2 text-xs' css={{ color: 'var(--textLowOpacity)' }}>Waiting for players...</div>
          )}
        </div>
      </div>
    );
  } else {
    // --- Lobby List View ---
    return (
      <div className='mt-4 w-full'>
        <div className='mb-2'>Available Lobbies</div>
        <div className='max-h-[300px] overflow-y-auto p-1' css={{ background: 'var(--backgroundColorBarelyDark)', borderRadius: 3 }}>
          {lobbies && lobbies.length > 0 ? (
            lobbies.map(lobby => (
              <LobbyListItem key={lobby._id} lobby={lobby} onJoin={joinLobby} />
            ))
          ) : (
            <div className='p-4 text-center text-sm' css={{ color: 'var(--textLowOpacity)' }}>
              No active lobbies found. Why not create one?
            </div>
          )}
        </div>
      </div>
    );
  }
};
