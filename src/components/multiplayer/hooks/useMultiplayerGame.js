import { useState, useEffect, useCallback } from 'react';
import useUser from '@/hooks/useUser';

// Hook to manage multiplayer game state based on socket events
export const useMultiplayerGame = (socket, lobbyId) => {
  const { user } = useUser();
  const [gameState, setGameState] = useState({
    isActive: false, // Is a game currently running in this lobby?
    settings: null, // { mode, rounds }
    round: 0,
    artifact: null, // Current artifact data (client-safe version)
    scores: {}, // { userId: score }
    guesses: {}, // { userId: { date, country, timestamp } } - Added
    players: {}, // { userId: { username, ... } } - Added
    roundResults: null, // Results from the last completed round
    finalScores: null, // Final scores when game ends
    phase: 'lobby', // 'lobby', 'guessing', 'round-summary', 'game-summary'
    error: null,
  });

  // Listen for game events
  useEffect(() => {
    if (!socket || !lobbyId) {
      // Reset game state if socket disconnects or user leaves lobby
      setGameState({ isActive: false, settings: null, round: 0, artifact: null, scores: {}, guesses: {}, players: {}, roundResults: null, finalScores: null, phase: 'lobby', error: null }); // Added reset for guesses, players
      return;
    }

    // Assume 'game-started' provides the initial player list
    const handleGameStarted = ({ settings, players }) => {
      console.log('Game Started:', settings, players);
      setGameState(prev => ({
        ...prev,
        isActive: true,
        settings: settings,
        players: players || {}, // Initialize players
        phase: 'waiting-for-round', // Wait for the first 'new-round'
        round: 0, // Reset round, will be set by new-round
        scores: {}, // Reset scores
        guesses: {}, // Reset guesses
        roundResults: null,
        finalScores: null,
        error: null,
      }));
    };

    // Assume 'new-round' might also update players if someone joined/left between rounds
    const handleNewRound = ({ round, artifact, scores, players }) => {
      console.log(`New Round ${round}:`, artifact);
      setGameState(prev => ({
        ...prev,
        isActive: true, // Ensure active
        round: round,
        artifact: artifact, // This is the client-safe version
        scores: scores || prev.scores, // Update scores (especially for round 1)
        players: players || prev.players, // Update players if provided
        guesses: {}, // Reset guesses for the new round
        phase: 'guessing',
        roundResults: null, // Clear previous round results
        finalScores: null,
        error: null,
      }));
    };

    // Listen for updates to the guesses object during the round
    const handlePlayerGuessed = ({ guesses: updatedGuesses }) => {
        setGameState(prev => ({
            ...prev,
            // Only update if we are in the guessing phase
            guesses: prev.phase === 'guessing' ? updatedGuesses : prev.guesses,
        }));
    };

    const handleRoundSummary = (summary) => {
      console.log(`Round ${summary.round} Summary:`, summary);
      setGameState(prev => ({
        ...prev,
        scores: summary.scores, // Update with latest scores
        roundResults: summary, // Store { round, correctArtifact, results, scores }
        phase: 'round-summary',
        artifact: null, // Clear current artifact view while showing summary
        error: null,
        // Guesses are implicitly finalized here by the summary data
      }));
      // TODO: Potentially add a timer to automatically move to next round?
    };

    const handleGameSummary = (summary) => { // summary now includes { finalScores, settings, players }
      console.log('Game Summary:', summary);
      setGameState(prev => ({
        ...prev,
        isActive: false, // Game is no longer active
        finalScores: summary.finalScores,
        players: summary.players || prev.players, // Store players data
        phase: 'game-summary',
        roundResults: null,
        artifact: null,
        guesses: {}, // Clear guesses
        error: null,
      }));
      // TODO: Add button or logic to return to lobby view?
    };

    const handleGameError = ({ message }) => {
      console.error('Received Game Error:', message);
      setGameState(prev => ({
        ...prev,
        error: message,
        // Potentially reset phase or isActive depending on error type
      }));
      // TODO: Show error to user (toast?)
    };

    // Register listeners
    socket.on('game-started', handleGameStarted);
    socket.on('new-round', handleNewRound);
    socket.on('player-guessed', handlePlayerGuessed); // Add listener for guess updates
    socket.on('round-summary', handleRoundSummary);
    socket.on('game-summary', handleGameSummary);
    socket.on('game-error', handleGameError);

    // Cleanup listeners
    return () => {
      socket.off('game-started', handleGameStarted);
      socket.off('new-round', handleNewRound);
      socket.off('player-guessed', handlePlayerGuessed); // Clean up listener
      socket.off('round-summary', handleRoundSummary);
      socket.off('game-summary', handleGameSummary);
      socket.off('game-error', handleGameError);
    };

  }, [socket, lobbyId]);

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
        // Logic to return to lobby view? This might involve state outside this hook.
         console.log("Returning to lobby view");
         // Reset game state more completely
         setGameState(prev => ({
           ...prev,
           isActive: false, // Explicitly set game as inactive
           phase: 'lobby',
           finalScores: null,
           roundResults: null,
           artifact: null,
           guesses: {}, // Clear guesses too
           // Keep players and settings? Or reset? Let's keep them for now.
         }));
      }
      // If phase is 'round-summary', backend handles next round automatically.
  }, [gameState.phase]);


  return {
    gameState,
    submitGuess,
    proceedAfterSummary,
  };
};
