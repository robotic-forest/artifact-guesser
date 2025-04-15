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

// Added isMobileLayout prop
export const FixedChat = ({ lightContext = false, isMobileLayout = false }) => {
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

  // Effect to handle clicks outside the component
  useEffect(() => {
    const handleClickOutside = (event) => {
      // If chat is active and the click is outside the container ref
      if (isActive && containerRef.current && !containerRef.current.contains(event.target)) {
        setIsActive(false);
      }
    };

    // Add listener if chat is active (changed to 'pointerdown')
    if (isActive) {
      document.addEventListener('pointerdown', handleClickOutside, true); // Use capture phase
    }

    // Cleanup: remove listener when component unmounts or isActive becomes false
    return () => {
      document.removeEventListener('pointerdown', handleClickOutside, true); // Use capture phase
    };
  }, [isActive]); // Re-run this effect when isActive changes

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

  // Determine base classes based on mobile layout
  const inactiveBaseClasses = isMobileLayout
    ? "relative w-full mb-2 cursor-pointer p-2 border border-black/20 rounded bg-white/80" // Mobile: relative, full width, margin, padding, border, light bg
    : "fixed bottom-4 left-4 z-50 hidden md:block cursor-pointer"; // Desktop: fixed, bottom-left, hidden on mobile

  const activeBaseClasses = isMobileLayout
    ? "relative w-full mb-2 rounded-md p-4 shadow-lg flex flex-col outline-none" // Mobile: relative, full width, margin
    : "fixed bottom-6 left-6 z-50 rounded-md p-4 shadow-lg flex flex-col outline-none"; // Desktop: fixed, bottom-left

  const activeStyle = isMobileLayout
    ? { backgroundColor: sandColor, height: '250px' } // Mobile: sand color, adjusted height, width is handled by w-full
    : { backgroundColor: sandColor, width: '350px', height: '300px' }; // Desktop: original fixed dimensions

  // --- Desktop/Mobile Rendering with Active/Inactive Toggle ---
  if (!isActive) {
    // --- Inactive View ---
    if (isMobileLayout) {
      // Mobile Inactive: Show a tappable preview (styled like desktop)
      return (
        <div
          ref={containerRef}
          // Removed w-full, changed bg/text/border colors, adjusted padding/margin to match desktop feel
          className="relative inline-block mb-1 cursor-pointer p-1 px-2 rounded bg-black text-white text-sm border border-white/20"
          onClick={() => setIsActive(true)} // Activate on click/tap
        >
          {inactiveMessages.length > 0 ? (
             // Show last message preview
             <div className="truncate max-w-xs"> {/* Added max-w-xs like desktop */}
               {inactiveMessages[inactiveMessages.length - 1].username && <b>{inactiveMessages[inactiveMessages.length - 1].username}:</b>} {inactiveMessages[inactiveMessages.length - 1].message}
             </div>
           ) : (
             // Show placeholder (updated text color)
             <div className="italic text-white/70">Tap to chat...</div>
           )}
        </div>
      );
    } else {
      // Desktop Inactive: Show message previews on hover
      return (
        <div
          ref={containerRef}
          className={inactiveBaseClasses} // Use desktop inactive classes
          onMouseEnter={handleMouseEnter}
        >
          <div className="flex flex-col items-start">
            {inactiveMessages.map((msg, index) => (
              <div
                key={index}
                className={`p-1 max-w-xs truncate ${
                  lightContext ? 'bg-transparent text-black' : 'bg-black text-white'
                }`}
              >
                {msg.username && <b>{msg.username}:</b>} {msg.message}
              </div>
            ))}
            {inactiveMessages.length === 0 && (
               <div className={`p-1 text-xs italic ${
                  lightContext ? 'bg-transparent text-black/70' : 'bg-black text-white/70'
               }`}>No recent messages</div>
            )}
          </div>
        </div>
      );
    }
  } else {
    // --- Active View (Mobile and Desktop) ---
    return (
      <div
        ref={containerRef}
        tabIndex={-1} // Make focusable for blur/escape
        className={activeBaseClasses} // Use appropriate base classes
        style={activeStyle} // Use appropriate style
        onMouseEnter={!isMobileLayout ? handleMouseEnter : undefined} // Desktop only hover
        onMouseLeave={!isMobileLayout ? handleMouseLeave : undefined} // Desktop only hover
        onFocus={!isMobileLayout ? handleFocus : undefined} // Desktop only focus
        onBlur={handleBlur} // Keep blur for both (click outside)
        onKeyDown={handleKeyDown} // Keep escape key for both
      >
        {/* Custom Chat Display Area */}
        <div
          ref={chatDisplayRef}
          className="flex-grow overflow-y-auto mb-2 text-sm text-black pr-1"
          css={scrollbarCSS}
        >
          {chatMessages.map((c, i) => (
            <div key={i} className='py-1' style={{ color: c.username ? 'inherit' : '#666' }}>
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
