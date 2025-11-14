import { useEffect, useRef, useState, useCallback } from "react"
import useUser from "@/hooks/useUser"

export const ChatDisplay = ({ chat, socket, lobbyId }) => {
  const chatRef = useRef()
  const { isAdmin } = useUser();
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
      setContextMenu({ open: false, x: 0, y: 0, id: null, timestamp: null, username: null, message: null });
    }
  }, [contextMenu.open]);

  useEffect(() => {
    if (chatRef?.current) chatRef.current.scrollTop = chatRef.current.scrollHeight
  }, [chatRef, chat])

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

  return (
    <div className='relative h-[fit-content]'>
      <div className='absolute h-full w-full top-0 left-0 z-[10]' css={{
        background: 'linear-gradient(0deg, transparent 90%, var(--ghostText) 100%)',
        pointerEvents: 'none',
        borderRadius: 3,
      }} />
      <div ref={chatRef} className='mt-1 p-1 pb-0 pr-0 text-sm' css={{
        background: `var(--backgroundColorBarelyDark)`,
        borderRadius: 3,
        height: 143,
        overflow: 'auto',
        ...scrollbarCSS
      }}>
        <div className='flex flex-col justify-end min-h-full'>
          {chat?.map((c, i) => (
            <div key={c.id || i} className='p-2 pt-0' css={{
              color: c.username ? 'var(--textColor)' : 'var(--textLowOpacity)',
            }} onContextMenu={(e) => onMessageContextMenu(e, c)}>
              {c.username && <b>{c.username}</b>} {c.message}
            </div>
          ))}
        </div>
      </div>
      {/* Admin context menu */}
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
              if (socket && lobbyId) {
                socket.emit(
                  'delete-lobby-chat-message',
                  {
                    lobbyId,
                    id: contextMenu.id,
                    timestamp: contextMenu.timestamp,
                    username: contextMenu.username,
                    message: contextMenu.message
                  },
                  () => {}
                );
              }
              closeContextMenu();
            }}
          >
            Delete
          </button>
        </div>
      )}
    </div>
  )
}

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
    border: '5px solid var(--backgroundColorBarelyDark)',
  },
  '&::-webkit-scrollbar-thumb:hover': {
    backgroundColor: 'var(--textLowOpacity)',
  }
}