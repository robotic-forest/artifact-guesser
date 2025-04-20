import { useCallback } from 'react';
// Removed useState, useEffect, useRef
// Removed useUser (no longer needed here)
import { useMultiplayer } from '../context/MultiplayerContext'; // Import context hook

// Simplified hook to provide actions and consume centralized game state
export const useMultiplayerGame = (socket, lobbyId) => { // socket and lobbyId are still passed from Multiplayer component

  // Get gameState and acknowledgeGameSummary action from context
  const { gameState, acknowledgeGameSummary } = useMultiplayer();

  // REMOVED local gameState state
  // REMOVED countdownIntervalRef and clearCountdownInterval
  // REMOVED appliedRestoredStateRef
  // REMOVED useEffect for applying restored state
  // REMOVED useEffect for listening to game events (now handled in context)

  // Action to submit a guess (remains largely the same, uses props socket/lobbyId)
  const submitGuess = useCallback((guess) => { // guess = { date, country }
    if (!socket || !lobbyId || gameState.phase !== 'guessing') { // Check context's gameState phase
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
    // No local state update needed here

  }, [socket, lobbyId, gameState.phase]); // Depend on context's gameState phase

  // Action to proceed after viewing summary (remains largely the same)
  // Note: This function might need adjustment if the context needs to know about acknowledgment
  const proceedAfterSummary = useCallback(() => {
     if (gameState.phase === 'game-summary') {
        // This function might now need to interact with the context if the
        // 'gameEndedAcknowledged' flag needs to be managed centrally.
        // For now, we assume it's primarily for navigation triggering.
        // If the context needs this flag, we'd add a function to the context
        // Call the context action to transition the phase back to 'lobby'
        acknowledgeGameSummary();
      }
      // No action needed for 'round-summary' phase, backend handles it.
  }, [gameState.phase, acknowledgeGameSummary]); // Depend on context's gameState phase and the action


  // Return the gameState from context and the actions
  return {
    gameState, // Directly from context
    submitGuess,
    proceedAfterSummary,
  };
};
