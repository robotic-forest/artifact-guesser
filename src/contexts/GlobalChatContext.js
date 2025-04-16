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
  const handleChatMessage = useCallback((payload) => {
    // Determine if the payload is the initial history (array) or a single update (object)
    // Note: This assumes the server sends full history as an array and updates as single objects.
    // Adjust if the server behavior is different.

    if (Array.isArray(payload)) {
      // Likely the initial history load or potentially multiple messages at once
      const globalMessages = payload.filter(msg => msg.lobby === 'global');
      if (globalMessages.length > 0 || payload.every(msg => msg.lobby === 'global')) {
        console.log('[GlobalChatContext] Received global message array (history or batch):', globalMessages);
        // Replace state with the full history/batch
        setGlobalChatMessages(globalMessages);
      } else {
        // console.log('[GlobalChatContext] Received array, but no global messages found. Ignoring.');
      }
    } else if (typeof payload === 'object' && payload !== null && payload.lobby === 'global') {
      // Likely a single new message update
      const newMessage = payload;
      console.log('[GlobalChatContext] Received single global message update:', newMessage);
      // Append the new message to the existing state
      setGlobalChatMessages(prevMessages => [...prevMessages, newMessage]);
    } else {
      // Ignore payloads that are not arrays or relevant single objects
      // console.warn('[GlobalChatContext] Received unexpected chat message payload:', payload);
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
