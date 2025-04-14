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
    roundResults: null, // Results from the last completed round
    finalScores: null, // Final scores when game ends
    phase: 'lobby', // 'lobby', 'guessing', 'round-summary', 'game-summary'
    error: null,
  });

  // Listen for game events
  useEffect(() => {
    if (!socket || !lobbyId) {
      // Reset game state if socket disconnects or user leaves lobby
      setGameState({ isActive: false, settings: null, round: 0, artifact: null, scores: {}, roundResults: null, finalScores: null, phase: 'lobby', error: null });
      return;
    }

    const handleGameStarted = ({ settings }) => {
      console.log('Game Started:', settings);
      setGameState(prev => ({
        ...prev,
        isActive: true,
        settings: settings,
        phase: 'waiting-for-round', // Wait for the first 'new-round'
        round: 0, // Reset round, will be set by new-round
        scores: {}, // Reset scores
        roundResults: null,
        finalScores: null,
        error: null,
      }));
    };

    const handleNewRound = ({ round, artifact, scores }) => {
      console.log(`New Round ${round}:`, artifact);
      setGameState(prev => ({
        ...prev,
        isActive: true, // Ensure active
        round: round,
        artifact: artifact, // This is the client-safe version
        scores: scores || prev.scores, // Update scores (especially for round 1)
        phase: 'guessing',
        roundResults: null, // Clear previous round results
        finalScores: null,
        error: null,
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
      }));
      // TODO: Potentially add a timer to automatically move to next round?
    };

    const handleGameSummary = (summary) => {
      console.log('Game Summary:', summary);
      setGameState(prev => ({
        ...prev,
        isActive: false, // Game is no longer active
        finalScores: summary.finalScores,
        phase: 'game-summary',
        roundResults: null,
        artifact: null,
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
    socket.on('round-summary', handleRoundSummary);
    socket.on('game-summary', handleGameSummary);
    socket.on('game-error', handleGameError);

    // Cleanup listeners
    return () => {
      socket.off('game-started', handleGameStarted);
      socket.off('new-round', handleNewRound);
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
        console.log("Returning to lobby view (manual action needed)");
        // Reset state?
         setGameState(prev => ({ ...prev, phase: 'lobby', finalScores: null }));
     }
     // If phase is 'round-summary', backend handles next round automatically for now.
  }, [gameState.phase]);


  return {
    gameState,
    submitGuess,
    proceedAfterSummary,
  };
};
