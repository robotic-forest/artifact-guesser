import { createContext, useCallback, useContext, useEffect, useState, useRef } from "react" // Added useRef
import useUser from "../../hooks/useUser"
import axios from "axios"
import { convertCountries } from "@/lib/artifactUtils"
import { countries } from "@/lib/countries"
import { getProximity } from "@/lib/getProximity"
import useSWR from "swr"
import { useHotkeys } from "react-hotkeys-hook"
import toast from "react-hot-toast"
import { modes } from "../gameui/ModeButton"
import { generateInsult } from "@/hooks/useInsult"
import AAAAAA from "../art/AAAAAA"

const GameContext = createContext(null)

export const useGame = () => {
  const context = useContext(GameContext)
  if (!context) {
    return { game: null, currentRound: null, updateGame: null }
  }
  return context
}

export const GameProvider = ({ children }) => {
  const { user } = useUser()
  const [game, setGame] = useState()
  const [selectedDate, setSelectedDate] = useState()
  const [selectedCountry, setSelectedCountry] = useState()
  const [loading, setLoading] = useState(true)
  const [selectedTimer, setSelectedTimer] = useState(null); // Default: No timer
  const [countdown, setCountdown] = useState(null);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [imagesReadyForTimer, setImagesReadyForTimer] = useState(false); // New state for image readiness
  const timerIntervalRef = useRef(null); // Ref to store interval ID

  const { data, mutate } = useSWR(user?.isLoggedIn && '/api/games/current')

  const initGame = g => {
    setGame(g);
    setSelectedDate(g.roundData[g.round - 1].selectedDate || modes[g.mode]?.type === 'Era' ? ((modes[g.mode].start + modes[g.mode].end) / 2) : 0);
    setSelectedCountry(g.roundData[g.round - 1].selectedCountry || null);
    // Initialize selectedTimer from game data if available, else default null
    setSelectedTimer(g.selectedTimer !== undefined ? g.selectedTimer : null);
    // Reset timer and image readiness state for the new/loaded game
    setIsTimerActive(false);
    setImagesReadyForTimer(false); // Reset image readiness
    setCountdown(g.selectedTimer);
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  }

  // Sync with DB
  useEffect(() => { if (data) initGame(data) }, [data])

  // Reset game if logged out mid-game
  useEffect(() => {
    if (game?._id && user && !user?.isLoggedIn) {
      setGame(null)
    }
  }, [user])

  // if not logged in, get from localStorage, otherwise initialize game
  useEffect(() => {
    const localGame = async () => {
      if (user && !user?.isLoggedIn) {
        // Attempt fetch from localstorage
        const localG = JSON.parse(localStorage.getItem('game'))

        if (localG) initGame(localG)
        else {
          const lsMode = localStorage.getItem('mode') || 'Balanced';
          const lsTimer = localStorage.getItem('timer'); // Get timer from localStorage
          const newMode = lsMode;
          const newTimer = lsTimer !== null && lsTimer !== 'null' ? parseInt(lsTimer, 10) : null; // Parse timer, default null

          const newArtifact = await getRandomArtifact(null, newMode)
          const newGame = {
            startedAt: new Date(),
            round: 1,
            rounds: 5,
            score: 0,
            mode: newMode,
            selectedTimer: newTimer, // Store selected timer
            roundData: [
              {
                round: 1,
                artifactId: newArtifact._id,
                artifact: newArtifact,
                guessed: false
              }
            ]
          }

          setGame(newGame)
          setSelectedDate(modes[newMode]?.type === 'Era' ? ((modes[newMode].start + modes[newMode].end) / 2) : 0)
          // sync localstorage
          localStorage.setItem('game', JSON.stringify(newGame));
          setSelectedTimer(newTimer); // Update state as well
        }
      }
    }

    !game && localGame()
  }, [user, game]) // Removed 'selectedTimer' from dependency array to avoid loop

  const updateGame = async (updatedGame, startNew, newGameSettings) => {
    // Always update local state immediately for responsiveness
    setGame(updatedGame);

    if (user?.isLoggedIn) {
      // Include newMode and newTimer if provided in newGameSettings
      const dbGame = { ...updatedGame, ...newGameSettings };
      await axios.post('/api/games/edit', dbGame);
      if (startNew) {
        await mutate(); // Refetch game data after starting anew
      }
    } else {
      // Handle local storage for non-logged-in users
      if (startNew) {
        localStorage.removeItem('game');
        if (newGameSettings?.newMode) localStorage.setItem('mode', newGameSettings.newMode);
        // Persist timer setting for non-logged-in users when starting new game
        if (newGameSettings?.newTimer !== undefined) localStorage.setItem('timer', newGameSettings.newTimer);
        else localStorage.removeItem('timer'); // Clear if not set
        setGame(null); // Reset local state for new game
        setSelectedTimer(newGameSettings?.newTimer !== undefined ? newGameSettings.newTimer : null); // Update timer state
      } else {
        // Update existing game in local storage
        localStorage.setItem('game', JSON.stringify(updatedGame));
      }
    }
  };


    // --- Timer Logic ---

    useEffect(() => {
      // Clear any existing interval when dependencies change
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }

      const currentRoundData = game?.roundData?.find(r => r.round === game.round);
      const timerDuration = game?.selectedTimer; // Use timer from game state

      // Conditions to start the timer:
      // 1. Timer duration is set (not null)
      // 2. Game is loaded (not loading)
      // 3. Current round exists and is not guessed/timedOut
      // 4. Timer is not already active (prevent multiple intervals)
      // 5. Images are ready (for timed mode)
      const shouldStartTimer = timerDuration !== null &&
                               !loading && // Still useful for initial game load
                               currentRoundData &&
                               !currentRoundData.guessed &&
                               !currentRoundData.timedOut &&
                               !isTimerActive &&
                               imagesReadyForTimer; // <-- New condition

      if (shouldStartTimer) {
        console.log(`[Timer] Starting timer for round ${game.round}. Duration: ${timerDuration}s. Images ready.`);
        setCountdown(timerDuration); // Initialize countdown
        setIsTimerActive(true);

        timerIntervalRef.current = setInterval(() => {
          setCountdown(prevCountdown => {
            if (prevCountdown === null || prevCountdown <= 1) {
              clearInterval(timerIntervalRef.current);
              timerIntervalRef.current = null;
              setIsTimerActive(false);
              console.log(`[Timer] Timeout for round ${game.round}`);
              handleTimeout(); // Handle timeout
              return 0;
            }
            return prevCountdown - 1;
          });
        }, 1000);
      } else {
         // Ensure timer is marked as inactive if conditions aren't met
         if (isTimerActive) {
            console.log("[Timer] Conditions not met or round ended, ensuring timer is inactive.");
            setIsTimerActive(false);
         }
      }

      // Cleanup function to clear interval on component unmount or before effect re-runs
      return () => {
        if (timerIntervalRef.current) {
          clearInterval(timerIntervalRef.current);
          timerIntervalRef.current = null;
          console.log("[Timer] Cleanup: Interval cleared.");
        }
      };
      // Dependencies: game round, loading state, guessed status, selectedTimer from game state, AND image readiness
    }, [game?.round, game?.selectedTimer, loading, game?.roundData, imagesReadyForTimer]); // Added imagesReadyForTimer


  // --- End Timer Logic ---


  // random useful variables
  const currentRound = game?.roundData?.find(r => r.round === game.round);
  const artifact = currentRound?.artifact;
  const guessed = currentRound?.guessed;
  const timedOut = currentRound?.timedOut; // Check for timeout status
  const modeInfo = modes[game?.mode];

  const makeGuess = () => {
    // Stop the timer if it's active
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
      setIsTimerActive(false);
      console.log("[Timer] Guess made, interval cleared.");
    }

    if (!selectedCountry) return toast.error('You have to select a country!');
    // Date stuff
    const dateIsCorrect = artifact?.time.start <= selectedDate && artifact?.time.end >= selectedDate;
    const distanceToDate = Math.min(Math.abs(artifact?.time.start - selectedDate), Math.abs(artifact?.time.end - selectedDate))
    const datePoints = dateIsCorrect ? 100 : Math.round(distanceToDate > 300 ? 0 : 100 - (distanceToDate / 3))

    // Country stuff
    const artifactCountry = convertCountries(countries.find(c => artifact?.location.country.includes(c)) || artifact?.location.country)
    const countryIsCorrect = artifactCountry === selectedCountry

    // If country is not correct,
    // calculate distance between chosen country centroid and the correct centroid
    let countryPoints = countryIsCorrect ? 100 : 0
    if (!countryIsCorrect) {
      const { distance, isNeighbor, couldNotResolve } = getProximity(selectedCountry, artifactCountry)
      const distanceScore = couldNotResolve ? 0 : Math.round(distance > 1000 ? 0 : 100 - distance / 10)
      countryPoints = isNeighbor ? Math.max(50, distanceScore) : distanceScore;
    }

    const points = datePoints + countryPoints;

    const newGame = { ...game };
    newGame.roundData[game.round - 1] = {
      ...newGame.roundData[game.round - 1],
      guessed: true, // Mark as guessed
      timedOut: false, // Ensure timedOut is false if guessed manually
      selectedDate: Number(selectedDate),
      selectedCountry,
      dateIsCorrect,
      distanceToDate,
      datePoints,
      countryPoints,
      points,
      loading // Keep original loading state if needed, though timer handles its own loading aspect
    };

    newGame.score += points;

    updateGame(newGame); // Update game state
  };

  const handleTimeout = () => {
    // Ensure this runs only once per round timeout
    const currentRoundIndex = game.round - 1;
    if (game.roundData[currentRoundIndex]?.guessed || game.roundData[currentRoundIndex]?.timedOut) {
      console.log("[Timer] Round already guessed or timed out. Skipping timeout logic.");
      return;
    }

    console.log(`[GameProvider] Handling timeout for round ${game.round}`);
    toast.error("Time's up! 0 points for this round.", { icon: '⏰' });

    const newGame = { ...game };
    newGame.roundData[currentRoundIndex] = {
      ...newGame.roundData[currentRoundIndex],
      guessed: false, // Not technically guessed by user
      timedOut: true, // Mark as timed out
      selectedDate: null, // Or keep the last selected? Null seems better.
      selectedCountry: null,
      datePoints: 0,
      countryPoints: 0,
      points: 0,
    };

    // No score change for timeout
    // newGame.score += 0;

    updateGame(newGame); // Update game state
    // Note: The UI (Game.js) should react to 'timedOut' state to show the summary/next button.
  };


  const startNextRound = async () => {
    if (game.round === game.rounds) return;
    setLoading(true);
    setImagesReadyForTimer(false); // Reset image readiness for next round
    setIsTimerActive(false); // Ensure timer is inactive before loading next round
    if (timerIntervalRef.current) { // Clear any lingering interval
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    setSelectedCountry(null);
    setSelectedDate(modeInfo?.type === 'Era' ? ((modeInfo.start + modeInfo.end) / 2) : 0);
    setCountdown(game.selectedTimer); // Reset countdown for the next round based on game setting

    const newArtifact = await getRandomArtifact(game, game.mode);
    const newGame = {
      ...game,
      round: game.round + 1,
      roundData: [
        ...game.roundData,
        {
          round: game.round + 1,
          artifactId: newArtifact._id,
          artifact: newArtifact,
          guessed: false,
          timedOut: false // Reset timedOut status for the new round
        }
      ]
    };

    updateGame(newGame);
  };

  // Modified to accept timer setting
  const startNewGame = ({ mode, timer }) => {
    setLoading(true);
    setIsTimerActive(false); // Ensure timer is off
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    setSelectedCountry(null);
    setSelectedDate(modes[mode]?.type === 'Era' ? ((modes[mode].start + modes[mode].end) / 2) : 0);
    setSelectedTimer(timer); // Update the timer state for the new game
    setCountdown(timer); // Reset countdown display
    setImagesReadyForTimer(false); // Reset image readiness for new game

    // Pass mode and timer in the newGameSettings object
    updateGame({ ...game, ongoing: false }, true, { newMode: mode, newTimer: timer });
  };

  // Function to be called from GameSummary to set the timer for the *next* game
  const handleSetSelectedTimer = (timerValue) => {
      setSelectedTimer(timerValue);
      // Persist choice for non-logged-in users immediately for next game start
      if (user && !user.isLoggedIn) {
          localStorage.setItem('timer', timerValue);
      }
      // For logged-in users, the timer setting will be saved when startNewGame is called.
  };


  const isViewingSummary = game?.isViewingSummary;
  const viewSummary = () => {
    // Clear timer when viewing summary
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    setIsTimerActive(false);

    if (!user.isLoggedIn) axios.post('/api/games/noauth/log');
    updateGame({ ...game, isViewingSummary: true });
  };

  const handleArtifactLoadError = async () => {
    console.error("Error loading artifact image, fetching a new one.");
    // No need to manually clear timer here, the loading state change should handle it via useEffect
    setLoading(true);
    const newArtifact = await getRandomArtifact(game, game.mode)
    const newGame = {
      ...game,
      roundData: game.roundData.map((round, i) => {
        if (i === game.round - 1) {
          return {
            ...round,
            artifactId: newArtifact._id,
            artifact: newArtifact
          }
        }
        return round
      })
    }

    // Mark artifact as problematic, so it won't be shown again
    // this is cuasing alot of false positives
    // await axios.post(`/api/artifacts/${artifact._id}/edit`, { problematic: true, problem: 'no image' })

    updateGame(newGame)
  }

  const nextStepKey = useCallback(() => {
    const isLastRound = game?.round === game?.rounds;
    const currentRoundData = game?.roundData?.find(r => r.round === game.round);
    const isGuessedOrTimedOut = currentRoundData?.guessed || currentRoundData?.timedOut;

    if (isGuessedOrTimedOut) {
      if (isLastRound) {
        // On summary screen, Enter/Space starts a new game with current settings
        if (isViewingSummary) startNewGame({ mode: game.mode, timer: game.selectedTimer });
        else viewSummary(); // Show summary after last round guess/timeout
      } else {
        startNextRound(); // Start next round if not the last one
      }
    } else {
      makeGuess(); // Make guess if not already guessed or timed out
    }
  }, [
    game,
    game, // Full game state needed for mode/timer on new game start
    makeGuess,
    startNextRound,
    isViewingSummary,
    viewSummary,
    startNewGame // startNewGame now uses game state for settings
  ]);

  useHotkeys(
    ['enter', 'space'],
    e => {
      e.preventDefault()
      nextStepKey()
    },
    { filter: () => true },
    [nextStepKey]
  )

  return (
    <GameContext.Provider value={{
      game,
      currentRound,
      selectedDate,
      setSelectedDate,
      selectedCountry,
      setSelectedCountry,
      artifact,
      guessed, // Keep original guessed state if needed elsewhere
      timedOut, // Expose timedOut status
      makeGuess,
      startNextRound,
      startNewGame, // Updated startNewGame
      loading,
      setLoading, // Keep setLoading if used by Game.js for image loading
      viewSummary,
      isViewingSummary,
      nextStepKey,
      handleArtifactLoadError,
      // Timer related context values
      selectedTimer, // The setting for the *next* game
      handleSetSelectedTimer, // Function to set the timer for the next game
      countdown, // Current countdown value
      isTimerActive, // Boolean indicating if timer is running
      // Image readiness state and setter
      imagesReadyForTimer,
      setImagesReadyForTimer
    }}>
      {children}
    </GameContext.Provider>
  )
}

// utils

const getRandomArtifact = async (game, mode) => {
  const pickNew = Math.random() > 0.5
  const { data: newArtifact } = await axios.get(`/api/artifacts/random?mode=${mode || 'Balanced'}`)

  if (game) {
    const existingCountries = game.roundData.map(r => r.artifact.location.country)
    if (existingCountries.includes(newArtifact.location.country) && pickNew) {
      return getRandomArtifact(null, mode)
    }
  }

  return newArtifact
}
