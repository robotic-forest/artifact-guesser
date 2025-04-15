import React, { useState, useEffect, useRef } from 'react'; // Import useRef
import { useMultiplayer } from '../context/MultiplayerContext';
// No longer importing ChatDisplay as we'll replicate its core logic
// import { ChatDisplay } from './ChatDisplay';
import { ChatInput } from './ChatInput';

// Define sand color (adjust as needed, maybe use a CSS variable if available)
const sandColor = '#f4e9d8'; // Example sand color

// Basic scrollbar styling (can be customized further)
const scrollbarCSS = {
  '&::-webkit-scrollbar': {
    width: '8px',
  },
  '&::-webkit-scrollbar-track': {
    background: 'rgba(0, 0, 0, 0.1)',
    borderRadius: '4px',
  },
  '&::-webkit-scrollbar-thumb': {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: '4px',
  },
  '&::-webkit-scrollbar-thumb:hover': {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  }
};

export const FixedChat = () => {
  const [isActive, setIsActive] = useState(false);
  const { chatMessages, _socket, currentLobbyId } = useMultiplayer();
  const chatDisplayRef = useRef(null); // Ref for auto-scrolling

  // Auto-scroll effect for the active chat display
  useEffect(() => {
    if (isActive && chatDisplayRef.current) {
      chatDisplayRef.current.scrollTop = chatDisplayRef.current.scrollHeight;
    }
  }, [chatMessages, isActive]); // Scroll when messages change or chat becomes active

  // Filter messages for inactive view (last 3 user messages)
  const inactiveMessages = chatMessages.filter(msg => msg.username).slice(-3);

  // --- Handlers for Active/Inactive State ---
  const handleMouseEnter = () => setIsActive(true);
  const handleMouseLeave = () => setIsActive(false);
  // Consider adding onFocus/onBlur for the container/input if needed for accessibility

  // --- Render Logic ---
  if (!currentLobbyId) {
    // Don't show chat if not in a lobby
    return null;
  }

  if (!isActive) {
    // --- Inactive View ---
    return (
      <div
        className="fixed bottom-4 left-4 z-50 hidden md:block cursor-pointer" // Changed right-4 to left-4
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave} // Keep leave handler here too
      >
        <div className="flex flex-col items-start"> {/* Changed items-end to items-start */}
          {inactiveMessages.map((msg, index) => (
            <div key={index} className="p-1 bg-black text-white max-w-xs truncate"> {/* Basic styling, max-width, truncate */}
              {/* Don't show username in inactive view? Or keep it? Let's keep it for now */}
              {msg.username && <b>{msg.username}:</b>} {msg.message}
            </div>
          ))}
          {inactiveMessages.length === 0 && (
             <div className="p-1 bg-black text-white/70 text-xs italic">No recent messages</div>
          )}
        </div>
      </div>
    );
  } else {
    // --- Active View ---
    return (
      <div
        className="fixed bottom-6 left-6 z-50 rounded-md p-4 shadow-lg flex flex-col" // Base active styles
        style={{ backgroundColor: sandColor, width: '350px', height: '300px' }} // Use defined sand color, set dimensions
        onMouseEnter={handleMouseEnter} // Keep hover state active while mouse is inside
        onMouseLeave={handleMouseLeave}
      >
        {/* Custom Chat Display Area */}
        <div
          ref={chatDisplayRef}
          className="flex-grow overflow-y-auto mb-2 text-sm text-black pr-1" // Added padding-right for scrollbar
          css={scrollbarCSS} // Apply custom scrollbar styles
        >
          {/* We map all messages here, including system messages */}
          {chatMessages.map((c, i) => (
            <div key={i} className='py-1' style={{ color: c.username ? 'inherit' : '#666' }}> {/* Adjusted system message color slightly */}
              {c.username && <b>{c.username}:</b>} {c.message}
            </div>
          ))}
        </div>

        {/* Chat Input */}
        <ChatInput socket={_socket} lobbyId={currentLobbyId} />
      </div>
    );
  }
};
