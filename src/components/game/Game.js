import useWindowDimensions from "@/hooks/useWindowDimensions"
import { useEffect, useState } from "react"
import { MapInteractionCSS } from 'react-map-interaction'
import { AuthHeader } from "@/components/layout/AuthHeader"
import { GiGreekSphinx } from "react-icons/gi"
import { IoMdEye } from "react-icons/io"
import { ArtifactInfo } from "@/components/gameui/ArtifactInfo"
import { Range } from "@/components/form/FormRange"
import { Map } from "@/components/gameui/Map"
import toast from "react-hot-toast"
import { EditableDate } from "@/components/gameui/EditableDate"
import Head from "next/head"
import dynamic from "next/dynamic"
import { GameInfo } from "../gameui/GameInfo"
import { GameProvider, useGame } from "./GameProvider"
import { LoadingArtifact } from "../loading/LoadingArtifact"
import { GameButton } from "../buttons/GameButton"

export const Game = dynamic(() => Promise.resolve(GameComponent), { ssr: false })

const GameComponent = () => {

  return (
    <GameProvider>
      <GameUI />
    </GameProvider>
  )
}

const GameUI = () => {
  const {
    selectedDate,
    setSelectedDate,
    selectedCountry,
    setSelectedCountry,
    guessed,
    makeGuess,
    artifact,
    loading,
    setLoading
  } = useGame()
  
  const { height, width } = useWindowDimensions()
  const [dimensions, setDimensions] = useState()
  const [value, setValue] = useState()
  const [hoverCountry, setHoverCountry] = useState()

  const stringifiedDimensions = JSON.stringify(dimensions)

  // BUG: new artifact gets loaded, zoom doesnt adjust
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

  return (
    <>
      <Head>
        <title>Artifact Guesser</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div css={{ height: '100vh', width: '100vw' }}>
        <div className='fixed flex items-center m-1 top-0 left-0 bg-black z-10 p-[1px_5px] rounded-[4px] text-sm overflow-hidden'>
          <GiGreekSphinx className='mr-2' />
          Artifact Guesser
        </div>

        <AuthHeader />

        {loading && <LoadingArtifact />}

        <MapInteractionCSS value={value} onChange={v => setValue(v)} maxScale={100}>
          <div>
            <img src={primaryImage} css={{ opacity: (!loading && dimensions) ? 1 : 0, transition: 'all 0.4s ease-in' }} onLoad={({ target: img }) => {
              setDimensions({ height: img.offsetHeight, width: img.offsetWidth })
              setLoading(false)
            }} />
            {additionalImages?.length > 0 && additionalImages.map(img => (
              <img key={img} src={img} css={{ opacity: dimensions ? 1 : 0, transition: 'all 0.4s' }} />
            ))}
          </div>
        </MapInteractionCSS>

        {(!dimensions || loading) ? null : !guessed ? (
          <div className='fixed p-2 pb-2 bottom-0 right-0 z-10 flex flex-col items-end select-none w-[400px]' css={{ 
            '@media (max-width: 500px)': { width: '100vw' }
          }}>
            <GameInfo />
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
              <div className='flex items-center bg-black p-[4.5px_6px_4px] rounded-[3px] border border-white/30 text-sm h-[24px] mb-1 w-full'>
                <Range
                  min={-3000}
                  max={2024}
                  value={selectedDate}
                  defaultValue={0}
                  width='100%'
                  onChange={e => setSelectedDate(e.target.value)}
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
        ) : <ArtifactInfo />}
      </div>
    </>
  )
}