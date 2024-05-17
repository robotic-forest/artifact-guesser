import useWindowDimensions from "@/hooks/useWindowDimensions"
import { useEffect, useState } from "react"
import useSWR from "swr"
import { MapInteractionCSS } from 'react-map-interaction'
import { Button } from "@/components/buttons/Button"
import { AuthHeader } from "@/components/layout/AuthHeader"
import { GiGreekSphinx } from "react-icons/gi"
import { IoMdEye } from "react-icons/io"
import { useRouter } from "next/router"
import { ObjectInfo } from "@/components/gameui/ObjectInfo"
import { Range } from "@/components/form/FormRange"
import { Map } from "@/components/gameui/Map"
import { GrRefresh } from "react-icons/gr"
import toast from "react-hot-toast"

// the MET API: https://metmuseum.github.io/

export default () => {
  const router = useRouter()
  const { height, width } = useWindowDimensions()
  const [dimensions, setDimensions] = useState()
  const [value, setValue] = useState()
  const [revealed, setRevealed] = useState(false)

  const [selectedDate, setSelectedDate] = useState(0)
  const [selectedCountry, setSelctedCountry] = useState()
  const [hoverCountry, setHoverCountry] = useState()

  const [guessed, setGuessed] = useState()

  useEffect(() => {
    if (dimensions && height && width && !value) {
      const w = width / dimensions.width
      const h = height / dimensions.height
      const scale = Math.min(w, h)

      setValue({ scale, translation: { x: 0, y: 0 } })
    }
  }, [dimensions, height, width])
  
  const [id, setId] = useState()
  const { data } = useSWR(!id ? `/api/artifacts/random` : `/api/artifacts/${id}`)
  useEffect(() => { if (data?.id && !id) setId(data.id) }, [data])
  const object = data?.data

  return (
    <div css={{ height: '100vh', width: '100vw' }}>
      <div className='fixed flex items-center m-1 top-0 left-0 bg-black z-10 p-[1px_5px] rounded-[4px] text-sm overflow-hidden'>
        <GiGreekSphinx className='mr-2' />
        Artifact Guesser
      </div>

      <AuthHeader />

      {!dimensions && <div className='fixed flex w-full h-full justify-center items-center overflow-hidden'>Loading...</div>}

      <MapInteractionCSS value={value} onChange={v => setValue(v)} maxScale={100}>
        <div>
          <img src={object?.primaryImage} css={{ opacity: dimensions ? 1 : 0, transition: 'all 0.4s' }} onLoad={({ target: img }) => {
            setDimensions({ height: img.offsetHeight, width: img.offsetWidth })
          }} />
          {object?.additionalImages?.length > 0 && object.additionalImages.map((img, i) => (
            <img key={i} src={img} css={{ opacity: dimensions ? 1 : 0, transition: 'all 0.4s' }} />
          ))}
        </div>
      </MapInteractionCSS>

      {!dimensions ? null : !guessed ? (
        <div className='fixed p-2 pb-2 bottom-0 right-0 z-10 flex flex-col' css={{ userSelect: 'none', width: 400, maxWidth: '100vw' }}>
          <div className='mb-2 w-full flex justify-between'>
            {hoverCountry ? (
              <div className='bg-black p-[2px_8px_4px] rounded-[3px] text-sm h-[24px]'>
                {hoverCountry}
              </div>
            ) : <div />}
            <div className='bg-[#90d6f8] text-black p-[2px_8px_4px] rounded-[3px] text-sm h-[24px]'>
              Selected: {selectedCountry ? <b>{selectedCountry}</b> : <span className='text-black/70'>None</span>}
            </div>
          </div>
          <div className='bg-black rounded border border-white/30 mb-2 overflow-hidden' css={{ width: '100%', height: 200 }}>
            <Map setHover={setHoverCountry} setSelectedCountry={setSelctedCountry} selectedCountry={selectedCountry} />
          </div>
          <div className='flex w-full'>
            <div className='flex items-center bg-black p-[4px_8px] rounded-[3px] text-sm h-[24px] mr-2' css={{
              flexGrow: 1, maxWidth: '100%'
            }}>
              <span className='mr-2 min-w-[64px]'>
                {Math.abs(selectedDate)} {selectedDate > 0 ? 'AD' : 'BC'}
              </span>
              <Range
                min={-5000}
                max={2024}
                value={selectedDate}
                defaultValue={0}
                width='100%'
                onChange={e => setSelectedDate(e.target.value)}
              />
            </div>
            <div className='flex'>
              {/* <IconButton className='mr-1.5' css={{ border: '1px solid #ffffff44' }} onClick={() => router.reload()}>
                <GrRefresh />
              </IconButton> */}
              <Button
                onClick={() => {
                  if (!selectedCountry) return toast.error('Select a country!')
                  else setGuessed(true)
                }}
                className='w-[82px] justify-center'
                css={{
                  background: '#90d6f8',
                  color: '#000000',
                  ':hover': { background: '#7dddc3' }
                }}
              >
                <IoMdEye className='mr-2' />
                Guess
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className='fixed p-1 pb-2 bottom-0 right-0 z-10 flex flex-col items-end w-[400px]' css={{ userSelect: 'none' }}>
          <ObjectInfo object={object} selectedDate={selectedDate} selectedCountry={selectedCountry} />
          <Button
            onClick={() => router.reload()}
            className='w-[82px] justify-center'
            css={{
              background: '#90d6f8',
              color: '#000000',
              ':hover': { background: '#4db4e6' }
            }}
          >
            <GrRefresh className='mr-2' />
            Next
          </Button>
        </div>
      )}
    </div>
  )
}