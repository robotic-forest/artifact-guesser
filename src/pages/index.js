import useWindowDimensions from "@/hooks/useWindowDimensions"
import { useEffect, useState } from "react"
import useSWR from "swr"
import { MapInteractionCSS } from 'react-map-interaction'
import { Button } from "@/components/buttons/Button"
import { AuthHeader } from "@/components/layout/AuthHeader"
import { GiGreekSphinx } from "react-icons/gi"
import { IoMdEye } from "react-icons/io"
import { ObjectInfo } from "@/components/gameui/ObjectInfo"
import { Range } from "@/components/form/FormRange"
import { Map } from "@/components/gameui/Map"
import toast from "react-hot-toast"
import { EditableDate } from "@/components/gameui/EditableDate"

// the MET API: https://metmuseum.github.io/

export default () => {
  const { height, width } = useWindowDimensions()
  const [dimensions, setDimensions] = useState()
  const [value, setValue] = useState()

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
  const { data } = useSWR(!id ? `/api/external/met/random` : `/api/external/met/${id}`)
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
          <div className='bg-black rounded border border-white/30 mb-1 overflow-hidden relative' css={{ width: '100%', height: 200 }}>
            <Map setHover={setHoverCountry} setSelectedCountry={setSelctedCountry} selectedCountry={selectedCountry} />
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
              <EditableDate {...{ selectedDate, setSelectedDate }} />
              <Button
                onClick={() => {
                  if (!selectedCountry) return toast.error('Select a country!')
                  else setGuessed(true)
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
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className='fixed p-1 pb-2 bottom-0 right-0 z-10 flex flex-col items-end w-[400px]' css={{ userSelect: 'none' }}>
          <ObjectInfo object={object} selectedDate={selectedDate} selectedCountry={selectedCountry} />
        </div>
      )}
    </div>
  )
}
