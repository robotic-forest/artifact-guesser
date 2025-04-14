import React, { useState, useEffect, useCallback, useContext, createContext, startTransition } from 'react'; // Import startTransition
import io from 'socket.io-client';
import useUser from '@/hooks/useUser';

const SOCKET_SERVER_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:9667';

const MultiplayerContext = createContext(null);

export const useMultiplayer = () => {
  const context = useContext(MultiplayerContext);
  if (!context) {
    throw new Error('useMultiplayer must be used within a MultiplayerProvider');
  }
  return context;
};

export const MultiplayerProvider = ({ children }) => {
  const { user } = useUser();
  const [lobbies, setLobbies] = useState([]);
  const [currentLobbyId, setCurrentLobbyId] = useState(null);
  const [isConnected, setIsConnected] = useState(false); // Start as false
  const [isRegistered, setIsRegistered] = useState(false); // New state for registration status
  const [chatMessages, setChatMessages] = useState([]);
  const [socketInstance, setSocketInstance] = useState(null);
  const [lobbyClients, setLobbyClients] = useState([]); // State for clients in the current lobby

  const connectSocket = useCallback(() => {
    if (socketInstance && socketInstance.connected) { return; }
    if (socketInstance) { socketInstance.disconnect(); }

    console.log('Connecting to socket server via context...');
    const newSocket = io(SOCKET_SERVER_URL, { path: '/ag/socket.io/' });

    newSocket.on('connect', () => {
      console.log('Socket connected via context:', newSocket.id);
      setIsConnected(true);
      setSocketInstance(newSocket);

      // Use user._id instead of user.id
      if (user?.isLoggedIn && user._id && user.username) {
        console.log(`Emitting register-client for ${user.username}`);
        newSocket.emit('register-client', { userId: user._id, username: user.username });
      } else {
         console.warn("User not logged in or missing info (_id or username), cannot register client.");
         setIsRegistered(false);
      }
    });

    // Listen for registration confirmation
    newSocket.on('client-registered', (data) => {
       console.log('Received client-registered event:', data); // Log received data
       const { socketId, userId: registeredUserId } = data || {}; // Safely destructure
       const currentUserId = user?._id; // Use user._id
       const currentSocketId = newSocket.id; // Capture socket ID
       console.log(`Comparing: Event[socketId=${socketId}, userId=${registeredUserId}] vs Client[socketId=${currentSocketId}, userId=${currentUserId}]`);
       const socketIdMatch = currentSocketId === socketId;
       const userIdMatch = currentUserId === registeredUserId; // Compare against user._id
       console.log(`Match results: socketIdMatch=${socketIdMatch}, userIdMatch=${userIdMatch}`);
       if (socketIdMatch && userIdMatch) { // Check if the event is for THIS client
          console.log(`Client registration confirmed for user ${registeredUserId}. Setting isRegistered=true.`);
          setIsRegistered(true); // Set state to true
          // Now request lobbies after registration is confirmed
          console.log('Emitting list-lobbies after registration.');
          newSocket.emit('list-lobbies');
       } else {
          console.log('Received client-registered event for a different client/user or mismatch. Ignoring.');
       }
    });

    newSocket.on('disconnect', (reason) => {
      console.log('Socket disconnected via context:', reason);
      startTransition(() => { // Wrap state updates
        setIsConnected(false);
        setIsRegistered(false); // Reset registration status
        setCurrentLobbyId(null);
        setLobbies([]);
        setChatMessages([]);
        setLobbyClients([]); // Clear clients on disconnect
        setSocketInstance(null);
      });
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error via context:', error);
      setIsConnected(false);
      setIsRegistered(false);
      setSocketInstance(null);
    });

    // --- Other Event Listeners ---
    newSocket.on('update-lobbies', (update) => {
      console.log('Received lobby update via context:', update);
      if (!update || !update.type) return;
      startTransition(() => { // Wrap setLobbies
        setLobbies(prevLobbies => {
          switch (update.type) {
            case 'list': return update.lobbies || [];
            case 'create': return (!update.lobby || prevLobbies.some(l => l._id === update.lobby._id)) ? prevLobbies : [...prevLobbies, update.lobby];
          case 'delete': return !update.lobbyId ? prevLobbies : prevLobbies.filter(l => l._id !== update.lobbyId);
          case 'update': return !update.lobby ? prevLobbies : prevLobbies.map(l => l._id === update.lobby._id ? update.lobby : l);
            default: console.warn('Unknown lobby update type:', update.type); return prevLobbies;
          }
        });
      });
       if (update.type === 'create' && update.lobby?.host?.socketId === newSocket?.id) {
          console.log(`Detected own lobby creation, setting currentLobbyId: ${update.lobby._id}`);
          startTransition(() => { // Wrap state updates
            setCurrentLobbyId(update.lobby._id);
            // Also set initial client list for the creator
            setLobbyClients(update.lobby.clients || []);
          });
       }
    });

    // Listen for client list updates
    newSocket.on('clients', ({ lobby, clients }) => {
      console.log(`Received client list for lobby ${lobby}:`, clients);
      startTransition(() => { // Wrap setLobbyClients
        // Update client list state
        setLobbyClients(clients || []);
      });
    });

    newSocket.on('lobby-error', (error) => { console.error('Lobby Error:', error.message); });
    newSocket.on('game-error', (error) => { console.error('Game Error:', error.message); });
    newSocket.on('chat', (messages) => { console.log('Received chat update:', messages); setChatMessages(messages); });

  }, [user]); // Depend on user

  useEffect(() => {
    console.log('[MultiplayerProvider useEffect] Running effect. User:', user, 'SocketInstance:', socketInstance); // Log inputs
    // Only attempt connection if user is loaded AND logged in, and not already connected
    // Use user._id here as well
    if (user?.isLoggedIn && user._id && user.username && !socketInstance) {
      console.log("[MultiplayerProvider useEffect] Condition met: User logged in, has _id, no socket instance. Calling connectSocket().");
      connectSocket();
    } else if (!user) {
       console.log("[MultiplayerProvider useEffect] Condition NOT met: User data not yet loaded.");
    } else if (!user.isLoggedIn) {
       console.log("[MultiplayerProvider useEffect] Condition NOT met: User is not logged in.");
       // Clear any potentially stale connection state if user logs out
       if (isConnected || isRegistered || socketInstance) {
          console.log("[MultiplayerProvider useEffect] Cleaning up state due to user logout.");
          setIsConnected(false);
          setIsRegistered(false);
          socketInstance?.disconnect(); // Attempt disconnect if instance exists
          setSocketInstance(null);
       }
    } else if (socketInstance) {
        console.log("[MultiplayerProvider useEffect] Condition NOT met: Socket instance already exists.");
    } else {
        // Log the specific reason more clearly
        console.log("[MultiplayerProvider useEffect] Condition NOT met: Other reason.", {isLoggedIn: user?.isLoggedIn, has_Id: !!user?._id, hasUsername: !!user?.username, hasSocket: !!socketInstance});
    }

    // Cleanup function: Remove listeners but DON'T disconnect the socket here.
    // The socket should persist as long as the provider is mounted at a high level.
    return () => {
      if (socketInstance) {
        console.log('Cleaning up socket listeners on provider unmount/re-render.');
        // Remove listeners added in connectSocket
        socketInstance.off('connect');
        socketInstance.off('disconnect');
        socketInstance.off('connect_error');
        socketInstance.off('client-registered');
        socketInstance.off('update-lobbies');
        socketInstance.off('clients');
        socketInstance.off('lobby-error');
        socketInstance.off('game-error');
        socketInstance.off('chat');
        // DO NOT DISCONNECT HERE: socketInstance.disconnect();
        // DO NOT NULLIFY INSTANCE HERE: setSocketInstance(null);
      }
    };
  }, [connectSocket, user, socketInstance]); // Dependencies seem correct

  // --- Actions ---
  const createLobby = useCallback((lobbySettings) => {
    // Check for registration before allowing action
    if (!socketInstance || !isConnected || !isRegistered) { console.error('Socket not connected or client not registered.'); return; }
    if (!user?.isLoggedIn) { console.error('User not logged in.'); return; }
    console.log('Emitting create-lobby via context:', lobbySettings);
    socketInstance.emit('create-lobby', lobbySettings);
  }, [user, socketInstance, isConnected, isRegistered]); // Add isRegistered dependency

  const joinLobby = useCallback((lobbyId) => {
    // Check for registration
    if (!socketInstance || !isConnected || !isRegistered) { console.error('Socket not connected or client not registered.'); return; }
    if (!user?.isLoggedIn) { console.error('User not logged in.'); return; }
    console.log(`Emitting join for lobby ${lobbyId} via context`);
    socketInstance.emit('join', { lobby: lobbyId, userId: user._id, username: user.username }); // Use user._id
    startTransition(() => { // Wrap state updates
      setCurrentLobbyId(lobbyId);
      setLobbyClients([]); // Clear old client list optimistically
    });
  }, [user, socketInstance, isConnected, isRegistered]); // Add isRegistered dependency

  const leaveLobby = useCallback(() => {
    // Registration check might not be strictly needed for leave, but connection is
    if (!socketInstance || !isConnected || !currentLobbyId) { console.error('Not connected or not in a lobby.'); return; }
    if (!user?.isLoggedIn) { console.error('User not logged in.'); return; }
    console.log(`Emitting leave for lobby ${currentLobbyId} via context`);
    socketInstance.emit('leave', { lobby: currentLobbyId, userId: user._id, username: user.username }); // Use user._id
    startTransition(() => { // Wrap state updates
      setCurrentLobbyId(null);
      setChatMessages([]);
      setLobbyClients([]); // Clear clients on leave
    });
  }, [currentLobbyId, user, socketInstance, isConnected]);

  const value = {
    lobbies,
    currentLobbyId,
    isConnected,
    isRegistered, // Expose registration status
    lobbyClients, // Expose client list
    createLobby,
    joinLobby,
    leaveLobby,
    _socket: socketInstance,
    chatMessages,
  };

   console.log('[MultiplayerProvider] Rendering State:', { isConnected, isRegistered, currentLobbyId, lobbiesCount: lobbies?.length ?? 'null', chatCount: chatMessages?.length ?? 'null', clientCount: lobbyClients?.length ?? 'null' });

  return (
    <MultiplayerContext.Provider value={value}>
      {children}
    </MultiplayerContext.Provider>
  );
};
