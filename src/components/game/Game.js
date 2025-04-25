import { useEffect, useState, createElement } from "react"; // Import createElement
import { MapInteractionCSS } from 'react-map-interaction';
import { AuthHeader } from "@/components/layout/AuthHeader";
import { IoMdEye } from "react-icons/io"
import { Range } from "@/components/form/FormRange"
import { Map } from "@/components/gameui/Map"
import toast from "react-hot-toast"
import { EditableDate } from "@/components/gameui/EditableDate"
import dynamic from "next/dynamic"
import { GameInfo } from "../gameui/GameInfo"
import { GameProvider, useGame } from "./GameProvider"
import { LoadingArtifact } from "../loading/LoadingArtifact"
import { GameButton } from "../buttons/GameButton"
import { RoundSummary } from "../gameui/RoundSummary/RoundSummary"
import { GameSummary } from "./GameSummary"
import { IconButton } from "../buttons/IconButton"
import { BiMinus, BiPlus } from "react-icons/bi"
import { useTheme } from "@/pages/_app";
import { MainHeader } from "../gameui/MainHeader";
import { GiTimeBomb } from "react-icons/gi"; // Import timer icon
import { ImageView, defaultMapValue } from "../artifacts/Artifact"
import useMeasure from "react-use-measure"
import { modes } from "../gameui/ModeButton"
import { useGlobalChat } from "@/contexts/GlobalChatContext";
import { GlobalChat } from "../chat/GlobalChat";
import { LobbyBrowser } from "../multiplayer/LobbyBrowser";

export const Game = dynamic(() => Promise.resolve(GameComponent), { ssr: false })

const GameComponent = () => {
  useTheme()

  return (
    <GameProvider>
      <GameUI />
    </GameProvider>
  );
};

const GameUI = () => {
  // Splash screen state will now be managed by GameProvider

  const {
    game,
    selectedDate,
    setSelectedDate,
    selectedCountry,
    setSelectedCountry,
    guessed,
    makeGuess,
    artifact,
    // setLoading, // We might not need the setter directly anymore
    isViewingSummary,
    nextStepKey,
    handleArtifactLoadError,
    // Timer related state from context
    countdown,
    isTimerActive,
    timedOut, // Get timedOut status
    // Image readiness state and setter
    imagesReadyForTimer,
    setImagesReadyForTimer,
    // Splash screen related state/functions from context (NEW)
    splashToShow,         // The component type to render for the splash
    startGameFromSplash,  // Function to pass to the splash component to start the game
  } = useGame();
  const { joinGlobalChat, leaveGlobalChat } = useGlobalChat(); // Use Global Chat hook

  const [ref, bounds] = useMeasure();
  const { height: windowHeight, width: windowWidth } = bounds
  const [value, setValue] = useState(defaultMapValue)
  const [hoverCountry, setHoverCountry] = useState();
  const [initialCenteringDone, setInitialCenteringDone] = useState(false); // Track initial centering

  // Reset centering flag when round changes
  useEffect(() => {
    setInitialCenteringDone(false);
    setValue(defaultMapValue); // Also reset zoom/pan state for the new round
  }, [game?.round]);

  useEffect(() => {
    // Lock body scroll when game is active (not summary, not guessed, not timed out)
    if (!isViewingSummary && !guessed && !timedOut) {
      document.body.style.position = "fixed";
      document.body.style.overflow = "hidden"; // Ensure overflow is hidden too
      document.body.style.width = "100%"; // Prevent layout shift
    } else {
      document.body.style.position = "static";
      document.body.style.overflow = "auto";
      document.body.style.width = "auto";
    }

    // Cleanup function
    return () => {
      document.body.style.position = "static";
      document.body.style.overflow = "auto";
      document.body.style.width = "auto";
    };
  }, [isViewingSummary, guessed, timedOut]); // Add timedOut dependency

  // Removed the old useEffect for splash screen timer logic

  // Join/Leave global chat room based on single-player status
  useEffect(() => {
      joinGlobalChat()
      return () => {
        leaveGlobalChat()
      }
  }, [joinGlobalChat, leaveGlobalChat]);


  // Show RoundSummary if guessed or timed out, but not viewing final GameSummary AND splash isn't showing
  if ((guessed || timedOut) && !isViewingSummary && !splashToShow) return <RoundSummary />;

  const imgLength = artifact?.images?.external.length;
  const modeInfo = game?.mode ? modes[game.mode] : null; // Keep modeInfo for other uses if needed

  return (
    <div ref={ref} css={{
      height: isViewingSummary ? undefined : '100vh',
      minHeight: '100vh',
      width: '100vw',
      display: (isViewingSummary || splashToShow) ? 'static' : 'fixed', // Adjust display based on splash
      background: splashToShow ? 'black' : (isViewingSummary ? 'linear-gradient(0deg, #061c0d, #28663c)' : 'black'), // Keep background black during splash
      overflow: 'hidden',
    }}>
      {/* Render Splash Screen if splashToShow is set */}
      {splashToShow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
          {/* Use createElement to render the component type passed from context */}
          {createElement(splashToShow, { startGame: startGameFromSplash })}
        </div>
      )}

      {/* Render regular UI only if splash screen is NOT active */}
      {!splashToShow && (
        <>
          <MainHeader />
          <AuthHeader />

          {/* Show loading overlay until images are ready for the timer (and not summary) */}
          {!imagesReadyForTimer && !isViewingSummary && <LoadingArtifact className='fixed' msg={artifact && `Loading ${imgLength} Artifact Image${imgLength > 1 ? 's' : ''}`} />}

          {isViewingSummary && <GameSummary />}

          {!isViewingSummary && artifact && (
            <MapInteractionCSS value={value} onChange={v => setValue(v)} maxScale={100}>
              <ImageView
                imgs={artifact?.images.external}
                // setLoadingComplete is called when images finish loading and bounds are available
                setLoadingComplete={imageBounds => { // Renamed param for clarity
                  const h = imageBounds?.height;
                  // Only perform initial centering ONCE when images are ready
                  if (h && imagesReadyForTimer && !initialCenteringDone) {
                    let newScale = 1;
                    let newX = 0;
                    let newY = 0;

                    if (h < windowHeight) {
                      // Image is shorter than window, center vertically
                      newY = (windowHeight - h) / 2;
                    } else {
                      // Image is taller than window, scale down to fit height and center horizontally
                      newScale = windowHeight / h;
                      newX = (windowWidth - (imageBounds.width * newScale)) / 2;
                    }

                    // Check if the calculated state is different from the current state
                    // to avoid unnecessary updates if already centered somehow.
                    if (value.scale !== newScale || value.translation.x !== newX || value.translation.y !== newY) {
                      setValue({ scale: newScale, translation: { x: newX, y: newY } });
                    }
                    setInitialCenteringDone(true); // Mark centering as done for this round
                  }
                }}
                onError={handleArtifactLoadError}
                // Pass the setter function for single-player callback
                onAllImagesLoaded={() => {
                  setImagesReadyForTimer(true);
                  // Note: Centering happens in setLoadingComplete now, triggered by image readiness
                }}
                // For multiplayer, revealImage comes from server; for single-player, it's effectively true
                // as opacity is handled internally based on onAllImagesLoaded callback.
                revealImage
                // Pass multiplayer specific prop if needed (assuming it's handled in ImageView)
                // onImageLoaded={multiplayerOnImageLoadedCallback}
              />
            </MapInteractionCSS>
          )}

          {/* Show controls only if game is active (images ready, not summary, not guessed, not timed out) */}
          {imagesReadyForTimer && !isViewingSummary && !guessed && !timedOut && (
            <div className='fixed p-1 pt-0 bottom-0 right-0 z-10 flex flex-col items-end select-none w-[400px]' css={{
              '@media (max-width: 500px)': { width: '100vw' }
            }}>
              <div className='block md:hidden w-full mb-1'>
                <GlobalChat notFixed showHeader />
              </div>

              <div className='flex items-end mb-1'>
                <div
                  className='flex items-end'
                  css={{
                    '@media (min-width: 600px)': { display: 'none' }
                  }}
                >
                  <IconButton
                    className='mr-1'
                    onClick={() => setValue(v => ({
                      ...v,
                      scale: v.scale * 1.2,
                      translation: {
                        x: v.translation.x - 50,
                        y: v.translation.y - 50
                      }
                    }))}
                  >
                    <BiPlus />
                  </IconButton>
                  <IconButton
                    className='mr-1'
                    onClick={() => setValue(v => ({
                      ...v,
                      scale: v.scale / 1.2,
                      translation: {
                        x: v.translation.x + 50,
                        y: v.translation.y + 50
                      }
                    }))}
                  >
                    <BiMinus />
                  </IconButton>
                </div>
                {/* Timer Display */}
                {/* Only show timer if timing is enabled, active, and countdown is a valid number */}
                {game?.timing !== 'None' && isTimerActive && countdown !== null && !isNaN(countdown) && (
                  <div className={`
                    flex items-center rounded font-bold p-1 px-2 text-sm mr-1
                    ${countdown <= 5
                      ? 'bg-red-600 text-white animate-pulse' // Urgent style
                      : 'bg-black text-white' // Default style
                    }
                  `}>
                    <GiTimeBomb className='mr-1' />
                    {countdown}s
                  </div>
                )}
                <GameInfo />
              </div>

              <div className='bg-black rounded border border-white/30 mb-1 overflow-hidden relative w-full' css={{
                height: 200, // Keep original height
                '@media (max-width: 500px)': { height: 150 }
              }}>
                <Map setHover={setHoverCountry} setSelectedCountry={setSelectedCountry} selectedCountry={selectedCountry} />
                {hoverCountry && (
                  <div className='bg-black p-[2px_8px_4px] rounded-[3px] text-sm h-[24px] absolute bottom-1 right-1 invisible md:visible'>
                    {hoverCountry}
                  </div>
                )}
              </div>
              <div className='w-full'>
                <div className='flex items-center bg-black p-[4.5px_6px_5px] rounded-[3px] border border-white/30 text-sm h-[25px] mb-1 w-full'>
                  <Range
                    min={modeInfo?.type === 'Era' ? modeInfo.start : -3000}
                    max={modeInfo?.type === 'Era' ? modeInfo.end : new Date().getFullYear()}
                    value={selectedDate}
                    width='100%'
                    onChange={e => setSelectedDate(e.target.value)}
                    onKeyDown={e => {
                      if ([13, 32].includes(e.keyCode)) { // 13: enter, 32: space
                        e.preventDefault()
                        nextStepKey()
                      }
                    }}
                  />
                </div>
                <div className='flex'>
                  <div className='bg-[#69aacb] text-black p-[2px_8px_4px] rounded-[3px] text-sm h-[24px] mr-1' css={{ flexGrow: 1 }}>
                    {selectedCountry ? <b>{selectedCountry}</b> : <span className='text-black/60'>No country selected</span>}
                  </div>
                  <EditableDate {...{
                    value: selectedDate,
                    onChange: setSelectedDate,
                    className: `mr-1 bg-[#90d6f8] text-black rounded-[3px]`
                  }} />
                  <GameButton
                    onClick={() => {
                      if (!selectedCountry) return toast.error('Select a country!')
                      else {
                        makeGuess()
                        setValue(defaultMapValue)
                      }
                    }}
                    className='w-[82px] justify-center'
                    css={{
                      background: '#7dddc3',
                      color: '#000000',
                      ':hover': { background: '#40f59a' }
                    }}
                  >
                    <IoMdEye className='mr-2' />
                    Guess
                  </GameButton>
                </div>
              </div>
            </div>
          )}

          {/* Conditionally render Global Chat and Lobby Browser for single-player games (Desktop position) */}
          <div className='hidden md:block fixed bottom-2 left-2 z-50 max-w-[450px]'>
            <GlobalChat showHeader notFixed />
            <LobbyBrowser />
          </div>
        </>
      )}
    </div>
  );
};
