import { useState, useEffect, useCallback } from 'react';
import io from 'socket.io-client'; // Assuming socket.io-client is installed
import useUser from '@/hooks/useUser'; // To get user info for joining

// Use the correct backend server URL and port
const SOCKET_SERVER_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:9667'; // Default to localhost:9667

let socket = null; // Keep socket instance outside the hook to prevent reconnects on re-render

export const useLobby = () => {
  const { user } = useUser();
  const [lobbies, setLobbies] = useState([]);
  const [currentLobbyId, setCurrentLobbyId] = useState(null);
  const [isConnected, setIsConnected] = useState(socket?.connected || false);
  const [chatMessages, setChatMessages] = useState([]); // State for chat messages

  // Function to connect to the socket server
  const connectSocket = useCallback(() => {
    if (socket && socket.connected) {
      console.log('Socket already connected.');
      return;
    }

    console.log('Connecting to socket server...');
    if (socket) {
      socket.disconnect();
    }

    socket = io(SOCKET_SERVER_URL, {
      path: '/ag/socket.io/',
    });

    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
      setIsConnected(true); // Use direct set here is likely fine, but functional update below for consistency

      if (user?.isLoggedIn && user.id && user.username) {
        console.log(`Emitting register-client for ${user.username}`);
        socket.emit('register-client', { userId: user.id, username: user.username });
      } else {
         console.warn("User not logged in or missing info, cannot register client.");
      }
      socket.emit('list-lobbies');
    });

    socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      // Use functional update for state setters inside callbacks
      setIsConnected(prev => false);
      setCurrentLobbyId(prev => null);
      setLobbies(prev => []);
      setChatMessages(prev => []);
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      // Use functional update
      setIsConnected(prev => false);
    });

    socket.on('update-lobbies', (update) => {
      console.log('Received lobby update:', update);
      if (!update || !update.type) return;

      // Use functional update for state setters inside callbacks
      setLobbies(prevLobbies => {
        switch (update.type) {
          case 'list':
            return update.lobbies || [];
          case 'create':
            if (!update.lobby || prevLobbies.some(l => l._id === update.lobby._id)) {
              return prevLobbies;
            }
            return [...prevLobbies, update.lobby];
          case 'delete':
            if (!update.lobbyId) return prevLobbies;
            return prevLobbies.filter(l => l._id !== update.lobbyId);
          case 'update':
             if (!update.lobby) return prevLobbies;
             return prevLobbies.map(l => l._id === update.lobby._id ? update.lobby : l);
          default:
            console.warn('Unknown lobby update type:', update.type);
            return prevLobbies;
        }
      });
       // Use functional update for setCurrentLobbyId as well, though less critical here
       if (update.type === 'create' && update.lobby?.host?.socketId === socket?.id) {
          console.log(`Detected own lobby creation, setting currentLobbyId: ${update.lobby._id}`);
          setCurrentLobbyId(update.lobby._id); // Direct set might be okay here, but functional is safer
          // setCurrentLobbyId(prevId => update.lobby._id); // Functional alternative
       }
    });

     socket.on('clients', ({ lobby, clients }) => {
        console.log(`Received client list for lobby ${lobby}:`, clients);
     });

    socket.on('lobby-error', (error) => {
      console.error('Lobby Error:', error.message);
    });
    socket.on('game-error', (error) => {
      console.error('Game Error:', error.message);
    });

    socket.on('chat', (messages) => {
      console.log('Received chat update:', messages);
      // Use functional update
      setChatMessages(prevMessages => messages); // Assuming backend sends the full list
    });

  }, [user]); // Depend on user

  useEffect(() => {
    if (!user) return;
    if (!socket || !socket.connected) {
       connectSocket();
    }
    return () => {
      if (socket) {
        console.log('Cleaning up socket listeners on component unmount.');
        socket.off('connect');
        socket.off('disconnect');
        socket.off('connect_error');
        socket.off('update-lobbies');
        socket.off('clients');
        socket.off('lobby-error');
        socket.off('game-error');
        socket.off('chat');
      }
    };
  }, [connectSocket, user]);

  const createLobby = useCallback((lobbySettings) => {
    if (!socket || !socket.connected) { console.error('Socket not connected.'); return; }
    if (!user?.isLoggedIn) { console.error('User not logged in.'); return; }
    console.log('Emitting create-lobby:', lobbySettings);
    socket.emit('create-lobby', lobbySettings);
  }, [user, socket]);

  const joinLobby = useCallback((lobbyId) => {
    if (!socket || !socket.connected) { console.error('Socket not connected.'); return; }
     if (!user?.isLoggedIn) { console.error('User not logged in.'); return; }
    console.log(`Emitting join for lobby ${lobbyId}`);
    socket.emit('join', { lobby: lobbyId, userId: user.id, username: user.username });
    setCurrentLobbyId(lobbyId);
  }, [user, socket]);

  const leaveLobby = useCallback(() => {
    if (!socket || !socket.connected || !currentLobbyId) { console.error('Not connected or not in a lobby.'); return; }
     if (!user?.isLoggedIn) { console.error('User not logged in.'); return; }
    console.log(`Emitting leave for lobby ${currentLobbyId}`);
    socket.emit('leave', { lobby: currentLobbyId, userId: user.id, username: user.username });
    setCurrentLobbyId(null);
    setChatMessages([]);
  }, [currentLobbyId, user, socket]);

  // Log state changes for debugging inside the hook body, BEFORE the return
  console.log('[useLobby] Rendering State:', { isConnected, currentLobbyId, lobbiesCount: lobbies?.length ?? 'null', chatCount: chatMessages?.length ?? 'null' });

  return {
    lobbies,
    currentLobbyId,
    isConnected,
    createLobby,
    joinLobby,
    leaveLobby,
    _socket: socket,
    chatMessages
  };
};
