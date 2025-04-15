import React, { useState, useEffect, useCallback, useContext, createContext, useRef } from 'react';
import { useMultiplayer } from '@/components/multiplayer/context/MultiplayerContext';
import useUser from '@/hooks/useUser';

const GlobalChatContext = createContext(null);

export const useGlobalChat = () => {
  const context = useContext(GlobalChatContext);
  if (!context) {
    throw new Error('useGlobalChat must be used within a GlobalChatProvider');
  }
  return context;
};

export const GlobalChatProvider = ({ children }) => {
  const { _socket, isConnected, isRegistered } = useMultiplayer(); // Get shared socket and connection status
  const { user } = useUser();
  const [globalChatMessages, setGlobalChatMessages] = useState([]);
  const [isInGlobalChat, setIsInGlobalChat] = useState(false); // Track if currently joined

  // Listener for incoming chat messages (filters for global)
  const handleChatMessage = useCallback((messages) => {
    // Ensure messages is an array before filtering
    if (Array.isArray(messages)) {
      const globalMessages = messages.filter(msg => msg.lobby === 'global');
      // Only update if there are actually global messages in the payload
      // This prevents overwriting history if a lobby-specific chat update comes through
      if (globalMessages.length > 0 || messages.every(msg => msg.lobby === 'global')) {
         console.log('[GlobalChatContext] Received chat update containing global messages:', globalMessages);
         setGlobalChatMessages(globalMessages);
      } else {
         // console.log('[GlobalChatContext] Received chat update, but no global messages found. Ignoring.');
      }
    } else {
       console.warn('[GlobalChatContext] Received non-array chat message payload:', messages);
    }
  }, []);

  useEffect(() => {
    if (_socket && isConnected && isRegistered) {
      console.log('[GlobalChatContext] Socket connected and registered, attaching chat listener.');
      _socket.on('chat', handleChatMessage);

      // Cleanup listener on unmount or socket change
      return () => {
        console.log('[GlobalChatContext] Cleaning up chat listener.');
        _socket.off('chat', handleChatMessage);
      };
    } else {
       console.log('[GlobalChatContext] Socket not ready, listener not attached.');
       // Clear messages if socket disconnects
       setGlobalChatMessages([]);
    }
  }, [_socket, isConnected, isRegistered, handleChatMessage]);

  // Function to join the global chat room
  const joinGlobalChat = useCallback(() => {
    if (_socket && isConnected && isRegistered && !isInGlobalChat) {
      console.log('[GlobalChatContext] Emitting join-global-chat');
      _socket.emit('join-global-chat');
      setIsInGlobalChat(true);
      // Note: History is sent by backend upon join confirmation via 'chat' event
    } else {
       console.warn('[GlobalChatContext] Cannot join global chat:', { isConnected, isRegistered, isInGlobalChat });
    }
  }, [_socket, isConnected, isRegistered, isInGlobalChat]);

  // Function to leave the global chat room
  const leaveGlobalChat = useCallback(() => {
    if (_socket && isConnected && isInGlobalChat) { // Only leave if actually joined
      console.log('[GlobalChatContext] Emitting leave-global-chat');
      _socket.emit('leave-global-chat');
      setIsInGlobalChat(false);
      setGlobalChatMessages([]); // Clear messages on leave
    } else {
       // console.warn('[GlobalChatContext] Cannot leave global chat:', { isConnected, isInGlobalChat });
    }
  }, [_socket, isConnected, isInGlobalChat]);

  // Function to send a global message
  const sendGlobalMessage = useCallback((message) => {
    if (_socket && isConnected && isRegistered && isInGlobalChat && user?.username) {
      const trimmedMessage = message.trim();
      if (trimmedMessage) {
        console.log(`[GlobalChatContext] Emitting send (global): ${trimmedMessage}`);
        _socket.emit('send', {
          lobby: 'global',
          username: user.username, // Backend uses this
          message: trimmedMessage
        });
      }
    } else {
       console.error('[GlobalChatContext] Cannot send global message:', { isConnected, isRegistered, isInGlobalChat, username: user?.username });
       // Maybe show a toast error?
    }
  }, [_socket, isConnected, isRegistered, isInGlobalChat, user?.username]);


  const value = {
    globalChatMessages,
    joinGlobalChat,
    leaveGlobalChat,
    sendGlobalMessage,
    isInGlobalChat,
    // Expose shared socket if needed by components directly (though sendGlobalMessage is preferred)
    // _socket,
  };

  return (
    <GlobalChatContext.Provider value={value}>
      {children}
    </GlobalChatContext.Provider>
  );
};
