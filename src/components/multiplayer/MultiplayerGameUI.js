import { useState, useEffect, useContext, useRef, useCallback } from "react"; // Import useContext, useRef
import { MapInteractionCSS } from 'react-map-interaction';
import { IoMdEye, IoMdTimer } from "react-icons/io"; // Add IoMdTimer
import { Range } from "@/components/form/FormRange";
import { Map } from "@/components/gameui/Map";
import toast from "react-hot-toast";
import { EditableDate } from "@/components/gameui/EditableDate";
import { GameInfo } from "../gameui/GameInfo"; // May need adaptation for MP scores
import { LoadingArtifact } from "../loading/LoadingArtifact";
import { GameButton } from "../buttons/GameButton";
// TODO: Adapt RoundSummary and GameSummary for multiplayer data structure
// import { RoundSummary } from "../gameui/RoundSummary/RoundSummary";
// import { GameSummary } from "../game/GameSummary";
import { IconButton } from "../buttons/IconButton";
import { BiMinus, BiPlus } from "react-icons/bi";
import { ImageView, defaultMapValue } from "../artifacts/Artifact";
import useMeasure from "react-use-measure";
import { modes } from "../gameui/ModeButton";
import { formatDate, formatLocation } from "@/lib/artifactUtils"; // Import formatters
import { MainHeader } from "../gameui/MainHeader"; // Added Header
import { AuthHeader } from "../layout/AuthHeader"; // Added Auth Header
import useUser from "@/hooks/useUser"; // Import useUser hook
import { Button } from "../buttons/Button";
import { FixedChat } from "./chat/FixedChat"; // Import FixedChat
import { theme, useTheme } from "@/pages/_app";
import { createStyles } from "../GlobalStyles";
import { IconGenerator } from "../art/IconGenerator";
import { useMultiplayer } from "./context/MultiplayerContext"
import { useRouter } from "next/router";
import Link from "next/link";

// --- Disconnect Countdown Banner ---
const DisconnectCountdownBanner = ({ countdownData }) => {
  if (!countdownData) return null;

  const { username, remaining } = countdownData;

  return (
    <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-center pointer-events-none">
      <div className="bg-yellow-500 text-black text-center p-1 text-sm">
        {username} has disconnected. Forfeiting in {remaining}s...
      </div>
    </div>
  );
};
// --- End Disconnect Countdown Banner ---


// --- Player Status Component ---
// Updated to use playerStatuses and show different colors
const PlayerStatusList = ({ players, guesses, playerStatuses }) => {
  if (!players) return null;
  const playerIds = Object.keys(players);

  return (
    <>
      {playerIds.map((playerId) => {
        const player = players[playerId];
        const status = playerStatuses?.[playerId] || player?.status || 'active'; // Default to active if status missing
        const hasGuessed = !!guesses?.[playerId];

        let bgColor = 'bg-black';
        let textColor = 'text-white';

        if (status === 'disconnected') {
          bgColor = 'bg-yellow-500';
          textColor = 'text-black';
        } else if (status === 'forfeited') {
          bgColor = 'bg-red-600';
          textColor = 'text-white';
        } else if (hasGuessed) { // Only check guess if active
          bgColor = 'bg-green-500';
          textColor = 'text-black';
        }
        // Default (active, not guessed) remains bg-black, text-white

        return (
          <div
            key={playerId}
            className={`inline-flex items-center p-1 px-2 m-1 rounded text-xs font-medium transition-colors duration-300 ease-in-out ${bgColor} ${textColor} border border-white/20`}
          >
            <IconGenerator className='mr-2' />
            {player?.username || 'Player'}
            {status === 'disconnected' && ' (Disconnected)'}
            {status === 'forfeited' && ' (Forfeited)'}
          </div>
        );
      })}
    </>
  );
};
// --- End Player Status Component ---


// Helper function for styling points
const getPointsClass = (points) => {
  if (points === 100) return 'text-green-400 font-bold';
  if (points >= 80) return 'text-yellow-400';
  return 'text-white'; // Default
};

// Simple status component - Styled to sit next to round indicator
const MultiplayerStatus = ({ message }) => {
  // Inline-block, padding, background, rounded text
  const styles = "inline-block text-white bg-black p-1 px-2 rounded text-sm mr-2"; // Changed bg-black/60 to bg-black

  return <div className={styles}>{message}</div>;
};

// Adapted Round Summary Component
const MultiplayerRoundSummary = ({ results /* Removed onProceed - handled by server timer */ }) => {
  const { round, correctArtifact, scores: overallScores, results: playerResults } = results;
  const [countdown, setCountdown] = useState(15); // Countdown state - Updated to 15

  // Find the highest round score
  const highestRoundScore = Math.max(0, ...Object.values(playerResults || {}).map(r => r.roundScore || 0));

  // Countdown Timer Effect
  useEffect(() => {
    setCountdown(15); // Reset countdown on mount/results change - Updated to 15
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          // No need to call onProceed, server will send 'new-round'
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Cleanup interval on unmount
    return () => clearInterval(timer);
  }, [results]); // Rerun effect if results change (new summary shown)

  // TODO: Enhance styling significantly
  return (
    // Apply lobby background and text color
    <div className="p-4 min-h-screen flex flex-col items-center justify-center relative" css={{ background: 'var(--backgroundColor)', color: 'var(--textColor)'}}> {/* Added relative positioning */}
      {/* Wrap FixedChat in a positioning div for summary views */}
      <div className="fixed bottom-4 left-4 z-50 hidden md:block">
        <FixedChat lightContext={true} /> {/* Pass lightContext prop */}
      </div>
      <h2 className="text-2xl font-bold mb-4">Round {round} Results</h2>

      {/* Display Correct Answer - Lobby Style Card */}
      <div className="mb-6 p-4 border rounded w-full max-w-md text-center" css={{ background: 'var(--backgroundColorBarelyDark)', borderColor: 'var(--backgroundColorSlightlyDark)'}}>
        <h3 className="text-lg font-semibold mb-2" css={{ color: 'var(--textColorLowOpacity)'}}>Correct Answer</h3>
        {/* Display Image */}
        {correctArtifact?.images?.external?.[0] && (
          <img
            src={correctArtifact.images.external[0]}
            alt={correctArtifact.name || 'Correct Artifact Image'} // Use .name for alt text
            className="max-h-48 w-auto mx-auto my-2 rounded" css={{ border: '1px solid var(--backgroundColorSlightlyDark)'}} // Use theme border
          />
        )}
        <p><b>Artifact:</b> {correctArtifact?.name || 'N/A'}</p> {/* Use .name for display */}
        <p><b>Date:</b> {correctArtifact?.time ? formatDate(correctArtifact.time.start) : 'N/A'} {correctArtifact?.time?.end !== correctArtifact?.time?.start ? ` → ${formatDate(correctArtifact.time.end)}` : ''}</p>
        <p><b>Location:</b> {correctArtifact?.location ? formatLocation(correctArtifact.location) : 'N/A'}</p>
        <Link href={`/artifacts/${correctArtifact?._id}`} passHref target="_blank">
          <Button
            className="mt-4" // Added margin-bottom
            size='lg'
            css={{
              background: 'var(--primaryColor)',
              '&:hover': { background: 'var(--primaryColorLight)', boxShadow: 'none' },
              border: '1px outset', borderColor: '#ffffff77 #00000077 #00000077 #ffffff77', // Keep consistent border
              boxShadow: 'none', borderRadius: 0 // Keep consistent style
            }}
          >
            View artifact details
          </Button>
        </Link>
      </div>

      {/* Display Player Guesses & Scores */}
      <div className="w-full max-w-md mb-6">
         <h3 className="text-lg font-semibold mb-2" css={{ color: 'var(--textColorLowOpacity)'}}>Player Results</h3>
         {Object.entries(playerResults || {}).map(([userId, result]) => {
           const isRoundWinner = result.roundScore === highestRoundScore && highestRoundScore > 0;
           const datePoints = result.score?.datePoints ?? 0;
           const countryPoints = result.score?.countryPoints ?? 0;
           const winnerBg = 'linear-gradient(0deg, #ffc1072e, #ffeb3b1f)'; // Subtle gold gradient for winner

           return (
             // Add winner styling conditionally - Lobby Style Card
             <div key={userId} className={`mb-3 p-3 border rounded`} css={{
                background: isRoundWinner ? winnerBg : 'var(--backgroundColorSlightlyLight)',
                borderColor: isRoundWinner ? '#ffc107' : 'var(--backgroundColorSlightlyDark)', // Gold border for winner
                boxShadow: isRoundWinner ? '0 2px 10px 0px #ffc10755' : 'rgb(64 68 82 / 8%) 0px 2px 5px 0px', // Gold shadow for winner
             }}>
               {/* Ensure winner text color is black */}
               <p className={`font-semibold ${isRoundWinner ? 'text-black' : ''}`}>
                 {result.username || userId /* Fallback to ID */} {isRoundWinner ? '🏆' : ''}
               </p>
               {result.guess ? (
                 <>
                   {/* Use theme text colors */}
                   <p className={getPointsClass(datePoints)} css={{ color: datePoints === 100 ? 'var(--successColor)' : datePoints >= 80 ? 'var(--warningColor)' : 'var(--textColor)'}}>
                     Guessed Date: {formatDate(result.guess.date)} ({datePoints} pts)
                   </p>
                   <p className={getPointsClass(countryPoints)} css={{ color: countryPoints === 100 ? 'var(--successColor)' : countryPoints >= 80 ? 'var(--warningColor)' : 'var(--textColor)'}}>
                     Guessed Location: {result.guess.country} ({countryPoints} pts)
                   </p>
                   <p>Round Score: +{result.roundScore}</p>
                 </>
               ) : (
                 <p>Did not guess.</p>
               )}
             </div>
           );
         })}
      </div>
      {/* Removed duplicate closing tags that caused previous error */}

       {/* TODO: Display overall leaderboard/scores? */}
       {/* <pre>Overall: {JSON.stringify(overallScores, null, 2)}</pre> */}

       {/* Countdown Display */}
       <div className="mt-6 text-xl" css={{ color: 'var(--textColorLowOpacity)'}}> {/* Use theme text color */}
         {countdown > 0 ? `Next round starting in ${countdown}...` : 'Starting next round...'}
       </div>

      {/* Removed manual proceed button */}
      {/* <button onClick={onProceed} className="mt-4 p-2 bg-blue-600 hover:bg-blue-700 rounded text-lg font-semibold">
        Next Round / View Summary
      </button> */}
    </div>
  );
};

// Adapted Game Summary Component
// Added gameHistory, isForfeitWin, playerStatuses props
const MultiplayerGameSummary = ({ finalScores, settings, players, currentUserId, gameHistory, isForfeitWin, playerStatuses, onProceed }) => {
  // Sort scores descending
  const sortedScores = Object.entries(finalScores || {})
    .map(([userId, score]) => ({ userId, score })) // Keep it simple here
    .sort((a, b) => b.score - a.score);

  // Determine winner, draw, and title text, considering forfeits
  const winner = sortedScores.length > 0 ? sortedScores[0] : null;
  const isCurrentUserWinner = winner && winner.userId === currentUserId;
  // Check for a draw: more than one player exists, and the top two scores are equal
  const isDraw = sortedScores.length > 1 && sortedScores[0].score === sortedScores[1].score;

  let titleText = "Game Over"; // Default
  if (isForfeitWin) {
    // Forfeit logic remains the same, draw doesn't apply if someone forfeited to end the game
    titleText = isCurrentUserWinner ? "You Win! Opponent Forfeited." : "";
  } else if (isDraw) {
    titleText = "It's a Draw!"; // New Draw condition
  } else {
    // Original win/loss logic if not a forfeit and not a draw
    titleText = isCurrentUserWinner ? "You Won!" : "You Lose!";
  }


  // TODO: Enhance styling significantly
  return (
    // Apply lobby background and text color
    <div className="p-4 min-h-screen flex flex-col items-center justify-center relative" css={{ background: 'var(--backgroundColor)', color: 'var(--textColor)'}}> {/* Added relative positioning */}
      {/* Wrap FixedChat in a positioning div for summary views */}
      <div className="fixed bottom-4 left-4 z-50 hidden md:block">
        <FixedChat lightContext={true} /> {/* Pass lightContext prop */}
      </div>
      <h2 className="text-3xl font-bold mb-6">{titleText}</h2>

      {/* Final Scores - Lobby Style Card */}
      <div className="mb-6 p-4 border rounded w-full max-w-md" css={{ background: 'var(--backgroundColorBarelyDark)', borderColor: 'var(--backgroundColorSlightlyDark)'}}>
        <h3 className="text-xl font-semibold mb-3 text-center" css={{ color: 'var(--textColorLowOpacity)'}}>Final Scores</h3>
        {/* Use players prop to display usernames */}
         {sortedScores.map(({ userId, score }, index) => {
           // Update: Also check for !isDraw to prevent highlighting on a draw
           const isWinner = index === 0 && sortedScores.length > 0 && !isForfeitWin && !isDraw;
           const playerStatus = playerStatuses?.[userId] || 'active'; // Get status
           const isForfeited = playerStatus === 'forfeited';
           const winnerBg = 'linear-gradient(0deg, #ffc1072e, #ffeb3b1f)'; // Subtle gold gradient for winner
           const username = players?.[userId]?.username || userId.substring(0, 8) + '...'; // Get username or fallback to truncated ID

           // Apply forfeited styling
           const forfeitedClasses = isForfeited ? 'opacity-50 line-through' : '';
           const rowBg = isWinner ? winnerBg : (isForfeited ? 'var(--backgroundColorDark)' : 'var(--backgroundColorSlightlyLight)'); // Darker bg for forfeited
           const rowBorder = isWinner ? '#ffc107' : (isForfeited ? 'var(--backgroundColorDark)' : 'var(--backgroundColorSlightlyDark)');
           const rowColor = isWinner ? 'black' : (isForfeited ? 'var(--textColorLowOpacity)' : 'var(--textColor)');

           return (
             <div key={userId} className={`flex justify-between p-2 rounded mb-1 ${forfeitedClasses}`} css={{
                background: rowBg,
                border: `1px solid ${rowBorder}`,
                color: rowColor,
                background: isWinner ? winnerBg : 'var(--backgroundColorSlightlyLight)',
                border: `1px solid ${isWinner ? '#ffc107' : 'var(--backgroundColorSlightlyDark)'}`,
                // Change winner text color to black
                color: isWinner ? 'black' : 'var(--textColor)',
                fontWeight: isWinner ? 'bold' : 'normal',
             }}>
               <span>{index + 1}. {username} {isWinner ? '🏆' : ''}</span> {/* Display username */}
               <span>{score} pts</span>
             </div>
           );
        })}
        {sortedScores.length === 0 && <p className="text-center" css={{ color: 'var(--textColorLowOpacity)'}}>No scores recorded.</p>}
      </div>

      <Button
        onClick={onProceed}
        className="mt-4 mb-6" // Added margin-bottom
        size='lg'
        css={{
          background: 'var(--primaryColor)',
          '&:hover': { background: 'var(--primaryColorLight)', boxShadow: 'none' },
          border: '1px outset', borderColor: '#ffffff77 #00000077 #00000077 #ffffff77', // Keep consistent border
          boxShadow: 'none', borderRadius: 0 // Keep consistent style
        }}
      >
        Return to Lobby
      </Button>

      {/* --- Round Summaries Section --- */}
      {gameHistory && gameHistory.length > 0 && (
        <div className="mt-8 w-full max-w-2xl"> {/* Increased max-width */}
          <h3 className="text-xl font-semibold mb-4 text-center" css={{ color: 'var(--textColorLowOpacity)'}}>Round Breakdown</h3>
          <div className="space-y-4 pr-2"> {/* Added scroll */}
            {gameHistory.map((roundResult) => (
              <RoundDetail key={roundResult.round} roundData={roundResult} players={players} />
            ))}
          </div>
        </div>
      )}
      {/* --- End Round Summaries Section --- */}

    </div>
  );
};

export const MultiplayerGameUI = ({ gameState, submitGuess, proceedAfterSummary }) => {
  const router = useRouter()
  useTheme()
  const { user } = useUser(); // Get user object
  // Get socket and revealImage state from context
  const { _socket: socket, revealImage } = useMultiplayer()
  // Destructure new state variables
  const {
    phase, round, artifact, players, guesses, settings, roundResults, finalScores, error,
    playerStatuses, disconnectCountdown, isForfeitWin, isActive
  } = gameState;

  const [selectedDate, setSelectedDate] = useState(0);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [mapValue, setMapValue] = useState(defaultMapValue); // For MapInteractionCSS
  const [hoverCountry, setHoverCountry] = useState();
  const [isLoadingImage, setIsLoadingImage] = useState(true); // Track image loading
  const [remainingTime, setRemainingTime] = useState(null); // State for round timer
  const timerIntervalRef = useRef(null); // Ref for the timer interval

  const [ref, bounds] = useMeasure();
  const { height: windowHeight, width: windowWidth } = bounds;

  // Determine if the current user has guessed using user._id
  const currentUserHasGuessed = !!guesses?.[user?._id];

  // Determine the status message
  let statusMessage = "Make your guess!";
  let lastOtherGuesser = null;
  let latestTimestamp = 0;

  if (guesses && players && user?._id) { // Check user._id exists
    for (const [userId, guess] of Object.entries(guesses)) {
      // Ensure guess has a timestamp before comparing
      if (userId !== user._id && guess.timestamp && guess.timestamp > latestTimestamp) { // Compare against user._id
        latestTimestamp = guess.timestamp;
        lastOtherGuesser = players[userId]?.username || userId; // Fallback to ID
      }
    }
  }

  if (currentUserHasGuessed) {
    // If current user guessed, show waiting message or their guess info? Let's show waiting for now.
    statusMessage = "Guess submitted!";
  } else if (lastOtherGuesser) {
    statusMessage = `${lastOtherGuesser} made a guess.`;
  }

  const modeInfo = settings?.mode ? modes[settings.mode] : null;

  // Reset local state only when the artifact ID changes (new round starts), not just on gameState update
  useEffect(() => {
    if (phase === 'guessing') {
      // Reset guess-related state for the new round
      setSelectedCountry(null);
      setSelectedDate(modeInfo?.type === 'Era' ? ((modeInfo.start + modeInfo.end) / 2) : 0);
      setMapValue(defaultMapValue); // Reset map zoom/pan
      // Let ImageView handle its own loading state based on props
      // setIsLoadingImage(true); // REMOVED
    }

    // Reset timer for the new round, prioritizing remainingTime from gameState if available (for rejoins)
    if (phase === 'guessing') {
      // Use remainingTime from gameState if it's a valid number (>= 0), otherwise use full timer from settings
      const initialTime = (typeof gameState.remainingTime === 'number' && gameState.remainingTime >= 0)
        ? gameState.remainingTime
        : settings?.timer;
      setRemainingTime(initialTime ?? null); // Initialize timer, default null if neither is valid
      console.log(`[MultiplayerGameUI] Initializing timer for round ${round}. From gameState: ${gameState.remainingTime}, From settings: ${settings?.timer}. Using: ${initialTime}`);
    } else {
      setRemainingTime(null); // Clear timer if not in guessing phase
    }

    // Clear any existing interval when dependencies change
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    // Depend on artifact ID, phase, and potentially gameState.remainingTime to re-run initialization
  }, [artifact?._id, phase, modeInfo, user?._id, settings?.timer, gameState.remainingTime, round]); // Added gameState.remainingTime and round


  // Effect for the round timer countdown - Modified to wait for revealImage
  useEffect(() => {
    // Only run the timer if in guessing phase, remainingTime is set, AND image is revealed
    if (phase === 'guessing' && revealImage && remainingTime !== null && remainingTime > 0) {
      console.log('[MultiplayerGameUI] Timer starting now that image is revealed.'); // Added log
      timerIntervalRef.current = setInterval(() => {
        setRemainingTime(prevTime => {
          if (prevTime <= 1) {
            clearInterval(timerIntervalRef.current);
            timerIntervalRef.current = null;
            // Server will handle the end of the round, client just stops counting
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    } else {
      // Clear interval if phase changes or time runs out client-side
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    }

    // Cleanup function to clear interval on unmount or phase change
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    };
    // Rerun effect if phase, remainingTime, OR revealImage changes
    // Rerun effect if phase, remainingTime, OR revealImage changes
  }, [phase, remainingTime, revealImage]);

  // Handle layout adjustments after image loads - Memoized with useCallback
  const handleLayoutCalculation = useCallback((imgBounds) => {
    // Check if imgBounds is valid before accessing properties
    if (!imgBounds) {
      console.warn('[MultiplayerGameUI] handleLayoutCalculation called without imgBounds.');
      return;
    }
    const h = imgBounds.height;
    if (h) {
      // Adjust map view based on image dimensions (mirroring Game.js logic)
      if (h < windowHeight) {
        const newY = (windowHeight - h) / 2;
        // Check if update is needed (like in Game.js)
        if (isLoadingImage && mapValue.translation.y !== newY) {
          setMapValue({ scale: 1, translation: { x: 0, y: newY } });
        }
      } else {
        const newScale = windowHeight / h;
        const newX = (windowWidth - (imgBounds.width * newScale)) / 2;
        // Check if update is needed (like in Game.js)
        if (isLoadingImage && mapValue.scale !== newScale) {
          setMapValue({ scale: newScale, translation: { x: newX, y: 0 } });
        }
      }
      // Only set loading to false once bounds are processed
      setIsLoadingImage(false);
    }
    // Add dependencies based on variables used inside the function
  }, [isLoadingImage, mapValue.translation.y, mapValue.scale, windowHeight, windowWidth]);

  // Handle emitting image loaded event to server - Memoized with useCallback
  const handleImageLoadedForServer = useCallback(() => {
    // Emit image_loaded event to the server
    if (socket && phase === 'guessing') { // Ensure socket exists and we are in the guessing phase
      console.log('[MultiplayerGameUI] Image loaded, emitting image_loaded to server.');
      socket.emit('image_loaded');
    }
  }, [socket, phase]); // Dependencies: only recreate if socket or phase changes

  const handleImageLoadError = () => {
     console.error("Error loading artifact image in multiplayer game.");
     toast.error("Error loading image for this round.");
     // What should happen here? Skip round? Show error? Backend doesn't handle this yet.
     setIsLoadingImage(false); // Stop loading indicator
  };

  const handleGuessSubmit = () => {
    if (!selectedCountry) {
      return toast.error('Select a country!');
    }
    submitGuess({ date: selectedDate, country: selectedCountry });
    // Optionally disable input here until next round or summary
  };

  const handleManualForfeit = () => {
    if (window.confirm('Are you sure you want to forfeit the game? This cannot be undone.')) {
      if (socket) {
        console.log('Emitting manual-forfeit to server...');
        socket.emit('manual-forfeit');
        // router.push('/multiplayer'); // Redirect to multiplayer index after forfeit
        // Optionally, disable further actions immediately on the client-side?
        // The server will eventually update the player status.
      } else {
        console.error('Socket not available to emit manual-forfeit.');
        toast.error('Could not connect to server to forfeit.');
      }
    }
  };

  // --- Render based on phase ---

  if (phase === 'round-summary' && roundResults) {
    // Pass results, but not onProceed as it's handled by server timer now
    return <MultiplayerRoundSummary results={roundResults} />;
  }
 
   if (phase === 'game-summary' && finalScores) {
      // Pass players, statuses, user ID, history, and forfeit flag
      return <MultiplayerGameSummary
        finalScores={finalScores}
        settings={settings}
        players={players} // Pass the players object containing usernames etc.
        playerStatuses={playerStatuses} // Pass the statuses
        currentUserId={user?._id}
        gameHistory={gameState.gameHistory}
        isForfeitWin={isForfeitWin} // Pass the forfeit flag
        onProceed={proceedAfterSummary}
      />;
   }

  if (phase === 'guessing' && artifact) {
    const imgLength = artifact?.images?.external?.length || 0;
    return (
      // Added relative positioning to allow absolute positioning of banner
      <div ref={ref} className='relative fixed top-0 left-0 w-screen h-screen overflow-hidden bg-black' css={createStyles(theme)}>
        {/* Render Disconnect Banner Conditionally */}
        <DisconnectCountdownBanner countdownData={disconnectCountdown} />

        {/* Added Headers */}
        <MainHeader />
        <AuthHeader />

        {(isLoadingImage) && <LoadingArtifact className='fixed' msg={`Loading Round ${round} Artifact Image${imgLength > 1 ? 's' : ''}`} />}

        <MapInteractionCSS value={mapValue} onChange={v => setMapValue(v)} maxScale={100}>
          <ImageView
            imgs={artifact?.images?.external}
            // Pass revealImage state from context to control visibility
            revealImage={revealImage}
            // Pass the function that emits the socket event
            onImageLoaded={handleImageLoadedForServer}
            // Pass the function that handles layout calculation
            setLoadingComplete={handleLayoutCalculation}
            onError={handleImageLoadError}
          />
        </MapInteractionCSS>

        {/* REMOVED Status Display from Top-Left */}
        {/* <MultiplayerStatus message={statusMessage} /> */}

        {/* Guessing UI */}
        <div className='fixed p-1 pt-0 bottom-0 right-0 z-10 flex flex-col items-end select-none w-[400px]' css={{ '@media (max-width: 500px)': { width: '100vw' } }}>
          {/* Top Row: Mobile Chat, Player Status, Mobile Zoom, Status (Mobile), Round Info */}
          {/* Mobile Chat (Only visible on mobile) */}
          <div className="w-full md:hidden"> {/* Container to ensure full width on mobile */}
             <FixedChat isMobileLayout />
          </div>
          {/* Player Status (Mobile Only) */}
          <div className="flex md:hidden flex-wrap justify-start w-full mb-1">
            <PlayerStatusList players={players} guesses={guesses} playerStatuses={playerStatuses} />
          </div>
           <div className='flex items-end justify-between w-full mb-1'>
             {/* Left Side: Mobile Zoom */}
             <div className="flex items-end">
               {/* Mobile Zoom */}
               <div className='flex items-end mr-1' css={{ '@media (min-width: 600px)': { display: 'none' } }}>
                  <IconButton className='mr-1 bg-[#000000_!important] text-[#ffffff_!important]' onClick={() => setMapValue(v => ({ ...v, scale: v.scale * 1.2, translation: { x: v.translation.x - 50, y: v.translation.y - 50 } }))}><BiPlus /></IconButton>
                  <IconButton className='bg-[#000000_!important] text-[#ffffff_!important]' onClick={() => setMapValue(v => ({ ...v, scale: v.scale / 1.2, translation: { x: v.translation.x + 50, y: v.translation.y + 50 } }))}><BiMinus /></IconButton>
               </div>
               {/* REMOVED Mobile Status - Consolidated above map */}
               {/* <div className="text-white bg-black/60 p-1 px-2 rounded text-sm md:hidden">
                 {statusMessage}
               </div> */}
             </div>
             {/* Right Side: Status + Timer + Round Info + Forfeit */}
             <div className="flex items-center"> {/* Wrap Status and Round in a flex container */}
               <MultiplayerStatus message={statusMessage} /> {/* Add Status here */}
               {/* Timer Display */}
               {remainingTime !== null && phase === 'guessing' && (
                 <div className={`
                   flex items-center rounded font-bold p-1 px-2 text-sm mr-1
                   ${remainingTime <= 5
                     ? 'bg-red-600 text-white animate-pulse' // Urgent style
                     : 'bg-black text-white' // Default style
                   }
                 `}>
                   <IoMdTimer className="mr-1" /> {remainingTime}s
                 </div>
               )}
               {/* Round Info */}
               <div className="text-white bg-black p-1 px-2 rounded text-sm mr-1">Round: {round} / {settings?.rounds}</div> {/* Adjusted padding & added margin */}
               {/* Forfeit Button */}
               <GameButton
                  onClick={handleManualForfeit}
                  disabled={playerStatuses?.[user?._id] === 'forfeited' || currentUserHasGuessed} // Disable if forfeited or already guessed
                  className="text-xs !p-[1px_6px] !min-h-[22px]" // Smaller padding and height
                  css={{
                    background: '#ff000', // Red background
                    color: 'white',
                    '&:hover': { background: '#ff000' }, // Lighter red on hover
                    '&:disabled': { background: '#555', cursor: 'not-allowed', opacity: 0.6 } // Disabled style
                  }}
                >
                  Forfeit
                </GameButton>
              </div>
            </div>
            {/* Map */}
           <div className={`bg-black rounded border border-white/30 mb-1 overflow-hidden relative w-full ${currentUserHasGuessed ? 'filter brightness-75 cursor-not-allowed' : ''}`} css={{ height: 200, '@media (max-width: 500px)': { height: 150 } }}> {/* Replaced opacity-70 */}
             <Map
               setHover={setHoverCountry}
               // Disable map clicks if user has guessed
               setSelectedCountry={currentUserHasGuessed ? () => {} : setSelectedCountry}
               selectedCountry={selectedCountry}
             />
             {hoverCountry && !currentUserHasGuessed && <div className='bg-black p-[2px_8px_4px] rounded-[3px] text-sm h-[24px] absolute bottom-1 right-1 invisible md:visible'>{hoverCountry}</div>}
           </div>
           {/* REMOVED Status Display from here - Moved above */}
           {/* <MultiplayerStatus message={statusMessage} /> */}
           {/* Date/Country Input & Guess Button */}
           <div className={`w-full ${currentUserHasGuessed ? 'filter brightness-75' : ''}`}> {/* Replaced opacity-70 */}
             <div className={`flex items-center bg-black p-[4.5px_6px_4px] rounded-[3px] border border-white/30 text-sm h-[24px] mb-1 w-full ${currentUserHasGuessed ? 'cursor-not-allowed' : ''}`}> {/* Added cursor-not-allowed here */}
               <Range
                 min={modeInfo?.type === 'Era' ? modeInfo.start : -3000}
                 max={modeInfo?.type === 'Era' ? modeInfo.end : new Date().getFullYear()}
                 disabled={currentUserHasGuessed} // Disable slider
                 value={selectedDate}
                 width='100%'
                 onChange={e => !currentUserHasGuessed && setSelectedDate(Number(e.target.value))} // Prevent change if guessed
                 // onKeyDown={/* Multiplayer doesn't use nextStepKey */}
               />
             </div>
             <div className={`flex ${currentUserHasGuessed ? 'cursor-not-allowed' : ''}`}> {/* Added cursor-not-allowed here */}
               <div className={`bg-[#69aacb] text-black p-[2px_8px_4px] rounded-[3px] text-sm h-[24px] mr-1`} css={{ flexGrow: 1 }}> {/* Removed conditional class */}
                 {selectedCountry ? <b>{selectedCountry}</b> : <span className='text-black/60'>No country selected</span>}
               </div>
               <EditableDate
                 value={selectedDate}
                 onChange={setSelectedDate}
                 disabled={currentUserHasGuessed} // Disable date input
                 className={`mr-1 bg-[#90d6f8] text-black rounded-[3px] ${currentUserHasGuessed ? 'cursor-not-allowed' : ''}`} // Removed opacity-70
               />
               <GameButton
                 onClick={handleGuessSubmit}
                 disabled={currentUserHasGuessed} // Disable button
                  className={`w-[82px] justify-center ${currentUserHasGuessed ? 'cursor-not-allowed' : ''}`} // Removed opacity-70
                  css={{ background: '#7dddc3', color: '#000000', ':hover': { background: currentUserHasGuessed ? '#7dddc3' : '#40f59a' } }} // Prevent hover effect when disabled
                >
                  <IoMdEye className='mr-2' /> Guess
               </GameButton>
             </div>
           </div>
        </div>
        {/* Container for Desktop Chat and Player Status */}
        <div className="hidden md:flex flex-col absolute bottom-0 left-0 z-10 p-2"> {/* Position container & make flex column */}
          {/* Render Fixed Chat (Desktop Only) */}
          <FixedChat className={`${disconnectCountdown ? 'mt-6' : ''}`} />
          {/* Render Player Status below Chat (Desktop Only) */}
          <div className="flex flex-wrap justify-start mt-1"> {/* Stack below chat */}
            <PlayerStatusList players={players} guesses={guesses} playerStatuses={playerStatuses} />
          </div>
        </div>
      </div>
    );
  }

  // Default/Fallback view (e.g., waiting for round, error state)
  return (
     <div className='fixed top-0 left-0 w-screen h-screen overflow-hidden bg-black flex items-center justify-center text-white'>
       <div>
         <p>Waiting for game state...</p>
         <p>Phase: {phase}</p>
         {error && <p className="text-red-500">Error: {error}</p>}
       </div>
     </div>
  );

};

// --- Helper Component for Round Detail in Final Summary ---
// Renders a condensed view of a single round's results
const RoundDetail = ({ roundData, players }) => {
  const { round, correctArtifact, results: playerResults } = roundData;

  console.log(correctArtifact)

  // Find the highest score for this specific round
  const highestRoundScore = Math.max(0, ...Object.values(playerResults || {}).map(r => r.roundScore || 0));

  return (
    // Lobby Style Card for each round
    <div className="p-3 border rounded" css={{ background: 'var(--backgroundColorBarelyDark)', borderColor: 'var(--backgroundColorSlightlyDark)'}}>
      <h4 className="text-lg font-semibold mb-2" css={{ color: 'var(--textColorLowOpacity)'}}>Round {round}</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
        {/* Correct Answer Info */}
        <div className="text-sm">
          <p className="font-medium mb-1" css={{ color: 'var(--textColorLowOpacity)'}}>Correct:</p>
          {correctArtifact?.images?.external?.[0] && (
            <img
              src={correctArtifact.images.external[0]}
              alt={correctArtifact.name || 'Artifact'}
              className="max-h-20 w-auto rounded mb-1" css={{ border: '1px solid var(--backgroundColorSlightlyDark)'}}
            />
          )}
          <p><b>{correctArtifact?.name || 'N/A'}</b></p>
          <p>{correctArtifact?.time ? formatDate(correctArtifact.time.start) : 'N/A'}{correctArtifact?.time?.end !== correctArtifact?.time?.start ? ` → ${formatDate(correctArtifact.time.end)}` : ''}</p>
          <p>{correctArtifact?.location ? formatLocation(correctArtifact.location) : 'N/A'}</p>
        </div>
        {/* Player Guesses for this round */}
        <div className="text-sm space-y-1">
          <p className="font-medium mb-1" css={{ color: 'var(--textColorLowOpacity)'}}>Guesses:</p>
          {Object.entries(playerResults || {}).map(([userId, result]) => {
            const isRoundWinner = result.roundScore === highestRoundScore && highestRoundScore > 0;
            const datePoints = result.score?.datePoints ?? 0;
            const countryPoints = result.score?.countryPoints ?? 0;
            const username = players?.[userId]?.username || userId.substring(0, 8) + '...';

            return (
              <div key={userId} className={`p-1 rounded text-xs ${isRoundWinner ? 'font-semibold' : ''}`} css={{ background: 'var(--backgroundColorSlightlyLight)', border: `1px solid ${isRoundWinner ? '#ffc107' : 'var(--backgroundColorSlightlyDark)'}`, color: isRoundWinner ? 'black' : 'var(--textColor)' }}>
                <p>{username} {isRoundWinner ? '🏆' : ''} (+{result.roundScore} pts)</p>
                {result.guess ? (
                  <>
                    <p css={{ color: datePoints === 100 ? 'var(--successColor)' : datePoints >= 80 ? 'var(--warningColor)' : 'inherit' }}>
                      Date: {formatDate(result.guess.date)} ({datePoints} pts)
                    </p>
                    <p css={{ color: countryPoints === 100 ? 'var(--successColor)' : countryPoints >= 80 ? 'var(--warningColor)' : 'inherit' }}>
                      Loc: {result.guess.country} ({countryPoints} pts)
                    </p>
                  </>
                ) : (
                  <p>No guess</p>
                )}
              </div>
            );
          })}
          {Object.keys(playerResults || {}).length === 0 && <p>No guesses this round.</p>}

          <Link href={`/artifacts/${correctArtifact?._id}`} passHref target="_blank">
            <Button
              className="mt-4 mb-6" // Added margin-bottom
              size='lg'
              css={{
                background: 'var(--primaryColor)',
                '&:hover': { background: 'var(--primaryColorLight)', boxShadow: 'none' },
                border: '1px outset', borderColor: '#ffffff77 #00000077 #00000077 #ffffff77', // Keep consistent border
                boxShadow: 'none', borderRadius: 0 // Keep consistent style
              }}
            >
              View artifact details
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
