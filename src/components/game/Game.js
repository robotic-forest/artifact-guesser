import useWindowDimensions from "@/hooks/useWindowDimensions"
import { useEffect, useState } from "react"
import { MapInteractionCSS } from 'react-map-interaction'
import { AuthHeader } from "@/components/layout/AuthHeader"
import { GiAmphora, GiGreekSphinx } from "react-icons/gi"
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
import Link from "next/link"
import { MenuIconButton } from "../layout/Layout"
import { artifactsTheme } from "@/pages/artifacts"
import { RoundSummary } from "../gameui/RoundSummary/RoundSummary"
import { GameSummary } from "./GameSummary"
import { IconButton } from "../buttons/IconButton"
import { BiChevronDown, BiChevronUp, BiMinus, BiPlus, BiQuestionMark } from "react-icons/bi"
import { BsDiscord } from "react-icons/bs"
import { FaTrophy } from "react-icons/fa"
import { LeaderBoard } from "../gameui/LeaderBoard"
import { useTheme } from "@/pages/_app"
import { Tag } from "../tag/Tag"
import { modes } from "../gameui/ModeButton"

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
    handleArtifactLoadError
  } = useGame()
  
  const { height, width } = useWindowDimensions()
  const [dimensions, setDimensions] = useState()
  const [value, setValue] = useState()
  const [hoverCountry, setHoverCountry] = useState()
  const [mobileMapHeight, setMobileMapHeight] = useState(150)
  const [leaderBoardOpen, setLeaderBoardOpen] = useState(false)

  const stringifiedDimensions = JSON.stringify(dimensions)

  useEffect(() => {
    if (dimensions && height && width) {
      const w = width / dimensions.width
      const h = height / dimensions.height
      const scale = Math.min(w, h)

      setValue({ scale, translation: { x: 0, y: 0 } })
    }
  }, [stringifiedDimensions])

  const primaryImage = artifact?.images.external[0]
  const additionalImages = artifact?.images.external.slice(1)

  useEffect(() => {
    if (!isViewingSummary) document.body.style.position = "fixed"
    else document.body.style.position = "static"

    return () => document.body.style.position = "static"
  }, [isViewingSummary])

  return (
    <div css={{
      height: isViewingSummary ? undefined : '100vh',
      minHeight: '100vh',
      width: '100vw',
      display: isViewingSummary ? 'static' : 'fixed',
      background: isViewingSummary ? 'linear-gradient(0deg, #061c0d, #28663c)' : 'black',
      overflow: 'hidden',
    }}>
      <div className='fixed flex items-start m-1 top-0 left-0 text-sm z-[10]' css={{
          '@media (max-width: 600px)': { display: 'block' }
        }}>
        <div className='flex items-center mb-1'>
          <div className='flex items-center bg-black p-[0px_7px_0px_5px] rounded-[4px] h-[24px] overflow-hidden'>
            <GiGreekSphinx className='mr-2' />
            <span className='mt-[1px]'>Artifact Guesser</span>
          </div>
          {game?.mode && (
            <Tag className='ml-1.5' css={{ height: 24 }} bold color={modes[game.mode].color}>
              {game.mode}
            </Tag>
          )}
        </div>
        <div className='flex items-center'>
          <MenuIconButton
            className='ml-1.5'
            css={{
              border: '1px solid #00000033',
              '@media (max-width: 600px)': { marginLeft: 0 }
            }}
            tooltip='Highscores'
            theme={{
              textColor: '#000000',
              primaryColor: '#c9ae5f',
              backgroundColor: '#c9ae5f'
            }}
            onClick={() => setLeaderBoardOpen(lbo => !lbo)}
          >
            <FaTrophy />
          </MenuIconButton>
          <Link href='https://discord.gg/MvkqPTdcwm'>
            <MenuIconButton className='ml-1.5' css={{ border: '1px solid #ffffff33' }} tooltip='Join Discord' theme={{
              textColor: '#ffffff',
              primaryColor: '#5562ea',
              backgroundColor: '#5562ea'
            }}>
              <BsDiscord />
            </MenuIconButton>
          </Link>
          <Link href='/artifacts'>
            <MenuIconButton className='ml-1.5' css={{ border: '1px solid #00000033' }} tooltip='View Artifact Database' theme={artifactsTheme}>
              <GiAmphora />
            </MenuIconButton>
          </Link>
          <Link href='/about'>
            <MenuIconButton className='ml-1.5' tooltip='About' css={{
              border: '1px solid #ffffff66'
            }}>
              <BiQuestionMark />
            </MenuIconButton>
          </Link>
        </div>
      </div>

      <AuthHeader />

      {leaderBoardOpen && <LeaderBoard onClose={() => setLeaderBoardOpen(false)} />}

      {loading && !isViewingSummary && <LoadingArtifact />}

      {isViewingSummary && <GameSummary />}

      {!isViewingSummary && (
        <MapInteractionCSS value={value} onChange={v => setValue(v)} maxScale={100}>
          <div>
            <img
              src={primaryImage}
              css={{ opacity: (!loading && dimensions) ? 1 : 0, transition: 'all 0.4s ease-in' }}
              onLoad={({ target: img }) => {
                setDimensions({ height: img.offsetHeight, width: img.offsetWidth })
                setLoading(false)
              }}
              onError={handleArtifactLoadError}
              onDoubleClick={() => setValue(v => ({ ...v, scale: v.scale * 1.2 }))}
            />
            {additionalImages?.length > 0 && additionalImages.map(img => (
              <img key={img} src={img} css={{ opacity: (!loading && dimensions) ? 1 : 0, transition: 'all 0.4s' }}
                onDoubleClick={() => setValue(v => ({ ...v, scale: v.scale * 1.2 }))}
              />
            ))}
          </div>
        </MapInteractionCSS>
      )}

      {(!dimensions || loading || isViewingSummary) ? null : !guessed ? (
        <div className='fixed p-1 pt-0 bottom-0 right-0 z-10 flex flex-col items-end select-none w-[400px]' css={{ 
          '@media (max-width: 500px)': { width: '100vw' }
        }}>
          <div className='flex items-end mb-1'>
            <div
              className='flex items-end'
              css={{ 
                '@media (min-width: 600px)': { display: 'none' }
              }}
            >
              <IconButton className='mr-1' onClick={() => setMobileMapHeight(h => h === 150 ? 100 : 150)}>
                {mobileMapHeight === 150 ? <BiChevronDown /> : <BiChevronUp />}
              </IconButton>
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
            <GameInfo />
          </div>
          <div className='bg-black rounded border border-white/30 mb-1 overflow-hidden relative w-full' css={{
            height: 200,
            transition: 'height 0.4s',
            '@media (max-width: 500px)': { height: mobileMapHeight }
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
                min={-3000}
                max={2024}
                value={selectedDate}
                defaultValue={0}
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
                  else makeGuess()
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
      ) : <RoundSummary />}
    </div>
  )
}