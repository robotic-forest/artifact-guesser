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
  // Initialize currentLobbyId from session storage on mount
  const [currentLobbyId, setCurrentLobbyId] = useState(() => {
    if (typeof window !== 'undefined') { // Ensure sessionStorage is available
      return sessionStorage.getItem('ag_lobbyId');
    }
    return null;
  });
  const [isConnected, setIsConnected] = useState(false); // Start as false
  const [isRegistered, setIsRegistered] = useState(false); // New state for registration status
  const [chatMessages, setChatMessages] = useState([]);
  const [socketInstance, setSocketInstance] = useState(null);
  const [lobbyClients, setLobbyClients] = useState([]); // State for clients in the current lobby
  const [restoredGameState, setRestoredGameState] = useState(null); // State to hold game state on rejoin

  // Function to clear the restored state once consumed
  const clearRestoredGameState = useCallback(() => {
    console.log("[MultiplayerContext] Clearing restored game state.");
    setRestoredGameState(null);
  }, []);

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
      // Clear session storage on disconnect
      sessionStorage.removeItem('ag_lobbyId');
      sessionStorage.removeItem('ag_gameActive');
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
          const newLobbyId = update.lobby._id;
          console.log(`Detected own lobby creation, setting currentLobbyId: ${newLobbyId}`);
          // Store lobby ID in session storage on creation confirmation
          sessionStorage.setItem('ag_lobbyId', newLobbyId);
          startTransition(() => { // Wrap state updates
            setCurrentLobbyId(newLobbyId);
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

    // --- Listeners for Game Active State (Session Storage) ---
    newSocket.on('game-started', () => {
      console.log('[MultiplayerContext] Game started, setting ag_gameActive=true');
      sessionStorage.setItem('ag_gameActive', 'true');
    });

    newSocket.on('game-summary', () => {
      console.log('[MultiplayerContext] Game summary received, clearing ag_gameActive');
      sessionStorage.removeItem('ag_gameActive');
      // Also clear lobby ID as the game is over, returning to lobby list implicitly
      sessionStorage.removeItem('ag_lobbyId');
      // Reset currentLobbyId state as well
      startTransition(() => {
         setCurrentLobbyId(null);
      });
    });
    // --- End Game Active State Listeners ---

    // --- Listener for Rejoin Success ---
    // This updates the context's lobby ID, stores the restored game state, AND restores chat history
    newSocket.on('rejoin-successful', ({ lobbyId, gameState }) => { // Destructure gameState
      if (lobbyId && gameState) {
        console.log(`[MultiplayerContext] Rejoin successful for lobby ${lobbyId}. Storing restored state, chat history, and updating currentLobbyId.`);
        // Update session storage just in case it was missed (should be redundant but safe)
        sessionStorage.setItem('ag_lobbyId', lobbyId);
        sessionStorage.setItem('ag_gameActive', 'true'); // If rejoining, game must be active

        // Restore game state and chat history
        setRestoredGameState(gameState); // Store the received game state
        setChatMessages(gameState.chatHistory || []); // Restore chat history from gameState
        setCurrentLobbyId(lobbyId);     // Set the lobby ID to trigger UI switch
      } else {
        console.warn('[MultiplayerContext] Received rejoin-successful event without lobbyId or gameState.');
      }
    });
    // --- End Rejoin Success Listener ---


  }, [user]); // Depend on user

  useEffect(() => {
    console.log('[MultiplayerProvider useEffect] Running effect. User:', user, 'SocketInstance:', socketInstance); // Log inputs
    // Only attempt connection if user is loaded AND logged in, and not already connected
    // Use user._id here as well
    if (user?.isLoggedIn && user._id && user.username && !socketInstance) {
      // Check session storage *before* connecting
      const potentialLobbyId = sessionStorage.getItem('ag_lobbyId');
      console.log(`[MultiplayerProvider useEffect] Checking session storage: ag_lobbyId=${potentialLobbyId}`);
      console.log("[MultiplayerProvider useEffect] Condition met: User logged in, has _id, no socket instance. Calling connectSocket().");
      // No need to pass lobbyId here, backend handles rejoin on 'register-client'
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
        // Add cleanup for new listeners
        socketInstance.off('game-started');
        socketInstance.off('game-summary');
        socketInstance.off('rejoin-successful'); // Cleanup rejoin listener
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
    // Store lobby ID in session storage on join
    sessionStorage.setItem('ag_lobbyId', lobbyId);
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
    // Clear session storage on leave
    sessionStorage.removeItem('ag_lobbyId');
    sessionStorage.removeItem('ag_gameActive');
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
    // Expose restored state and clear function
    restoredGameState,
    clearRestoredGameState,
  };

   console.log('[MultiplayerProvider] Rendering State:', { isConnected, isRegistered, currentLobbyId, hasRestoredState: !!restoredGameState, lobbiesCount: lobbies?.length ?? 'null', chatCount: chatMessages?.length ?? 'null', clientCount: lobbyClients?.length ?? 'null' });

  return (
    <MultiplayerContext.Provider value={value}>
      {children}
    </MultiplayerContext.Provider>
  );
};
