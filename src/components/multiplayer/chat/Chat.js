import { ChatInput } from "./ChatInput";
import { ChatDisplay } from "./ChatDisplay";

// Receives lobbyId, socket instance, and messages from parent/hook
export const Chat = ({ lobbyId, _socket, chatMessages }) => {

  // Only render chat if in a lobby
  if (!lobbyId) {
    return (
      <div className='my-4 w-full p-4 text-center text-sm' css={{ color: 'var(--textLowOpacity)', background: 'var(--backgroundColorBarelyDark)', borderRadius: 3 }}>
        Join or create a lobby to chat.
      </div>
    );
  }

  return (
    <div className='my-4 w-full'>
      <div className='flex justify-between mb-1'>
        <div>Chat</div>
      </div>
      {/* Pass messages down to display */}
      <ChatDisplay chat={chatMessages} />
      {/* Pass socket and lobbyId down to input */}
      <ChatInput socket={_socket} lobbyId={lobbyId} />
    </div>
  );
};
