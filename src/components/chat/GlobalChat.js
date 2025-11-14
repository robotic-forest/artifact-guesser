import React, { useState, useEffect, useRef, useCallback } from 'react'; // Import hooks
import dynamic from 'next/dynamic'; // Import dynamic
import { useRouter } from 'next/router'; // Import useRouter
import Link from 'next/link'; // Import Link
import useUser from '@/hooks/useUser'; // Import useUser
import toast from 'react-hot-toast'; // Import toast
import AAAAAA from '../art/AAAAAA'; // Import AAAAAA
import { generateInsult } from '@/hooks/useInsult'; // Import generateInsult
import useAAAAtoast from '@/hooks/useAAAAtoast'; // Import the new hook
import { useGlobalChat } from '@/contexts/GlobalChatContext';
import { useMultiplayer } from '@/components/multiplayer/context/MultiplayerContext';
import ReactMarkdown from 'react-markdown'; // Import ReactMarkdown
import { ChatInput } from '@/components/multiplayer/chat/ChatInput';
import { createStyles } from '../GlobalStyles';
import { artifactsTheme } from '@/pages/artifacts';
import { useMediaQuery } from 'react-responsive';

// Dynamically import AAAAAAConfetti
const AAAAAAConfettiDynamic = dynamic(() => import('@/components/art/AAAAAAConfetti'), {
  ssr: false,
});

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
 export const GlobalChat = ({ notFixed, showHeader, backgroundColor }) => {
   const { triggerAAAAtoast, showConfetti } = useAAAAtoast(); // Initialize the hook
   const [isActive, setIsActive] = useState(false);
   const {
    globalChatMessages,
    joinGlobalChat,
    leaveGlobalChat,
    isInGlobalChat,
    // sendGlobalMessage // We use ChatInput which calls context internally via socket prop
  } = useGlobalChat();
  const { _socket, isConnected, isRegistered, globalUserCount } = useMultiplayer(); // Need socket, connection status, and user count
  const { user, isAdmin } = useUser(); // Get user state and admin flag
  // Removed signupOpen state
  const router = useRouter(); // Get router instance
  const chatDisplayRef = useRef(null); // Ref for auto-scrolling
  const containerRef = useRef(null); // Ref for the main container div
  const isMobile = useMediaQuery({ query: '(max-width: 568px)' }); // Check if mobile

  // Determine if chat should be functional
  const canChat = _socket && isConnected && isRegistered;

  // Admin context menu state
  const [contextMenu, setContextMenu] = useState({ open: false, x: 0, y: 0, id: null, timestamp: null, username: null, message: null });
  const menuRef = useRef(null);

  const onMessageContextMenu = (event, message) => {
    if (!isAdmin) return;
    event.preventDefault();
    event.stopPropagation();
    setContextMenu({
      open: true,
      x: event.clientX,
      y: event.clientY,
      id: message?.id || null,
      timestamp: message?.timestamp || null,
      username: message?.username || null,
      message: message?.message || null
    });
  };

  const closeContextMenu = useCallback(() => {
    if (contextMenu.open) {
      setContextMenu({ open: false, x: 0, y: 0, id: null });
    }
  }, [contextMenu.open]);

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
      // Removed signupOpen check as dialog is no longer used
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

  // Close admin context menu on any pointerdown outside the menu
  useEffect(() => {
    if (!contextMenu.open) return;
    const handleAnyPointerDown = (e) => {
      if (menuRef.current && menuRef.current.contains(e.target)) return;
      closeContextMenu();
    };
    document.addEventListener('pointerdown', handleAnyPointerDown, true);
    return () => {
      document.removeEventListener('pointerdown', handleAnyPointerDown, true);
    };
  }, [contextMenu.open, closeContextMenu]);

  // Filter messages for inactive view (last 3 user messages)
  const inactiveMessages = globalChatMessages.filter(msg => msg.username).slice(-5);

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

  // Define base classes and styles like FixedChat (Desktop version assumed for GlobalChat)
  const inactiveBaseClasses = `${notFixed ? '' : 'fixed bottom-3 left-3 z-50'} cursor-pointer`; // Positioned bottom-left
  const activeBaseClasses = `${notFixed ? '' : 'fixed bottom-3 left-3 z-50'} p-3 flex flex-col outline-none`; // Positioned bottom-left
  // Adjust width based on notFixed prop
  const activeStyle = {
    minWidth: isMobile ? '100%' : '350px',
    maxHeight: '300px'
  };

  // --- Active/Inactive Toggle ---
  if (!isActive) {
    // --- Inactive View ---
    return (
      <div
        ref={containerRef}
        className={inactiveBaseClasses}
        // onMouseEnter moved to inner div
        // onClick moved to inner div
        title={!canChat ? "Connecting..." : "Click or hover to open chat"} // Tooltip
      >
        <div
          className="flex flex-col items-start"
          onMouseEnter={handleMouseEnter} // Activate on hover over content
          onClick={() => canChat && setIsActive(true)} // Activate on click over content
        >
          {/* Show connecting state if applicable */}
          {!canChat && (
             <div className="p-1 px-2 rounded bg-black text-white text-xs italic border border-white/20">
                Connecting...
              </div>
           )}
            {/* Show user count in inactive view if connected */}
             {canChat && (
               // Apply lobby theme styles consistently
               <div className="p-1 px-2 text-xs italic flex items-center" css={{ background: backgroundColor || 'var(--backgroundColor)', color: 'var(--textColorLowOpacity)', border: '1px solid var(--borderColor)' }}>
                 <span className="inline-block w-2.5 h-2.5 bg-green-500 border border-black rounded-full mr-3"></span>
                 {globalUserCount} {globalUserCount === 1 ? 'user' : 'users'} online
               </div>
            )}
             {/* Show message preview only if connected */}
           {canChat && inactiveMessages.length > 0 && inactiveMessages.map((msg, index) => (
              // Apply lobby theme styles consistently
              <div
               key={msg.id || index}
                 className="p-1 px-2 text-sm" // Removed conditional classes
                 css={{
                   background: backgroundColor || 'var(--backgroundColor)',
                   color: 'var(--textColor)', // Use theme text color
                   border: '1px solid var(--borderColor)', // Use theme border color
                   marginTop: '2px', // Add slight spacing
                  borderRadius: '3px' // Add slight rounding
               }}
               onContextMenu={(e) => onMessageContextMenu(e, msg)}
              >
                {/* Render inactive messages with Markdown */}
                {msg.username && <b className="mr-1">{msg.username}:</b>}
                <ReactMarkdown
                  components={{
                    p: ({children}) => <>{children}</>, // Render paragraphs inline
                    a: ({node, ...props}) => <a {...props} style={{ color: '#578cff', textDecoration: 'underline' }} target="_blank" rel="noopener noreferrer" /> // Darker blue
                  }}
                >
                  {msg.message}
                </ReactMarkdown>
              </div>
            ))}
           {/* Placeholder if connected but no messages */}
           {canChat && inactiveMessages.length === 0 && (
              // Apply lobby theme styles consistently
              <div
                 className="p-1 px-2 rounded text-xs italic"
                 css={{
                   background: backgroundColor || 'var(--backgroundColor)',
                   color: 'var(--textColorLowOpacity)',
                   marginTop: '2px'
                 }}
              >
                No recent messages
              </div>
          )}
          
        </div>
        {/* Admin context menu (inactive view) */}
        {isAdmin && contextMenu.open && (
          <div
            ref={menuRef}
            style={{
              position: 'fixed',
              top: contextMenu.y,
              left: contextMenu.x,
              background: 'var(--backgroundColor)',
              border: '1px solid var(--borderColor)',
              borderRadius: 4,
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
              zIndex: 9999
            }}
          >
            <button
              className="px-3 py-2 text-sm hover:bg-black/10 w-full text-left"
              onClick={(e) => {
                console.log('called')
                e.stopPropagation();
                if (_socket) {
                  console.log('[GlobalChat] Deleting global message...', {
                    id: contextMenu.id,
                    timestamp: contextMenu.timestamp,
                    username: contextMenu.username,
                    message: contextMenu.message
                  });
                  _socket.emit(
                    'delete-global-chat-message',
                    {
                      id: contextMenu.id,
                      timestamp: contextMenu.timestamp,
                      username: contextMenu.username,
                      message: contextMenu.message
                    },
                    (res) => {
                      console.log('[GlobalChat] Delete ACK:', res);
                    }
                  );
                } else {
                  console.warn('[GlobalChat] No socket instance available to delete.');
                }
                closeContextMenu();
              }}
            >
              Delete
            </button>
          </div>
        )}
      </div>
    );
  } else {
    // --- Active View ---
    return (
      <div css={createStyles(artifactsTheme)}>
        {/* Conditionally render confetti */}
        {showConfetti && <AAAAAAConfettiDynamic />}
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
                  onClick={(e) => e.stopPropagation()} // Prevent chat activation on button click, allow Link navigation
                >
                  Go to Multiplayer Area
                </button>
              </Link>
            </div>
           )}

           {/* User Count Display */}
           <div className="text-xs text-black/60 mb-1 ml-1 flex items-center">
             <span className="inline-block w-2.5 h-2.5 bg-green-500 border border-black rounded-full mr-1.5"></span>
             {globalUserCount} {globalUserCount === 1 ? 'user' : 'users'} online
           </div>

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
              <div key={c.id || i} className='py-1' style={{ color: c.username ? 'inherit' : '#666' }} onContextMenu={(e) => onMessageContextMenu(e, c)}>
                {c.username && <b className="mr-1">{c.username}:</b>}
                {/* Use ReactMarkdown to render the message */}
                <ReactMarkdown
                  components={{
                    p: ({children}) => <>{children}</>, // Render paragraphs inline
                    a: ({node, ...props}) => <a {...props} style={{ color: '#578cff', textDecoration: 'underline' }} target="_blank" rel="noopener noreferrer" /> // Darker blue
                  }}
                >
                  {c.message}
                </ReactMarkdown>
              </div>
            ))}
            {/* Add a small message if chat history is empty */}
            {globalChatMessages.length === 0 && (
              <div className="text-xs italic text-gray-500">Welcome to global chat!</div>
            )}
          </div>

          {/* Chat Input Area Wrapper */}
          <div onClick={(e) => {
            if (!user?.isLoggedIn) {
              e.preventDefault(); // Prevent input focus
              e.stopPropagation();
              // Use the hook to trigger the toast/confetti
              triggerAAAAtoast({ // Props for AAAAAA component
                  initialAngry: true,
                  initialText: (
                    <>
                      Sign up to chat,<br/>
                      you {generateInsult('name')}!
                    </>
                  ), // Added comma here
                  initialWidth: 280,
                  angle: 5,
                  textColor: '#ffffff',
                  style: {
                    padding: '0 12px 12px 0'
                  }
                },
                { position: 'bottom-center' } // Toast options (second argument)
              );
            }
            // Otherwise, allow click to propagate to ChatInput (if not disabled)
          }}>
            {/* Pass the shared socket and "global" as lobbyId */}
            {/* ChatInput uses the socket prop to send messages via the context */}
            {/* Use readOnly instead of disabled to allow click event for toast */}
            <ChatInput socket={_socket} lobbyId="global" readOnly={!user?.isLoggedIn} />
          </div>

          {/* Admin context menu (active view) */}
          {isAdmin && contextMenu.open && (
            <div
              ref={menuRef}
              style={{
                position: 'fixed',
                top: contextMenu.y,
                left: contextMenu.x,
                background: 'var(--backgroundColor)',
                border: '1px solid var(--borderColor)',
                borderRadius: 4,
                boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                zIndex: 9999
              }}
            >
              <button
                className="px-3 py-2 text-sm hover:bg-black/10 w-full text-left"
                onClick={(e) => {
                  e.stopPropagation();
                  if (_socket) {
                    _socket.emit('delete-global-chat-message', {
                      id: contextMenu.id,
                      timestamp: contextMenu.timestamp,
                      username: contextMenu.username,
                      message: contextMenu.message
                    });
                  }
                  closeContextMenu();
                }}
              >
                Delete
              </button>
            </div>
          )}
          {/* Note: The "Connecting..." overlay is handled in the inactive state now */}
        </div>
        {/* Removed Signup Dialog */}
      </div>
    );
  }
};
