import React, { useState, useEffect, useRef } from 'react'; // Import useRef
import { useMultiplayer } from '../context/MultiplayerContext';
import { ChatInput } from './ChatInput';
import { createStyles } from '../../GlobalStyles'; // Import createStyles
import { artifactsTheme } from '@/pages/artifacts'; // Import theme

// Basic scrollbar styling (can be customized further)
const scrollbarCSS = {
  '&::-webkit-scrollbar': {
    width: '8px', // Keep original width for FixedChat
    height: '8px',
  },
  '&::-webkit-scrollbar-track': {
    background: 'none', // Match GlobalChat
  },
  '&::-webkit-scrollbar-thumb': {
    backgroundColor: 'var(--textVeryLowOpacity)', // Match GlobalChat
    borderRadius: '25px', // Match GlobalChat
    border: '2px solid var(--backgroundColorBarelyLight)', // Adjusted border width for smaller scrollbar
  },
  '&::-webkit-scrollbar-thumb:hover': {
    backgroundColor: 'var(--textLowOpacity)', // Match GlobalChat
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
    : "z-50 hidden md:block cursor-pointer"; // Desktop: REMOVED fixed, bottom-4, left-4

  // Adjusted active classes for consistency
  const activeBaseClasses = isMobileLayout
    ? "relative w-full mb-2 p-3 flex flex-col outline-none" // Mobile: relative, full width, margin, padding adjusted
    : "z-50 p-3 flex flex-col outline-none"; // Desktop: REMOVED fixed, bottom-3, left-3

  // Adjusted active style for consistency
  const activeStyle = isMobileLayout
    ? { width: '100%', maxHeight: '250px' } // Mobile: Use maxHeight, width is handled by w-full
    : { width: '350px', maxHeight: '300px' }; // Desktop: Use maxHeight, keep original width

  // --- Desktop/Mobile Rendering with Active/Inactive Toggle ---
  if (!isActive) {
    // --- Inactive View ---
    if (isMobileLayout) {
      // Mobile Inactive: Show a tappable preview (styled like desktop)
      return (
        <div
          ref={containerRef}
          // Use GlobalChat's inactive styling approach
          className="relative inline-block mb-1 cursor-pointer"
          onClick={() => setIsActive(true)} // Activate on click/tap
        >
          {inactiveMessages.length > 0 ? (
             // Show last message preview (styled like GlobalChat inactive)
             inactiveMessages.map((msg, index) => (
              <div
                key={index}
                className="p-1 px-2 text-sm"
                css={{
                  background: 'var(--backgroundColor)',
                  color: 'var(--textColor)',
                  border: '1px solid var(--borderColor)',
                  marginTop: '2px',
                  borderRadius: '3px'
                }}
              >
                {msg.username && <b className="mr-1">{msg.username}:</b>} {msg.message}
              </div>
             ))
           ) : (
             // Show placeholder (styled like GlobalChat inactive)
             <div
                className="p-1 px-2 rounded text-xs italic"
                css={{
                  background: 'var(--backgroundColor)',
                  color: 'var(--textColorLowOpacity)',
                  marginTop: '2px'
                }}
              >
                Tap to chat...
              </div>
           )}
        </div>
      );
    } else {
      // Desktop Inactive: Show message previews on hover (styled like GlobalChat inactive)
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
                className="p-1 px-2 text-sm" // Removed conditional classes, max-w, truncate
                css={{
                  background: 'var(--backgroundColor)',
                  color: 'var(--textColor)', // Use theme text color
                  border: '1px solid var(--borderColor)', // Use theme border color
                  marginTop: '2px', // Add slight spacing
                  borderRadius: '3px' // Add slight rounding
                }}
              >
                {msg.username && <b className="mr-1">{msg.username}:</b>} {msg.message}
              </div>
            ))}
            {inactiveMessages.length === 0 && (
               <div
                className="p-1 px-2 rounded text-xs italic"
                css={{
                  background: 'var(--backgroundColor)',
                  color: 'var(--textColorLowOpacity)',
                  marginTop: '2px'
                }}
              >
                No recent messages
              </div>
            )}
          </div>
        </div>
      );
    }
  } else {
    // --- Active View (Mobile and Desktop) ---
    // Wrap with theme provider like GlobalChat
    return (
      <div css={createStyles(artifactsTheme)}>
        <div
          // Apply GlobalChat's active container styling
          css={{
            borderColor: '#ffffff77 #00000077 #00000077 #ffffff77',
            border: '1px outset',
            background: 'var(--backgroundColor)',
          }}
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
          {/* Chat Display Area - Apply GlobalChat styling */}
          <div
            ref={chatDisplayRef}
            className="flex-grow overflow-y-auto text-sm text-black pr-1 rounded p-2 border border-black/10" // Added padding, border like GlobalChat
            css={{
              ...scrollbarCSS, // Apply updated scrollbar CSS
              backgroundColor: 'var(--backgroundColorBarelyLight)', // Match GlobalChat
            }}
          >
            {chatMessages.map((c, i) => (
              <div key={i} className='py-1' style={{ color: c.username ? 'inherit' : '#666' }}>
                {c.username && <b>{c.username}:</b>} {c.message}
              </div>
            ))}
            {/* Add a small message if chat history is empty */}
            {chatMessages.length === 0 && (
              <div className="text-xs italic text-gray-500">Welcome to the lobby chat!</div>
            )}
          </div>
          {/* Chat Input - No wrapper needed like GlobalChat */}
          <ChatInput socket={_socket} lobbyId={currentLobbyId} />
        </div>
      </div>
    );
  }
};
