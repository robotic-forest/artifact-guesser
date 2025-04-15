import React, { useState, useEffect, useRef } from 'react'; // Import useRef
import { useMultiplayer } from '../context/MultiplayerContext';
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

export const FixedChat = ({ lightContext = false }) => { // Add lightContext prop, default to false
  const [isActive, setIsActive] = useState(false);
  const { chatMessages, _socket, currentLobbyId } = useMultiplayer();
  const chatDisplayRef = useRef(null); // Ref for auto-scrolling
  const containerRef = useRef(null); // Ref for the main container div

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
  // Only set inactive on mouse leave if the container or its children DON'T have focus
  const handleMouseLeave = () => {
    if (containerRef.current && !containerRef.current.contains(document.activeElement)) {
      setIsActive(false);
    }
  };

  // Handle Escape key press to deactivate chat
  const handleKeyDown = (event) => {
    if (event.key === 'Escape') {
      setIsActive(false);
      // Optionally blur the active element if it's inside the chat
      if (containerRef.current && containerRef.current.contains(document.activeElement)) {
        document.activeElement.blur();
      }
    }
  };
  const handleFocus = () => setIsActive(true);
  // Set inactive on blur ONLY if the newly focused element is OUTSIDE the chat container
  const handleBlur = (event) => {
    // Check if the relatedTarget (where focus is going) is outside the container
    if (containerRef.current && !containerRef.current.contains(event.relatedTarget)) {
      setIsActive(false);
    }
  };

  // --- Render Logic ---
  if (!currentLobbyId) {
    // Don't show chat if not in a lobby
    return null;
  }

  // --- Separate Views (No Transitions) ---
  if (!isActive) {
    // --- Inactive View ---
    return (
      <div
        ref={containerRef} // Keep ref for focus checks if needed, though less critical now
        className="fixed bottom-4 left-4 z-50 hidden md:block cursor-pointer"
        onMouseEnter={handleMouseEnter}
        // onMouseLeave handled by blur now if focus is primary trigger
      >
        <div className="flex flex-col items-start">
          {inactiveMessages.map((msg, index) => (
            <div
              key={index}
              className={`p-1 max-w-xs truncate ${ // Conditional styling
                lightContext
                  ? 'bg-transparent text-black' // Light context: transparent bg, black text
                  : 'bg-black text-white' // Dark context: black bg, white text
              }`}
            >
              {msg.username && <b>{msg.username}:</b>} {msg.message}
            </div>
          ))}
          {inactiveMessages.length === 0 && (
             <div className={`p-1 text-xs italic ${ // Conditional styling for 'no messages' text
                lightContext
                  ? 'bg-transparent text-black/70'
                  : 'bg-black text-white/70'
             }`}>No recent messages</div>
          )}
        </div>
      </div>
    );
  } else {
    // --- Active View ---
    return (
      <div
        ref={containerRef} // Add ref to the container
        tabIndex={-1} // Make container focusable for blur/escape handling
        className="fixed bottom-6 left-6 z-50 rounded-md p-4 shadow-lg flex flex-col outline-none" // Base active styles, added outline-none
        style={{ backgroundColor: sandColor, width: '350px', height: '300px' }} // Use defined sand color, set dimensions
        onMouseEnter={handleMouseEnter} // Keep hover state active while mouse is inside
        onMouseLeave={handleMouseLeave}
        onFocus={handleFocus} // Keep focus handler
        onBlur={handleBlur} // Keep blur handler
        onKeyDown={handleKeyDown} // Add keydown handler
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
        {/* Render input directly, focus/blur handled by container */}
        <ChatInput socket={_socket} lobbyId={currentLobbyId} />
      </div>
    );
  }
};
