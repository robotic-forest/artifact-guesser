import { useState, useEffect } from "react";
import { MapInteractionCSS } from 'react-map-interaction';
import { IoMdEye } from "react-icons/io";
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

// Adapted Round Summary Component
const MultiplayerRoundSummary = ({ results /* Removed onProceed - handled by server timer */ }) => {
  const { round, correctArtifact, scores: overallScores, results: playerResults } = results;
  const [countdown, setCountdown] = useState(15); // Countdown state - Updated to 15

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
    <div className="p-4 bg-gray-800 text-white min-h-screen flex flex-col items-center justify-center">
      <h2 className="text-2xl font-bold mb-4">Round {round} Results</h2>

      {/* Display Correct Answer */}
      <div className="mb-6 p-4 border border-green-500 rounded bg-gray-700 w-full max-w-md text-center">
        <h3 className="text-lg font-semibold mb-2 text-green-300">Correct Answer</h3>
        {/* Display Image */}
        {correctArtifact?.images?.external?.[0] && (
          <img
            src={correctArtifact.images.external[0]}
            alt={correctArtifact.name || 'Correct Artifact Image'} // Use .name for alt text
            className="max-h-48 w-auto mx-auto my-2 rounded border border-gray-500" // Added styling
          />
        )}
        <p><b>Artifact:</b> {correctArtifact?.name || 'N/A'}</p> {/* Use .name for display */}
        <p><b>Date:</b> {correctArtifact?.time ? formatDate(correctArtifact.time.start) : 'N/A'} {correctArtifact?.time?.end !== correctArtifact?.time?.start ? ` → ${formatDate(correctArtifact.time.end)}` : ''}</p>
        <p><b>Location:</b> {correctArtifact?.location ? formatLocation(correctArtifact.location) : 'N/A'}</p>
      </div>

      {/* Display Player Guesses & Scores */}
      <div className="w-full max-w-md mb-6">
         <h3 className="text-lg font-semibold mb-2">Player Results</h3>
         {Object.entries(playerResults || {}).map(([userId, result]) => (
           <div key={userId} className="mb-3 p-3 border border-gray-600 rounded bg-gray-700">
             {/* Use result.username directly */}
             <p className="font-semibold">{result.username || userId /* Fallback to ID if username missing */} </p>
             {result.guess ? (
               <>
                 <p>Guessed Date: {formatDate(result.guess.date)} ({result.score?.datePoints} pts)</p>
                 <p>Guessed Location: {result.guess.country} ({result.score?.countryPoints} pts)</p>
                 <p>Round Score: +{result.roundScore}</p>
               </>
             ) : (
               <p className="text-gray-400">Did not guess.</p>
             )}
           </div>
         ))}
      </div>

       {/* TODO: Display overall leaderboard/scores? */}
       {/* <pre>Overall: {JSON.stringify(overallScores, null, 2)}</pre> */}

       {/* Countdown Display */}
       <div className="mt-6 text-xl">
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
const MultiplayerGameSummary = ({ finalScores, settings, onProceed }) => {
  // Sort scores descending
  const sortedScores = Object.entries(finalScores || {})
    .map(([userId, score]) => ({ userId, score /* TODO: Need username here */ }))
    .sort((a, b) => b.score - a.score);

  // TODO: Enhance styling significantly
  return (
    <div className="p-4 bg-gray-900 text-white min-h-screen flex flex-col items-center justify-center">
      <h2 className="text-3xl font-bold mb-6">Game Over!</h2>

      <div className="mb-6 p-4 border border-blue-500 rounded bg-gray-800 w-full max-w-md">
        <h3 className="text-xl font-semibold mb-3 text-center">Final Scores</h3>
        {/* TODO: Need a way to get usernames associated with userIds */}
        {sortedScores.map(({ userId, score }, index) => (
          <div key={userId} className={`flex justify-between p-2 rounded mb-1 ${index === 0 ? 'bg-yellow-600 font-bold' : 'bg-gray-700'}`}>
            <span>{index + 1}. {userId.substring(0, 8)}...</span> {/* Display truncated userId for now */}
            <span>{score} pts</span>
          </div>
        ))}
        {sortedScores.length === 0 && <p className="text-center text-gray-400">No scores recorded.</p>}
      </div>

      <button onClick={onProceed} className="mt-4 p-3 bg-green-600 hover:bg-green-700 rounded text-lg font-semibold">
        Return to Lobby View
      </button>
    </div>
  );
};

// Simple status component
const MultiplayerStatus = ({ message }) => {
  // Base styles
  let styles = "text-white bg-black/60 p-1 px-2 rounded text-sm";
  // Desktop: bottom-left positioning
  styles += " hidden md:block fixed bottom-1 left-1 z-10";
  // Mobile: will be placed manually in the layout

  return <div className={styles}>{message}</div>;
};


export const MultiplayerGameUI = ({ gameState, submitGuess, proceedAfterSummary /* Removed currentUserId prop */ }) => {
  const { user } = useUser(); // Get user object
  const { phase, round, artifact, players, guesses, settings, roundResults, finalScores, error } = gameState; // Added players, guesses

  const [selectedDate, setSelectedDate] = useState(0);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [mapValue, setMapValue] = useState(defaultMapValue); // For MapInteractionCSS
  const [hoverCountry, setHoverCountry] = useState();
  const [isLoadingImage, setIsLoadingImage] = useState(true); // Track image loading

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
    statusMessage = "Guess submitted! Waiting for others...";
  } else if (lastOtherGuesser) {
    statusMessage = `${lastOtherGuesser} made a guess.`;
  }

  const modeInfo = settings?.mode ? modes[settings.mode] : null;

  // Reset local state when the artifact changes (new round starts)
  useEffect(() => {
    if (phase === 'guessing' && artifact) {
      setSelectedCountry(null);
      setSelectedDate(modeInfo?.type === 'Era' ? ((modeInfo.start + modeInfo.end) / 2) : 0);
      setMapValue(defaultMapValue); // Reset map zoom/pan
      setIsLoadingImage(true); // Start loading new image
    }
    // Reset status message potentially if needed when round changes?
  }, [artifact, phase, modeInfo, user?._id]); // Depend on user._id

  // Handle image loading state
  const handleImageLoadComplete = (imgBounds) => {
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
  };

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

  // --- Render based on phase ---

  if (phase === 'round-summary' && roundResults) {
    // Pass results, but not onProceed as it's handled by server timer now
    return <MultiplayerRoundSummary results={roundResults} />;
  }

  if (phase === 'game-summary' && finalScores) {
     return <MultiplayerGameSummary finalScores={finalScores} settings={settings} onProceed={proceedAfterSummary} />;
  }

  if (phase === 'guessing' && artifact) {
    const imgLength = artifact?.images?.external?.length || 0;
    return (
      <div ref={ref} className='fixed top-0 left-0 w-screen h-screen overflow-hidden bg-black'>
        {/* Added Headers */}
        <MainHeader />
        <AuthHeader />

        {(isLoadingImage) && <LoadingArtifact className='fixed' msg={`Loading Round ${round} Artifact Image${imgLength > 1 ? 's' : ''}`} />}

        <MapInteractionCSS value={mapValue} onChange={v => setMapValue(v)} maxScale={100}>
          <ImageView
            imgs={artifact?.images?.external}
            loadingComplete={!isLoadingImage} // Controlled by state now
            setLoadingComplete={handleImageLoadComplete}
            onError={handleImageLoadError}
          />
        </MapInteractionCSS>

        {/* Status Display (Desktop) */}
        <MultiplayerStatus message={statusMessage} />

        {/* Guessing UI */}
        <div className='fixed p-1 pt-0 bottom-0 right-0 z-10 flex flex-col items-end select-none w-[400px]' css={{ '@media (max-width: 500px)': { width: '100vw' } }}>
          {/* Top Row: Mobile Zoom, Status (Mobile), Round Info */}
           <div className='flex items-end justify-between w-full mb-1'>
             {/* Left Side: Mobile Zoom + Mobile Status */}
             <div className="flex items-end">
               {/* Mobile Zoom */}
               <div className='flex items-end mr-1' css={{ '@media (min-width: 600px)': { display: 'none' } }}>
                  <IconButton className='mr-1' onClick={() => setMapValue(v => ({ ...v, scale: v.scale * 1.2, translation: { x: v.translation.x - 50, y: v.translation.y - 50 } }))}><BiPlus /></IconButton>
                  <IconButton onClick={() => setMapValue(v => ({ ...v, scale: v.scale / 1.2, translation: { x: v.translation.x + 50, y: v.translation.y + 50 } }))}><BiMinus /></IconButton>
               </div>
               {/* Mobile Status */}
               <div className="text-white bg-black/60 p-1 px-2 rounded text-sm md:hidden">
                 {statusMessage}
               </div>
             </div>
             {/* Right Side: Round Info */}
             {/* TODO: Adapt GameInfo for multiplayer scores? */}
             {/* <GameInfo /> */}
             <div className="text-white bg-black/50 p-1 rounded">Round: {round} / {settings?.rounds}</div>
           </div>
           {/* Map */}
           <div className={`bg-black rounded border border-white/30 mb-1 overflow-hidden relative w-full ${currentUserHasGuessed ? 'opacity-70 cursor-not-allowed' : ''}`} css={{ height: 200, '@media (max-width: 500px)': { height: 150 } }}>
             <Map
               setHover={setHoverCountry}
               // Disable map clicks if user has guessed
               setSelectedCountry={currentUserHasGuessed ? () => {} : setSelectedCountry}
               selectedCountry={selectedCountry}
             />
             {hoverCountry && !currentUserHasGuessed && <div className='bg-black p-[2px_8px_4px] rounded-[3px] text-sm h-[24px] absolute bottom-1 right-1 invisible md:visible'>{hoverCountry}</div>}
           </div>
           {/* Date/Country Input & Guess Button */}
           <div className={`w-full ${currentUserHasGuessed ? 'opacity-70' : ''}`}>
             <div className='flex items-center bg-black p-[4.5px_6px_4px] rounded-[3px] border border-white/30 text-sm h-[24px] mb-1 w-full'>
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
             <div className='flex'>
               <div className={`bg-[#69aacb] text-black p-[2px_8px_4px] rounded-[3px] text-sm h-[24px] mr-1 ${currentUserHasGuessed ? 'cursor-not-allowed' : ''}`} css={{ flexGrow: 1 }}>
                 {selectedCountry ? <b>{selectedCountry}</b> : <span className='text-black/60'>No country selected</span>}
               </div>
               <EditableDate
                 value={selectedDate}
                 onChange={setSelectedDate}
                 disabled={currentUserHasGuessed} // Disable date input
                 className={`mr-1 bg-[#90d6f8] text-black rounded-[3px] ${currentUserHasGuessed ? 'cursor-not-allowed opacity-70' : ''}`}
               />
               <GameButton
                 onClick={handleGuessSubmit}
                 disabled={currentUserHasGuessed} // Disable button
                 className={`w-[82px] justify-center ${currentUserHasGuessed ? 'opacity-70 cursor-not-allowed' : ''}`}
                 css={{ background: '#7dddc3', color: '#000000', ':hover': { background: currentUserHasGuessed ? '#7dddc3' : '#40f59a' } }} // Prevent hover effect when disabled
               >
                 <IoMdEye className='mr-2' /> Guess
               </GameButton>
             </div>
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
