import React, { useState, useEffect, useRef, useCallback } from 'react'; // Import hooks
import { useRouter } from 'next/router'; // Import useRouter
import Link from 'next/link'; // Import Link
import { useGlobalChat } from '@/contexts/GlobalChatContext';
import { useMultiplayer } from '@/components/multiplayer/context/MultiplayerContext';
// ChatDisplay is not directly used anymore, rendering messages directly
import { ChatInput } from '@/components/multiplayer/chat/ChatInput'; // Reusing existing input
import { createStyles } from '../GlobalStyles';
import { artifactsTheme } from '@/pages/artifacts';

const scrollbarCSS = {
  '&::-webkit-scrollbar': {
    width: 12,
    height: 12,
  },
  '&::-webkit-scrollbar-track': {
    background: 'none',
  },
  '&::-webkit-scrollbar-thumb': {
    backgroundColor: 'var(--textVeryLowOpacity)',
    borderRadius: 25,
    border: '5px solid var(--backgroundColorBarelyLight)',
  },
  '&::-webkit-scrollbar-thumb:hover': {
    backgroundColor: 'var(--textLowOpacity)',
  }
}

// Removed className and style props
export const GlobalChat = ({ notFixed, showHeader }) => {
  const [isActive, setIsActive] = useState(false);
  const {
    globalChatMessages,
    joinGlobalChat,
    leaveGlobalChat,
    isInGlobalChat,
    // sendGlobalMessage // We use ChatInput which calls context internally via socket prop
  } = useGlobalChat();
  const { _socket, isConnected, isRegistered } = useMultiplayer(); // Need socket for ChatInput and connection status
  const router = useRouter(); // Get router instance
  const chatDisplayRef = useRef(null); // Ref for auto-scrolling
  const containerRef = useRef(null); // Ref for the main container div

  // Determine if chat should be functional
  const canChat = _socket && isConnected && isRegistered;

  // Join global chat on mount if possible, or when connection becomes available
  useEffect(() => {
    if (canChat && !isInGlobalChat) {
      joinGlobalChat();
    }
    // We don't necessarily leave on unmount, maybe user just navigates away
    // Leaving is handled by isActive state changes now
  }, [canChat, isInGlobalChat, joinGlobalChat]);


  // Auto-scroll effect for the active chat display
  useEffect(() => {
    if (isActive && chatDisplayRef.current) {
      chatDisplayRef.current.scrollTop = chatDisplayRef.current.scrollHeight;
    }
  }, [globalChatMessages, isActive]); // Scroll when messages change or chat becomes active

  // Effect to handle clicks outside the component
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isActive && containerRef.current && !containerRef.current.contains(event.target)) {
        setIsActive(false);
        // Consider if leaveGlobalChat should be called here?
        // Maybe not, user might just be clicking away temporarily.
        // Let's stick to FixedChat's behavior for now.
      }
    };
    if (isActive) {
      document.addEventListener('pointerdown', handleClickOutside, true);
    }
    return () => {
      document.removeEventListener('pointerdown', handleClickOutside, true);
    };
  }, [isActive]); // Re-run this effect when isActive changes

  // Filter messages for inactive view (last 3 user messages)
  const inactiveMessages = globalChatMessages.filter(msg => msg.username).slice(-3);

  // --- Handlers for Active/Inactive State (adapted from FixedChat) ---
  const handleMouseEnter = () => {
    if (canChat) setIsActive(true); // Only activate if connected
  };
  const handleMouseLeave = () => {
    if (containerRef.current && !containerRef.current.contains(document.activeElement)) {
      setIsActive(false);
    }
  };
  const handleKeyDown = (event) => {
    if (event.key === 'Escape') {
      setIsActive(false);
      if (containerRef.current && containerRef.current.contains(document.activeElement)) {
        document.activeElement.blur();
      }
    }
  };
  const handleFocus = () => {
     if (canChat) setIsActive(true); // Only activate if connected
  };
  const handleBlur = (event) => {
    if (containerRef.current && !containerRef.current.contains(event.relatedTarget)) {
      setIsActive(false);
    }
  };

  // --- Render Logic ---

  // Check if we are on the multiplayer lobby page
  const isLobbyPage = router.pathname === '/multiplayer';

  // Define base classes and styles like FixedChat (Desktop version assumed for GlobalChat)
  const inactiveBaseClasses = `${notFixed ? '' : 'fixed bottom-3 left-3 z-50'} cursor-pointer`; // Positioned bottom-left
  const activeBaseClasses = `${notFixed ? '' : 'fixed bottom-3 left-3 z-50'} p-3 flex flex-col outline-none`; // Positioned bottom-left
  // Adjust width based on notFixed prop
  const activeStyle = {
    width: notFixed ? '100%' : '450px',
    maxHeight: '300px'
  };

  // --- Active/Inactive Toggle ---
  if (!isActive) {
    // --- Inactive View ---
    return (
      <div
        ref={containerRef}
        className={inactiveBaseClasses}
        onMouseEnter={handleMouseEnter} // Activate on hover
        onClick={() => canChat && setIsActive(true)} // Activate on click if possible
        title={!canChat ? "Connecting..." : "Click or hover to open chat"} // Tooltip
      >
        <div className="flex flex-col items-start">
          {/* Show connecting state if applicable */}
          {!canChat && (
             <div className="p-1 px-2 rounded bg-black text-white text-xs italic border border-white/20">
               Connecting...
             </div>
          )}
           {/* Show message preview only if connected */}
           {canChat && inactiveMessages.length > 0 && inactiveMessages.map((msg, index) => {
             // Conditional styling for lobby page
             const lobbyInactiveClasses = "bg-[var(--backgroundColor)] text-black border-black/20";
             const defaultInactiveClasses = "bg-black text-white border-white/20";
             const inactiveMsgClasses = isLobbyPage ? lobbyInactiveClasses : defaultInactiveClasses;

             return (
               <div
                 key={index}
                 // Apply conditional styles
                 className={`p-1 px-2 text-sm ${inactiveMsgClasses}`}
               >
                 {msg.username && <b>{msg.username}:</b>} {msg.message}
               </div>
             );
           })}
           {/* Placeholder if connected but no messages */}
           {canChat && inactiveMessages.length === 0 && (
              <div className={`p-1 px-2 rounded text-xs italic border ${
                isLobbyPage
                  ? 'bg-[var(--backgroundColor)] text-black/70 border-black/20' // Lobby style
                  : 'bg-black text-white/70 border-white/20' // Default style
              }`}>
                No recent messages
              </div>
          )}
          
        </div>
      </div>
    );
  } else {
    // --- Active View ---
    return (
      <div css={createStyles(artifactsTheme)}>
        <div
          css={{
            borderColor: '#ffffff77 #00000077 #00000077 #ffffff77',
            border: '1px outset',
            background: 'var(--backgroundColor)',
          }}
          ref={containerRef}
          tabIndex={-1} // Make focusable for blur/escape
          className={activeBaseClasses}
          style={activeStyle}
          onMouseEnter={handleMouseEnter} // Keep active on mouse enter
          onMouseLeave={handleMouseLeave} // Deactivate on mouse leave (if not focused)
          onFocus={handleFocus} // Keep active on focus
          onBlur={handleBlur} // Deactivate on blur (if focus moves outside)
          onKeyDown={handleKeyDown} // Handle escape key
        >
          {showHeader && (
            <div className='flex justify-between items-center mb-3'>
              <b className='ml-1'>Global Chat</b>
              <Link href="/multiplayer" passHref>
                <button
                  className="px-3 py-1 rounded text-black text-sm shadow"
                  style={{ backgroundColor: '#91c3cb' }}
                  onClick={(e) => e.stopPropagation()} // Prevent chat activation on button click
                >
                  Go to Multiplayer Lobby
                </button>
              </Link>
            </div>
          )}
          
          {/* Chat Display Area - Render messages directly */}
          <div
            ref={chatDisplayRef}
            className="flex-grow overflow-y-auto text-sm text-black pr-1 rounded p-2 border border-black/10"
            css={{
              ...scrollbarCSS,
              backgroundColor: 'var(--backgroundColorBarelyLight)', // Use a barely dark background
            }}
          >
            {globalChatMessages.map((c, i) => (
              <div key={i} className='py-1' style={{ color: c.username ? 'inherit' : '#666' }}>
                {c.username && <b>{c.username}:</b>} {c.message}
              </div>
            ))}
            {/* Add a small message if chat history is empty */}
            {globalChatMessages.length === 0 && (
              <div className="text-xs italic text-gray-500">Welcome to global chat!</div>
            )}
          </div>

          {/* Chat Input Area */}
          {/* Pass the shared socket and "global" as lobbyId */}
          {/* ChatInput uses the socket prop to send messages via the context */}
          <ChatInput socket={_socket} lobbyId="global" />

          {/* Note: The "Connecting..." overlay is handled in the inactive state now */}
        </div>
      </div>
    );
  }
};
