import { useEffect, useState } from "react"
import { MapInteractionCSS } from 'react-map-interaction'
import { AuthHeader } from "@/components/layout/AuthHeader"
import { IoMdEye } from "react-icons/io"
import { Range } from "@/components/form/FormRange"
import { Map } from "@/components/gameui/Map"
import toast from "react-hot-toast"
import { EditableDate } from "@/components/gameui/EditableDate"
import dynamic from "next/dynamic"
import { DailyProvider, useDaily } from "./DailyProvider"
import { LoadingArtifact } from "../loading/LoadingArtifact"
import { GameButton } from "../buttons/GameButton"
import { DailyRoundSummary } from "./DailyRoundSummary"
import { DailySummary } from "./DailySummary"
import { IconButton } from "../buttons/IconButton"
import { BiMinus, BiPlus } from "react-icons/bi"
import { useTheme } from "@/pages/_app"
import { DailyHeader } from "./DailyHeader"
import { ImageView, defaultMapValue } from "../artifacts/Artifact"
import useMeasure from "react-use-measure"
import { useGlobalChat } from "@/contexts/GlobalChatContext"
import { GlobalChat } from "../chat/GlobalChat"
import { LobbyBrowser } from "../multiplayer/LobbyBrowser"

export const DailyGame = dynamic(() => Promise.resolve(DailyGameComponent), { ssr: false })

const DailyGameComponent = () => {
  useTheme()

  return (
    <DailyProvider>
      <DailyGameUI />
    </DailyProvider>
  )
}

const DailyGameUI = () => {
  const {
    game,
    selectedDate,
    setSelectedDate,
    selectedCountry,
    setSelectedCountry,
    guessed,
    makeGuess,
    artifact,
    isViewingSummary,
    nextStepKey,
    handleArtifactLoadError,
    timedOut,
    imagesReadyForTimer,
    setImagesReadyForTimer,
  } = useDaily()
  const { joinGlobalChat, leaveGlobalChat } = useGlobalChat()

  useEffect(() => {
    joinGlobalChat()
    return () => { leaveGlobalChat() }
  }, [joinGlobalChat, leaveGlobalChat])

  const [ref, bounds] = useMeasure()
  const { height: windowHeight, width: windowWidth } = bounds
  const [value, setValue] = useState(defaultMapValue)
  const [hoverCountry, setHoverCountry] = useState()
  const [initialCenteringDone, setInitialCenteringDone] = useState(false)

  // Reset centering when round changes
  useEffect(() => {
    setInitialCenteringDone(false)
    setValue(defaultMapValue)
  }, [game?.round])

  useEffect(() => {
    if (!isViewingSummary && !guessed && !timedOut) {
      document.body.style.position = "fixed"
      document.body.style.overflow = "hidden"
      document.body.style.width = "100%"
    } else {
      document.body.style.position = "static"
      document.body.style.overflow = "auto"
      document.body.style.width = "auto"
    }

    return () => {
      document.body.style.position = "static"
      document.body.style.overflow = "auto"
      document.body.style.width = "auto"
    }
  }, [isViewingSummary, guessed, timedOut])

  if (!game) return <LoadingArtifact className='fixed inset-0' msg="Loading Today's Run..." />

  // Show round summary after guess
  if ((guessed || timedOut) && !isViewingSummary) return <DailyRoundSummary />

  const imgLength = artifact?.images?.external?.length

  return (
    <div ref={ref} css={{
      height: isViewingSummary ? undefined : '100vh',
      minHeight: '100vh',
      width: '100vw',
      display: isViewingSummary ? 'static' : 'fixed',
      background: isViewingSummary ? 'linear-gradient(0deg, #0d1c2e, #1a4a6e)' : 'black',
      overflow: 'hidden',
    }}>
      <DailyHeader />
      <AuthHeader />

      {!imagesReadyForTimer && !isViewingSummary && (
        <LoadingArtifact className='fixed inset-0' msg={artifact && `Loading ${imgLength} Artifact Image${imgLength > 1 ? 's' : ''}`} />
      )}

      {isViewingSummary && <DailySummary />}

      {!isViewingSummary && artifact && (
        <MapInteractionCSS value={value} onChange={v => setValue(v)} maxScale={100}>
          <ImageView
            imgs={artifact?.images.external}
            setLoadingComplete={imageBounds => {
              const h = imageBounds?.height
              if (h && imagesReadyForTimer && !initialCenteringDone) {
                let newScale = 1
                let newX = 0
                let newY = 0

                if (h < windowHeight) {
                  newY = (windowHeight - h) / 2
                } else {
                  newScale = windowHeight / h
                  newX = (windowWidth - (imageBounds.width * newScale)) / 2
                }

                if (value.scale !== newScale || value.translation.x !== newX || value.translation.y !== newY) {
                  setValue({ scale: newScale, translation: { x: newX, y: newY } })
                }
                setInitialCenteringDone(true)
              }
            }}
            onError={handleArtifactLoadError}
            onAllImagesLoaded={() => setImagesReadyForTimer(true)}
            revealImage
          />
        </MapInteractionCSS>
      )}

      {/* Controls */}
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
              css={{ '@media (min-width: 600px)': { display: 'none' } }}
            >
              <IconButton
                className='mr-1'
                onClick={() => setValue(v => ({
                  ...v,
                  scale: v.scale * 1.2,
                  translation: { x: v.translation.x - 50, y: v.translation.y - 50 }
                }))}
              >
                <BiPlus />
              </IconButton>
              <IconButton
                className='mr-1'
                onClick={() => setValue(v => ({
                  ...v,
                  scale: v.scale / 1.2,
                  translation: { x: v.translation.x + 50, y: v.translation.y + 50 }
                }))}
              >
                <BiMinus />
              </IconButton>
            </div>
            <DailyGameInfo />
          </div>

          <div className='bg-black rounded border border-white/30 mb-1 overflow-hidden relative w-full' css={{
            height: 200,
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
                min={-3000}
                max={new Date().getFullYear()}
                value={selectedDate}
                width='100%'
                onChange={e => setSelectedDate(e.target.value)}
                onKeyDown={e => {
                  if ([13, 32].includes(e.keyCode)) {
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
                className: 'mr-1 bg-[#90d6f8] text-black rounded-[3px]'
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

      {/* Chat + Lobby Browser */}
      <div className='hidden md:block fixed bottom-2 left-2 z-50 max-w-[450px]'>
        <GlobalChat showHeader notFixed />
        <LobbyBrowser />
      </div>
    </div>
  )
}

const DailyGameInfo = () => {
  const { game } = useDaily()

  return !game ? null : (
    <div className='bg-black rounded py-1 px-2 text-sm overflow-hidden relative flex w-[fit-content]'>
      <div className='mr-3'>
        <span className='text-white/60 mr-2'>Round</span> <b>{game.round} / {game.rounds}</b>
      </div>
      <div>
        <span className='text-white/60 mr-2'>Score</span> <b>{game.score}</b> / 600
      </div>
    </div>
  )
}
