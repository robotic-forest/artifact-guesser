import { useEffect, useState } from "react"; // Keep useEffect
import { MapInteractionCSS } from 'react-map-interaction'
import { AuthHeader } from "@/components/layout/AuthHeader"
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
import { BiChevronDown, BiChevronUp, BiMinus, BiPlus } from "react-icons/bi"
import { LeaderBoard } from "../gameui/LeaderBoard";
import { useTheme } from "@/pages/_app";
import { MainHeader } from "../gameui/MainHeader";
import { GiTimeBomb } from "react-icons/gi"; // Import timer icon
import { ImageView, defaultMapValue } from "../artifacts/Artifact"
import useMeasure from "react-use-measure"
import { modes } from "../gameui/ModeButton"
import { useGlobalChat } from "@/contexts/GlobalChatContext"; // Import Global Chat hook
import { GlobalChat } from "../chat/GlobalChat"; // Import Global Chat component
import { LobbyBrowser } from "../multiplayer/LobbyBrowser"; // Import Lobby Browser component
import Link from "next/link";

export const Game = dynamic(() => Promise.resolve(GameComponent), { ssr: false })

const GameComponent = () => {
  useTheme()

  return (
    <GameProvider>
      <GameUI />
    </GameProvider>
  )
}

const GameUI = () => {
  const {
    game,
    selectedDate,
    setSelectedDate,
    selectedCountry,
    setSelectedCountry,
    guessed,
    makeGuess,
    artifact,
    loading,
    setLoading,
    isViewingSummary,
    nextStepKey,
    handleArtifactLoadError,
    // Timer related state from context
    countdown,
    isTimerActive,
    timedOut // Get timedOut status
  } = useGame();
  // Use Global Chat hook
  const { joinGlobalChat, leaveGlobalChat } = useGlobalChat();

  const [ref, bounds] = useMeasure();
  const { height: windowHeight, width: windowWidth } = bounds
  const [value, setValue] = useState(defaultMapValue)
  const [hoverCountry, setHoverCountry] = useState();

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

  // Determine if it's a single-player game
  const isSinglePlayer = game?.gameType !== 'multiplayer';

  // Join/Leave global chat room based on single-player status
  useEffect(() => {
    if (isSinglePlayer) {
      console.log('[GameUI] Joining global chat (single-player)...');
      joinGlobalChat();
      return () => {
        console.log('[GameUI] Leaving global chat (single-player)...');
        leaveGlobalChat();
      };
    }
    // If not single player, ensure we leave (e.g., if game type changes unexpectedly)
    // This might be redundant if leaveGlobalChat is called elsewhere, but safe.
    // else {
    //   leaveGlobalChat();
    // }
  }, [isSinglePlayer, joinGlobalChat, leaveGlobalChat]);

  const modeInfo = game?.mode ? modes[game.mode] : null;

  // Show RoundSummary if guessed or timed out, but not viewing final GameSummary
  if ((guessed || timedOut) && !isViewingSummary) return <RoundSummary />;

  const imgLength = artifact?.images?.external.length;

  return (
    <div ref={ref} css={{
      height: isViewingSummary ? undefined : '100vh',
      minHeight: '100vh',
      width: '100vw',
      display: isViewingSummary ? 'static' : 'fixed',
      background: isViewingSummary ? 'linear-gradient(0deg, #061c0d, #28663c)' : 'black',
      overflow: 'hidden',
    }}>
      <MainHeader />
      <AuthHeader />

      {loading && !isViewingSummary && <LoadingArtifact className='fixed' msg={artifact && `Loading ${imgLength} Artifact Image${imgLength > 1 ? 's' : ''}`} />}

      {isViewingSummary && <GameSummary />}

      {!isViewingSummary && artifact && (
        <MapInteractionCSS value={value} onChange={v => setValue(v)} maxScale={100}>
          <ImageView
            imgs={artifact?.images.external}
            loadingComplete={!loading}
            setLoadingComplete={bounds => {
              const h = bounds.height
  
              if (h) {
                if (h < windowHeight) {
                  const newY = (windowHeight - h) / 2
                  if (loading && value.translation.y !== newY) {
                    setValue({ scale: 1, translation: { x: 0, y: newY } })
                  }
                } else {
                  const newScale = windowHeight / h
                  const newX = (windowWidth - (bounds.width * newScale)) / 2
                  if (loading && value.scale !== newScale) {
                    setValue({ scale: newScale, translation: { x: newX, y: 0 } })
                  }
                }
                
                setLoading(false)
              }
            }}
            onError={handleArtifactLoadError}
            revealImage
          />
        </MapInteractionCSS>
      )}

      {/* Show controls only if game is active (not loading, not summary, not guessed, not timed out) */}
      {!loading && !isViewingSummary && !guessed && !timedOut && (
        <div className='fixed p-1 pt-0 bottom-0 right-0 z-10 flex flex-col items-end select-none w-[400px]' css={{
          '@media (max-width: 500px)': { width: '100vw' }
        }}>
          {/* Conditionally render Global Chat ABOVE map for single-player mobile */}
          {isSinglePlayer && (
            <div className='block md:hidden w-full mb-1'>
              <GlobalChat notFixed showHeader />
            </div>
          )}

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
            {isTimerActive && countdown !== null && (
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
            <div className='flex items-center bg-black p-[4.5px_6px_4px] rounded-[3px] border border-white/30 text-sm h-[24px] mb-1 w-full'>
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
      {isSinglePlayer && (
        <div className='hidden md:block fixed bottom-2 left-2 z-50 max-w-[450px]'> {/* Added positioning and width */}
          <GlobalChat showHeader notFixed />
          <LobbyBrowser /> {/* Add Lobby Browser below Global Chat */}
        </div>
      )}
    </div>
  )
}
