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
  const { _socket, isConnected, isRegistered } = useMultiplayer();
  const { user } = useUser();
  const [globalChatMessages, setGlobalChatMessages] = useState([]);
  const [isInGlobalChat, setIsInGlobalChat] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Handle initial history / paginated loads (array of messages)
  const handleChatHistory = useCallback((payload) => {
    if (!payload || !payload.messages) return;
    const globalMessages = payload.messages.filter(msg => msg.lobby === 'global');
    console.log('[GlobalChatContext] Received chat-history:', globalMessages.length, 'messages, hasMore:', payload.hasMore);
    setGlobalChatMessages(globalMessages);
    setHasMoreMessages(payload.hasMore ?? false);
  }, []);

  // Handle single new message (incremental update)
  const handleChatMessage = useCallback((payload) => {
    if (typeof payload === 'object' && payload !== null && !Array.isArray(payload) && payload.lobby === 'global') {
      console.log('[GlobalChatContext] Received single global message:', payload);
      setGlobalChatMessages(prev => [...prev, payload]);
    }
    // Ignore arrays (legacy) and non-global messages
  }, []);

  // Handle message deletion
  const handleChatMessageDeleted = useCallback(({ id }) => {
    console.log('[GlobalChatContext] Message deleted:', id);
    setGlobalChatMessages(prev => prev.filter(msg => msg.id !== id));
  }, []);

  useEffect(() => {
    if (_socket && isConnected && isRegistered) {
      console.log('[GlobalChatContext] Socket connected and registered, attaching listeners.');
      _socket.on('chat-history', handleChatHistory);
      _socket.on('chat', handleChatMessage);
      _socket.on('chat-message-deleted', handleChatMessageDeleted);

      return () => {
        console.log('[GlobalChatContext] Cleaning up listeners.');
        _socket.off('chat-history', handleChatHistory);
        _socket.off('chat', handleChatMessage);
        _socket.off('chat-message-deleted', handleChatMessageDeleted);
      };
    } else {
       if (!isConnected) {
           setGlobalChatMessages([]);
           setIsInGlobalChat(false);
           setHasMoreMessages(false);
       }
    }
  }, [_socket, isConnected, isRegistered, handleChatHistory, handleChatMessage, handleChatMessageDeleted]);

  const joinGlobalChat = useCallback(() => {
    if (_socket && isConnected && isRegistered && !isInGlobalChat) {
      console.log('[GlobalChatContext] Emitting join-global-chat');
      _socket.emit('join-global-chat');
      setIsInGlobalChat(true);
    }
  }, [_socket, isConnected, isRegistered, isInGlobalChat]);

  const leaveGlobalChat = useCallback(() => {
    if (_socket && isConnected && isInGlobalChat) {
      console.log('[GlobalChatContext] Emitting leave-global-chat');
      _socket.emit('leave-global-chat');
      setIsInGlobalChat(false);
      setGlobalChatMessages([]);
      setHasMoreMessages(false);
    }
  }, [_socket, isConnected, isInGlobalChat]);

  const sendGlobalMessage = useCallback((message) => {
    if (_socket && isConnected && isRegistered && isInGlobalChat && user?.username) {
      const trimmedMessage = message.trim();
      if (trimmedMessage) {
        _socket.emit('send', {
          lobby: 'global',
          username: user.username,
          message: trimmedMessage
        });
      }
    }
  }, [_socket, isConnected, isRegistered, isInGlobalChat, user?.username]);

  const loadOlderMessages = useCallback(() => {
    if (!_socket || isLoadingMore || !hasMoreMessages || globalChatMessages.length === 0) return;
    setIsLoadingMore(true);
    const oldestTimestamp = globalChatMessages[0]?.timestamp;
    _socket.emit('request-older-messages', { lobby: 'global', before: oldestTimestamp }, (response) => {
      if (response && response.messages) {
        setGlobalChatMessages(prev => [...response.messages, ...prev]);
        setHasMoreMessages(response.hasMore ?? false);
      }
      setIsLoadingMore(false);
    });
  }, [_socket, isLoadingMore, hasMoreMessages, globalChatMessages]);

  const value = {
    globalChatMessages,
    joinGlobalChat,
    leaveGlobalChat,
    sendGlobalMessage,
    isInGlobalChat,
    hasMoreMessages,
    isLoadingMore,
    loadOlderMessages,
  };

  return (
    <GlobalChatContext.Provider value={value}>
      {children}
    </GlobalChatContext.Provider>
  );
};
