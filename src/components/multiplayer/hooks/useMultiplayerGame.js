import { useState, useEffect, useCallback, useRef } from 'react';
import useUser from '@/hooks/useUser';
import { useMultiplayer } from '../context/MultiplayerContext'; // Import context hook

// Hook to manage multiplayer game state based on socket events
export const useMultiplayerGame = (socket, lobbyId) => { // socket and lobbyId are passed from Multiplayer component
  const { user } = useUser();
  // Get restored state and clear function from context
  const { restoredGameState, clearRestoredGameState } = useMultiplayer(); // Get clear function
  const countdownIntervalRef = useRef(null);
  const appliedRestoredStateRef = useRef(false); // Flag to ensure restore happens only once

  // Initialize state with default values ALWAYS.
  const [gameState, setGameState] = useState({
    isActive: false, // Is a game currently running in this lobby?
    settings: null, // { mode, rounds }
    round: 0,
    artifact: null, // Current artifact data (client-safe version)
    scores: {}, // { userId: score }
    guesses: {}, // { userId: { date, country, timestamp } }
    players: {}, // { userId: { username, status } } - Now includes status
    roundResults: null, // Results from the last completed round
    finalScores: null, // Final scores when game ends
    phase: 'lobby', // 'lobby', 'waiting-for-round', 'guessing', 'round-summary', 'game-summary'
    error: null,
    gameHistory: [],
    // New state for disconnect/forfeit
    playerStatuses: {}, // { userId: 'active' | 'disconnected' | 'forfeited' } - More explicit status tracking
    disconnectCountdown: null, // { userId, username, remaining: number } | null
    isForfeitWin: false,
    gameEndedAcknowledged: false, // NEW: Flag to track if user clicked "Return to Lobby"
  });

  // Clear countdown interval helper
  const clearCountdownInterval = useCallback(() => {
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
  }, []);

  // Effect to apply restoredGameState from context ONLY ONCE if available on mount/initialization
  useEffect(() => {
    // Check if restoredGameState exists, we haven't applied it yet, AND it pertains to the current user
    if (restoredGameState && !appliedRestoredStateRef.current && user?._id && restoredGameState.players?.[user._id]) {
      console.log(`[useMultiplayerGame] Applying restored game state for user ${user._id}:`, restoredGameState);
      // Apply the restored state to this hook's state
      setGameState(restoredGameState);
      // Mark that we've applied it for this instance
      appliedRestoredStateRef.current = true;
      // Immediately clear the restored state from the context
      clearRestoredGameState();
      console.log("[useMultiplayerGame] Cleared restored game state from context.");
    } else if (restoredGameState && !appliedRestoredStateRef.current) {
      // Log if the state exists but doesn't seem to be for this user
      console.log(`[useMultiplayerGame] Ignoring restored game state as it doesn't appear to be for user ${user?._id}. State players:`, restoredGameState.players);
    }
    // Dependencies ensure effect runs if state/clear function/user become available later,
    // but the ref and user check prevent incorrect application.
  }, [restoredGameState, clearRestoredGameState, user]); // Add user dependency

  // Listen for live game events from socket
  useEffect(() => {
    if (!socket || !lobbyId) {
      // Reset game state if socket disconnects or user leaves lobby
      setGameState({ isActive: false, settings: null, round: 0, artifact: null, scores: {}, guesses: {}, players: {}, roundResults: null, finalScores: null, phase: 'lobby', error: null, gameHistory: [], playerStatuses: {}, disconnectCountdown: null, isForfeitWin: false });
      clearCountdownInterval(); // Clear interval on disconnect/leave
      return;
    }

    // --- Event Handlers ---

    const handleGameStarted = ({ settings, players }) => {
      console.log('Game Started:', settings, players);
      const initialStatuses = {};
      if (players) {
        Object.keys(players).forEach(id => {
          initialStatuses[id] = players[id].status || 'active'; // Initialize status from backend data
        });
      }
      setGameState(prev => ({
        ...prev,
        isActive: true,
        settings: settings,
        players: players || {},
        playerStatuses: initialStatuses, // Initialize statuses
        phase: 'waiting-for-round',
        round: 0,
        scores: {},
        guesses: {},
        roundResults: null,
        finalScores: null,
        error: null,
        disconnectCountdown: null, // Reset countdown
        isForfeitWin: false,
      }));
      clearCountdownInterval(); // Clear any lingering interval
    };

    const handleNewRound = ({ round, artifact, scores, players }) => {
      console.log(`New Round ${round}:`, artifact);
      const updatedStatuses = {};
       if (players) {
         Object.keys(players).forEach(id => {
           updatedStatuses[id] = players[id].status || 'active'; // Update status from backend data
         });
       }
      setGameState(prev => ({
        ...prev,
        isActive: true,
        round: round,
        artifact: artifact,
        scores: scores || prev.scores,
        players: players || prev.players, // Update players object
        playerStatuses: updatedStatuses, // Update statuses
        guesses: {},
        phase: 'guessing',
        roundResults: null,
        finalScores: null,
        error: null,
        disconnectCountdown: null, // Reset countdown on new round
        isForfeitWin: false, // Reset forfeit win flag
      }));
      clearCountdownInterval(); // Clear interval on new round
    };

    const handlePlayerGuessed = ({ guesses: updatedGuesses }) => {
        setGameState(prev => ({
            ...prev,
            guesses: prev.phase === 'guessing' ? updatedGuesses : prev.guesses,
        }));
    };

    const handleRoundSummary = (summary) => {
      console.log(`Round ${summary.round} Summary:`, summary);
       // Update statuses based on the players object in the summary if available
       const updatedStatuses = { ...gameState.playerStatuses }; // Start with existing
       if (summary.players) {
         Object.keys(summary.players).forEach(id => {
           updatedStatuses[id] = summary.players[id].status || 'active';
         });
       }
      setGameState(prev => ({
        ...prev,
        scores: summary.scores,
        roundResults: summary,
        phase: 'round-summary',
        artifact: null,
        error: null,
        players: summary.players || prev.players, // Update players if included
        playerStatuses: updatedStatuses, // Update statuses
        disconnectCountdown: null, // Clear countdown when summary appears
      }));
      clearCountdownInterval(); // Clear interval
    };

    const handleGameSummary = (summary) => { // summary includes { finalScores, settings, players, gameHistory, forfeitWin, winnerId }
      console.log('Game Summary:', summary);
      const finalStatuses = {};
       if (summary.players) {
         Object.keys(summary.players).forEach(id => {
           finalStatuses[id] = summary.players[id].status || 'active'; // Get final status
         });
       }
      setGameState(prev => ({
        ...prev,
        isActive: false,
        finalScores: summary.finalScores,
        players: summary.players || prev.players,
        playerStatuses: finalStatuses, // Set final statuses
        gameHistory: summary.gameHistory || [],
        phase: 'game-summary',
        isForfeitWin: summary.forfeitWin || false, // Set forfeit win flag
        roundResults: null,
        artifact: null,
        guesses: {},
        error: null,
        disconnectCountdown: null, // Clear countdown
      }));
      clearCountdownInterval(); // Clear interval
    };

    const handleGameError = ({ message }) => {
      console.error('Received Game Error:', message);
      setGameState(prev => ({ ...prev, error: message }));
      // Potentially clear countdown on error?
      // clearCountdownInterval();
      // setGameState(prev => ({ ...prev, disconnectCountdown: null }));
    };

    // --- New Event Handlers for Disconnect/Reconnect ---

    const handlePlayerDisconnected = ({ userId, username, countdownDuration }) => {
      console.log(`Player disconnected: ${username} (${userId}), countdown: ${countdownDuration}s`);
      setGameState(prev => ({
        ...prev,
        playerStatuses: { ...prev.playerStatuses, [userId]: 'disconnected' },
        disconnectCountdown: { userId, username, remaining: countdownDuration }
      }));

      // Start local interval timer for visual countdown
      clearCountdownInterval(); // Clear previous interval if any
      countdownIntervalRef.current = setInterval(() => {
        setGameState(prev => {
          if (!prev.disconnectCountdown || prev.disconnectCountdown.userId !== userId) {
            // Countdown target changed or cleared, stop interval
            clearCountdownInterval();
            return prev;
          }
          const newRemaining = prev.disconnectCountdown.remaining - 1;
          // Only update remaining time. Do not clear interval or state here.
          // Backend events ('player-reconnected', 'player-forfeited') will handle clearing.
          // Ensure remaining doesn't go below 0 visually.
          return {
            ...prev,
            disconnectCountdown: { ...prev.disconnectCountdown, remaining: Math.max(0, newRemaining) }
          };
        });
      }, 1000);
    };

    const handlePlayerReconnected = ({ userId }) => {
      console.log(`Player reconnected: ${userId}`);
      setGameState(prev => {
        // Clear countdown only if it was for this user
        const newCountdown = prev.disconnectCountdown?.userId === userId ? null : prev.disconnectCountdown;
        if (prev.disconnectCountdown?.userId === userId) {
           clearCountdownInterval(); // Clear interval if it was for this user
        }
        return {
          ...prev,
          playerStatuses: { ...prev.playerStatuses, [userId]: 'active' },
          disconnectCountdown: newCountdown
        };
      });
    };

    const handlePlayerForfeited = ({ userId }) => {
      console.log(`Player forfeited: ${userId}`);
      setGameState(prev => {
         // Clear countdown only if it was for this user
         const newCountdown = prev.disconnectCountdown?.userId === userId ? null : prev.disconnectCountdown;
         if (prev.disconnectCountdown?.userId === userId) {
            clearCountdownInterval(); // Clear interval if it was for this user
         }
        return {
          ...prev,
          playerStatuses: { ...prev.playerStatuses, [userId]: 'forfeited' },
          disconnectCountdown: newCountdown
        };
      }); // Add missing closing brace and parenthesis for setGameState
    }; // Add missing closing brace for handlePlayerForfeited

    // Register listeners
    socket.on('game-started', handleGameStarted);
    socket.on('new-round', handleNewRound);
    socket.on('player-guessed', handlePlayerGuessed);
    socket.on('round-summary', handleRoundSummary);
    socket.on('game-summary', handleGameSummary);
    socket.on('game-error', handleGameError);
    // New listeners
    socket.on('player-disconnected', handlePlayerDisconnected);
    socket.on('player-reconnected', handlePlayerReconnected);
    socket.on('player-forfeited', handlePlayerForfeited);
    // Note: 'rejoin-successful' is handled by the context now to set initial state

    // Cleanup listeners
    return () => {
      socket.off('game-started', handleGameStarted);
      socket.off('new-round', handleNewRound);
      socket.off('player-guessed', handlePlayerGuessed);
      socket.off('round-summary', handleRoundSummary);
      socket.off('game-summary', handleGameSummary);
      socket.off('game-error', handleGameError);
      // New listeners cleanup
      socket.off('player-disconnected', handlePlayerDisconnected);
      socket.off('player-reconnected', handlePlayerReconnected);
      socket.off('player-forfeited', handlePlayerForfeited);
      // No need to cleanup 'rejoin-successful' here anymore
      // Clear interval on cleanup
      clearCountdownInterval();
    };
  // Only depend on socket, lobbyId, and clear function for setting up listeners
  }, [socket, lobbyId, clearCountdownInterval]);

  // Action to submit a guess
  const submitGuess = useCallback((guess) => { // guess = { date, country }
    if (!socket || !lobbyId || gameState.phase !== 'guessing') {
      console.error('Cannot submit guess: Socket not ready or not in guessing phase.');
      return;
    }
    if (!guess || guess.date === undefined || !guess.country) {
       console.error('Invalid guess format:', guess);
       // TODO: Provide user feedback
       return;
    }

    console.log(`Emitting submit-guess for lobby ${lobbyId}:`, guess);
    socket.emit('submit-guess', { lobbyId, guess });
    // Optionally update phase locally to 'waiting-for-results'?
    // setGameState(prev => ({ ...prev, phase: 'waiting-for-results' }));

  }, [socket, lobbyId, gameState.phase]);

  // Action to proceed after viewing summary (could trigger next round or return to lobby)
  // Note: Backend currently handles round progression automatically after summary.
  // This function might be needed if we add manual progression or returning to lobby.
  const proceedAfterSummary = useCallback(() => {
     if (gameState.phase === 'game-summary') {
        // User acknowledged the summary. Only set the flag. Keep phase and scores.
         console.log("Game summary acknowledged by user. Setting flag.");
         setGameState(prev => ({
           ...prev,
           gameEndedAcknowledged: true, // Set the flag
           // DO NOT clear finalScores or other state here. Let navigation handle unmounting.
         }));
      }
      // No action needed for 'round-summary' phase, backend handles it.
  }, [gameState.phase]); // Dependency remains gameState.phase


  return {
    gameState,
    submitGuess,
    proceedAfterSummary,
  };
};
