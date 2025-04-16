import { GiGreekSphinx } from "react-icons/gi";
import { Artifact3D } from "../art/Artifact3D";
import { GrReturn } from "react-icons/gr";
import { FiShare2 } from "react-icons/fi"; // Import Share icon
import { Dropdown } from "../dropdown/Dropdown";
import toast from 'react-hot-toast';
import { useMultiplayer } from "./context/MultiplayerContext";
import { useGlobalChat } from "@/contexts/GlobalChatContext"; // Import useGlobalChat
import { MolochButton } from "../buttons/MolochButton";

export const Title = () => {
  const { currentLobbyId, leaveLobby } = useMultiplayer();
  const { sendGlobalMessage, isInGlobalChat, joinGlobalChat } = useGlobalChat(); // Get chat functions

  const handleBroadcast = () => {
    // Ensure user is in global chat before sending
    if (!isInGlobalChat) {
      joinGlobalChat(); // Attempt to join if not already in
      // Optionally, wait a moment or check status before sending,
      // but sendGlobalMessage itself has checks.
      // A simple approach is to just try sending after joining.
      // Consider adding a small delay or feedback if joining takes time.
      console.log("Attempting to join global chat before broadcasting...");
      // We might need a better mechanism if join is async and takes time
    }
    const message = `Come join my Artifact Guesser lobby! ${window.location.href}`;
    sendGlobalMessage(message);
    toast.success('Lobby link broadcasted to global chat!');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Lobby link copied to clipboard!');
  };

  return (
    // Change flex direction to column
    <div className='flex flex-col w-full max-w-[85vw]'>
      {/* Wrap existing title elements */}
      <div className='flex items-center relative left-[-16px]'>
        <Artifact3D
          url='/3D/ram-amun.glb'
          canvasStyle={{ width: 120, height: 120 }}
          scale={1}
          cameraPosition={[5, 5, 5]}
          noZoom
        />
        <div className='ml-4'>
          <div className='flex items-center' css={{
            color: 'var(--textLowOpacity)',
          }}>
            <GiGreekSphinx className ='mr-2' />
            Artifact Guesser
          </div>
          <div className='mt-1 text-3xl font-bold'>
            Multiplayer
          </div>
        </div>
      </div>
      {/* Container for buttons, aligned to the right */}
      {currentLobbyId && (
        <div className="relative mt-2 flex justify-end space-x-2"> {/* Add relative positioning */}
          <MolochButton
            onClick={leaveLobby} // Call the leaveLobby function from context
            css={{
              background: 'var(--backgroundColorSlightlyLight)',
              '&:hover': {
                background: 'var(--backgroundColorLight)',
              },
            }}
          >
            <GrReturn className="mr-2" /> {/* Add Leave icon */}
            Leave
          </MolochButton>
          <Dropdown
            top={34}
            closeAfterClick={true}
            button={
              <MolochButton className="bg-blue-600 hover:bg-blue-700">
                 <FiShare2 className="mr-2" /> {/* Use Share icon */}
                Invite
              </MolochButton>
            }
            MenuIconButtons={[
              {
                contents: 'Broadcast in global chat',
                onClick: handleBroadcast,
                // disabled: !isInGlobalChat // Optionally disable if not in chat, though sendGlobalMessage handles it
              },
              {
                contents: 'Copy link',
                onClick: handleCopyLink,
              },
            ]}
          />
        </div>
      )}
    </div>
  )
}
