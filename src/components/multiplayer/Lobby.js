import { IconGenerator } from "../art/IconGenerator";
import { GlobalChat } from "../chat/GlobalChat";

// Main Lobby component
export const Lobby = ({ clients, lobbies, currentLobbyId, joinLobby, leaveLobby }) => {
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
      {/* Add Global Chat below the player list */}
      <div className="mt-4"> {/* Add some margin */}
        <GlobalChat />
      </div>
    </div>
  )
};
