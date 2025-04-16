import React, { useState, useEffect, useCallback, useContext, createContext, startTransition, useRef } from 'react'; // Import startTransition, useRef
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
  const [globalUserCount, setGlobalUserCount] = useState(0); // State for global user count
  const prevIsLoggedInRef = useRef(user?.isLoggedIn); // Ref to track previous login state
  // REMOVE restoredGameState
  // const [restoredGameState, setRestoredGameState] = useState(null);

  // ADD gameState state here
  const [gameState, setGameState] = useState({
    isActive: false,
    settings: null,
    round: 0,
    artifact: null,
    scores: {},
    guesses: {},
    players: {},
    roundResults: null,
    finalScores: null,
    phase: 'lobby',
    error: null,
    gameHistory: [],
    playerStatuses: {},
    disconnectCountdown: null,
    isForfeitWin: false,
    gameEndedAcknowledged: false,
  });
  const countdownIntervalRef = useRef(null); // Move countdown ref here too

  // REMOVE clearRestoredGameState
  // const clearRestoredGameState = useCallback(() => { ... });

  // Move countdown clear helper here
  const clearCountdownInterval = useCallback(() => {
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
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
         // Handle anonymous user registration
         let anonymousId = sessionStorage.getItem('ag_anonymousUserId');
         if (!anonymousId) {
           anonymousId = `anonymous_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
           sessionStorage.setItem('ag_anonymousUserId', anonymousId);
         }
         console.warn("Registering anonymous client with ID:", anonymousId);
         newSocket.emit('register-client', { userId: anonymousId, username: anonymousId });
         // Note: isRegistered will be set to true in the 'client-registered' handler
      }
    });

    // Listen for registration confirmation
    newSocket.on('client-registered', (data) => {
       console.log('Received client-registered event:', data); // Log received data
       const { socketId, userId: registeredUserId } = data || {}; // Safely destructure
       const currentUserId = user?._id;
       const anonymousId = sessionStorage.getItem('ag_anonymousUserId'); // Get anonymous ID
       const currentSocketId = newSocket.id; // Capture socket ID

       console.log(`Comparing: Event[socketId=${socketId}, userId=${registeredUserId}] vs Client[socketId=${currentSocketId}, userId=${currentUserId}, anonId=${anonymousId}]`);
       const socketIdMatch = currentSocketId === socketId;
       // Check against logged-in user ID OR anonymous ID
       const userIdMatch = user?.isLoggedIn
         ? registeredUserId === currentUserId // Logged-in check
         : registeredUserId === anonymousId; // Anonymous check

       console.log(`Match results: socketIdMatch=${socketIdMatch}, userIdMatch=${userIdMatch}`);
       if (socketIdMatch && userIdMatch) { // Check if the event is for THIS client
          console.log(`Client registration confirmed for ${user?.isLoggedIn ? 'user' : 'anonymous client'} ${registeredUserId}. Setting isRegistered=true.`);
          setIsRegistered(true); // Set state to true

          // Request lobbies ONLY if logged in, otherwise join global chat
          if (user?.isLoggedIn) {
            console.log('Logged-in user registered. Emitting list-lobbies.');
            newSocket.emit('list-lobbies');
          } else {
            console.log('Anonymous client registered. Emitting join-global-chat.');
            newSocket.emit('join-global-chat');
          }
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
            // Ensure 'list' maps the inProgress field
            case 'list':
              return Array.isArray(update.lobbies) ? update.lobbies.map(lobby => ({
                ...lobby,
                inProgress: lobby.inProgress || false // Explicitly include and default to false
              })) : [];
            case 'create':
              // Ensure the new lobby object includes inProgress (should come from backend)
              return (!update.lobby || prevLobbies.some(l => l._id === update.lobby._id)) ? prevLobbies : [...prevLobbies, { ...update.lobby, inProgress: update.lobby.inProgress || false }];
            case 'delete':
              return !update.lobbyId ? prevLobbies : prevLobbies.filter(l => l._id !== update.lobbyId);
            case 'update':
              // Ensure the updated lobby object includes inProgress (should come from backend)
              return !update.lobby ? prevLobbies : prevLobbies.map(l => l._id === update.lobby._id ? { ...update.lobby, inProgress: update.lobby.inProgress || false } : l);
            default:
              console.warn('Unknown lobby update type:', update.type);
              return prevLobbies;
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

    // Listener for global user count updates
    newSocket.on('global-user-count-update', (count) => {
      console.log(`[Context] Received global user count: ${count}`);
      startTransition(() => { // Wrap state update
        setGlobalUserCount(count);
      });
    });

    // --- Game State Listeners (Moved from useMultiplayerGame) ---
    const handleGameStarted = ({ settings, players }) => {
      console.log('[Context] Game Started:', settings, players);
      const initialStatuses = {};
      if (players) {
        Object.keys(players).forEach(id => {
          initialStatuses[id] = players[id].status || 'active';
        });
      }
      startTransition(() => { // Wrap state update
        setGameState(prev => ({
          ...prev,
          isActive: true,
          settings: settings,
          players: players || {},
          playerStatuses: initialStatuses,
          phase: 'waiting-for-round',
          round: 0,
          scores: {},
          guesses: {},
          roundResults: null,
          finalScores: null,
          error: null,
          disconnectCountdown: null,
          isForfeitWin: false,
          gameHistory: [], // Reset history on new game
        }));
      });
      clearCountdownInterval();
      sessionStorage.setItem('ag_gameActive', 'true'); // Also update session storage
    };

    const handleNewRound = ({ round, artifact, scores, players }) => {
      console.log(`[Context] New Round ${round}:`, artifact);
      const updatedStatuses = {};
       if (players) {
         Object.keys(players).forEach(id => {
           updatedStatuses[id] = players[id].status || 'active';
         });
       }
       startTransition(() => { // Wrap state update
         setGameState(prev => ({
           ...prev,
           isActive: true,
           round: round,
           artifact: artifact,
           scores: scores || prev.scores,
           players: players || prev.players,
           playerStatuses: updatedStatuses,
           guesses: {}, // Reset guesses
           phase: 'guessing',
           roundResults: null,
           finalScores: null,
           error: null,
           disconnectCountdown: null,
           isForfeitWin: false,
         }));
       });
      clearCountdownInterval();
    };

    const handlePlayerGuessed = ({ guesses: updatedGuesses }) => {
        console.log('[Context] Player Guessed:', updatedGuesses);
        startTransition(() => { // Wrap state update
          setGameState(prev => ({
              ...prev,
              // Only update guesses if still in guessing phase (safety check)
              guesses: prev.phase === 'guessing' ? updatedGuesses : prev.guesses,
          }));
        });
    };

    const handleRoundSummary = (summary) => {
      console.log(`[Context] Round ${summary.round} Summary:`, summary);
       const updatedStatuses = { ...gameState.playerStatuses };
       if (summary.players) {
         Object.keys(summary.players).forEach(id => {
           updatedStatuses[id] = summary.players[id].status || 'active';
         });
       }
       startTransition(() => { // Wrap state update
         setGameState(prev => ({
           ...prev,
           scores: summary.scores,
           roundResults: summary,
           phase: 'round-summary',
           artifact: null, // Clear artifact during summary
           error: null,
           players: summary.players || prev.players,
           playerStatuses: updatedStatuses,
           disconnectCountdown: null,
           // Add summary to history
           gameHistory: [...prev.gameHistory, summary],
         }));
       });
      clearCountdownInterval();
    };

    const handleGameSummary = (summary) => {
      console.log('[Context] Game Summary:', summary);
      const finalStatuses = {};
       if (summary.players) {
         Object.keys(summary.players).forEach(id => {
           finalStatuses[id] = summary.players[id].status || 'active';
         });
       }
       startTransition(() => { // Wrap state update
         setGameState(prev => ({
           ...prev,
           isActive: false,
           finalScores: summary.finalScores,
           players: summary.players || prev.players,
           playerStatuses: finalStatuses,
           gameHistory: summary.gameHistory || prev.gameHistory, // Use history from summary if provided
           phase: 'game-summary',
           isForfeitWin: summary.forfeitWin || false,
           roundResults: null,
           artifact: null,
           guesses: {},
           error: null,
           disconnectCountdown: null,
           gameEndedAcknowledged: false, // Reset acknowledged flag
         }));
       });
      clearCountdownInterval();
      sessionStorage.removeItem('ag_gameActive'); // Clear session storage
    };

    const handleGameError = ({ message }) => {
      console.error('[Context] Received Game Error:', message);
      startTransition(() => { // Wrap state update
        setGameState(prev => ({ ...prev, error: message }));
      });
    };

    const handlePlayerDisconnected = ({ userId, username, countdownDuration }) => {
      console.log(`[Context] Player disconnected: ${username} (${userId}), countdown: ${countdownDuration}s`);
      startTransition(() => { // Wrap state update
        setGameState(prev => ({
          ...prev,
          playerStatuses: { ...prev.playerStatuses, [userId]: 'disconnected' },
          disconnectCountdown: { userId, username, remaining: countdownDuration }
        }));
      });

      clearCountdownInterval();
      countdownIntervalRef.current = setInterval(() => {
        startTransition(() => { // Wrap state update inside interval
          setGameState(prev => {
            if (!prev.disconnectCountdown || prev.disconnectCountdown.userId !== userId) {
              clearCountdownInterval();
              return prev;
            }
            const newRemaining = prev.disconnectCountdown.remaining - 1;
            return {
              ...prev,
              disconnectCountdown: { ...prev.disconnectCountdown, remaining: Math.max(0, newRemaining) }
            };
          });
        });
      }, 1000);
    };

    const handlePlayerReconnected = ({ userId }) => {
      console.log(`[Context] Player reconnected: ${userId}`);
      startTransition(() => { // Wrap state update
        setGameState(prev => {
          const newCountdown = prev.disconnectCountdown?.userId === userId ? null : prev.disconnectCountdown;
          if (prev.disconnectCountdown?.userId === userId) {
             clearCountdownInterval();
          }
          return {
            ...prev,
            playerStatuses: { ...prev.playerStatuses, [userId]: 'active' },
            disconnectCountdown: newCountdown
          };
        });
      });
    };

    const handlePlayerForfeited = ({ userId }) => {
      console.log(`[Context] Player forfeited: ${userId}`);
      startTransition(() => { // Wrap state update
        setGameState(prev => {
           const newCountdown = prev.disconnectCountdown?.userId === userId ? null : prev.disconnectCountdown;
           if (prev.disconnectCountdown?.userId === userId) {
              clearCountdownInterval();
           }
          return {
            ...prev,
            playerStatuses: { ...prev.playerStatuses, [userId]: 'forfeited' },
            disconnectCountdown: newCountdown
          };
        });
      });
    };

    // Register game listeners
    newSocket.on('game-started', handleGameStarted);
    newSocket.on('new-round', handleNewRound);
    newSocket.on('player-guessed', handlePlayerGuessed);
    newSocket.on('round-summary', handleRoundSummary);
    newSocket.on('game-summary', handleGameSummary);
    newSocket.on('game-error', handleGameError);
    newSocket.on('player-disconnected', handlePlayerDisconnected);
    newSocket.on('player-reconnected', handlePlayerReconnected);
    newSocket.on('player-forfeited', handlePlayerForfeited);
    // --- End Game State Listeners ---


    // --- Listener for Rejoin Success (Modified) ---
    newSocket.on('rejoin-successful', ({ lobbyId, gameState: receivedGameState }) => { // Rename to avoid conflict
      if (lobbyId && receivedGameState) {
        console.log(`[MultiplayerContext] Rejoin successful for lobby ${lobbyId}. Applying received game state directly.`);
        sessionStorage.setItem('ag_lobbyId', lobbyId);
        sessionStorage.setItem('ag_gameActive', 'true');

        // Directly set the context's game state - REMOVE startTransition for immediate update
        // startTransition(() => {
        setGameState(receivedGameState); // Apply the full state
        setChatMessages(receivedGameState.chatHistory || []); // Restore chat
        setCurrentLobbyId(lobbyId);
        // });
        console.log('[MultiplayerContext] Applied received game state directly (without startTransition).');
      } else {
        console.warn('[MultiplayerContext] Received rejoin-successful event without lobbyId or gameState.');
      }
    });
    // --- End Rejoin Success Listener ---

    // --- Listener for Join Success ---
    newSocket.on('join-successful', ({ lobbyId }) => {
      if (lobbyId) {
        console.log(`[MultiplayerContext] Join successful confirmation received for lobby ${lobbyId}.`);
        // Store lobby ID in session storage on successful join confirmation
        sessionStorage.setItem('ag_lobbyId', lobbyId);
        startTransition(() => { // Wrap state updates
          setCurrentLobbyId(lobbyId);
          setLobbyClients([]); // Clear old client list optimistically (will be updated by 'clients' event)
        });
      } else {
        console.warn('[MultiplayerContext] Received join-successful event without lobbyId.');
      }
    });
    // --- End Join Success Listener ---

  }, [user, clearCountdownInterval]); // Add clearCountdownInterval dependency

  useEffect(() => {
    console.log('[MultiplayerProvider useEffect] Running effect. User:', user, 'SocketInstance:', socketInstance, 'PrevLoggedIn:', prevIsLoggedInRef.current); // Log inputs

    // --- Handle Login Transition ---
    const justLoggedIn = user?.isLoggedIn && !prevIsLoggedInRef.current;
    if (justLoggedIn && socketInstance) {
      console.log('[MultiplayerProvider useEffect] User just logged in while connected anonymously. Disconnecting old socket...');
      socketInstance.disconnect();
      // Reset state immediately to allow reconnection logic to trigger
      startTransition(() => {
        setIsConnected(false);
        setIsRegistered(false);
        setSocketInstance(null);
        // Optionally reset other states like chat, lobbies if needed upon login
        setChatMessages([]);
        setLobbies([]);
        setCurrentLobbyId(null);
        setLobbyClients([]);
      });
      // Update ref *after* potential disconnect logic
      prevIsLoggedInRef.current = user?.isLoggedIn;
      return; // Exit effect early to allow state update and re-run for connection
    }
    // --- End Handle Login Transition ---


    // Attempt connection if user data is loaded and not already connected
    // connectSocket will handle logged-in vs anonymous registration
    if (user && !socketInstance) {
      console.log(`[MultiplayerProvider useEffect] User data loaded, no socket instance.`);
       console.log("[MultiplayerProvider useEffect] Condition met: User data loaded, no socket instance. Calling connectSocket().");
       // No need to pass lobbyId here, backend handles rejoin on 'register-client'
       connectSocket();
     } else if (!user) {
        console.log("[MultiplayerProvider useEffect] Condition NOT met: User data not yet loaded.");
     // Removed the `else if (!user.isLoggedIn)` block that caused disconnects for anonymous users.
     // The socket's 'disconnect' event handler and the effect cleanup will handle state resets.
     } else if (socketInstance) {
         console.log("[MultiplayerProvider useEffect] Condition NOT met: Socket instance already exists.");
     } else {
        // Log the specific reason more clearly
         console.log("[MultiplayerProvider useEffect] Condition NOT met: Other reason.", {isLoggedIn: user?.isLoggedIn, has_Id: !!user?._id, hasUsername: !!user?.username, hasSocket: !!socketInstance});
     }

    // Update ref at the end of the effect run
    prevIsLoggedInRef.current = user?.isLoggedIn;

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
        // Add cleanup for game listeners
        socketInstance.off('game-started');
        socketInstance.off('new-round');
        socketInstance.off('player-guessed');
        socketInstance.off('round-summary');
        socketInstance.off('game-summary');
        socketInstance.off('player-disconnected');
        socketInstance.off('player-reconnected');
        socketInstance.off('player-forfeited');
    socketInstance.off('rejoin-successful'); // Cleanup rejoin listener
    socketInstance.off('join-successful'); // Cleanup join listener
    // Clear interval on cleanup
    clearCountdownInterval();
    // DO NOT DISCONNECT HERE: socketInstance.disconnect();
    // DO NOT NULLIFY INSTANCE HERE: setSocketInstance(null);
  }
};
  }, [connectSocket, user, socketInstance, clearCountdownInterval]); // Add clearCountdownInterval

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
    // DO NOT set currentLobbyId or session storage here optimistically. Wait for 'join-successful' event.
    socketInstance.emit('join', { lobby: lobbyId, userId: user._id, username: user.username }); // Use user._id
    // Optimistically clear clients? Maybe not necessary as 'clients' event will update.
    // startTransition(() => {
    //   setLobbyClients([]);
    // });
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

  // Action to acknowledge the game summary and return to lobby phase
  const acknowledgeGameSummary = useCallback(() => {
    startTransition(() => { // Wrap state update
      setGameState(prev => {
        if (prev.phase === 'game-summary') {
          console.log('[Context] Game summary acknowledged. Transitioning to lobby phase.');
          return { ...prev, phase: 'lobby', gameEndedAcknowledged: true }; // Transition phase
        }
        return prev; // No change if not in game-summary phase
      });
    });
  }, []); // No dependencies needed as it only uses setGameState

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
    globalUserCount, // Expose global user count
    // Provide gameState directly
    gameState,
    acknowledgeGameSummary, // Expose the new action
    // REMOVE restoredGameState and clearRestoredGameState
  };

   console.log('[MultiplayerProvider] Rendering State:', { isConnected, isRegistered, currentLobbyId, gamePhase: gameState.phase, lobbiesCount: lobbies?.length ?? 'null', chatCount: chatMessages?.length ?? 'null', clientCount: lobbyClients?.length ?? 'null' });

  return (
    <MultiplayerContext.Provider value={value}>
      {children}
    </MultiplayerContext.Provider>
  );
};
