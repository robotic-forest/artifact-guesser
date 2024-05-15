import { Home } from "@/components/nav/Home"
import useWindowDimensions from "@/hooks/useWindowDimensions"
import { useEffect, useState } from "react"
import useSWR from "swr"
import { MapInteractionCSS } from 'react-map-interaction'
import { Button } from "@/components/buttons/Button"

export default () => {
  const { height, width } = useWindowDimensions()
  const [dimensions, setDimensions] = useState()
  const [value, setValue] = useState()
  const [revealed, setRevealed] = useState(false)

  useEffect(() => {
    if (dimensions && height && width && !value) {
      // console.log({ windowWidth: width, windowHeight: height, imageWidth: dimensions.width, imageHeight: dimensions.height })
      const w = width / dimensions.width
      const h = height / dimensions.height
      const scale = Math.min(w, h)

      setValue({
        scale,
        translation: {
          x: 0,
          y: 0
        }
      })
    }
  }, [dimensions, height, width])
  
  const [id, setId] = useState()
  const { data } = useSWR(!id ? `/api/artifacts/random` : `/api/artifacts/${id}`)
  useEffect(() => { if (data?.id && !id) setId(data.id) }, [data])
  const object = data?.data
  
  // console.log({ object })

  return (
    <div css={{ height: '100vh', width: '100vw' }}>
      <div className='fixed flex items-center m-1 top-0 left-0 bg-black z-10 pr-2 rounded-[6px] text-sm overflow-hidden'>
        <Home style={{ margin: '2px 8px 2px 2px' }} />
        Context - The Ancient Artifact Game
      </div>

      {!dimensions && <div className='fixed flex w-full h-full justify-center items-center overflow-hidden'>Loading...</div>}

      <MapInteractionCSS value={value} onChange={v => setValue(v)} maxScale={100}>
        <div className='flex'>
          <img src={object?.primaryImage} css={{ opacity: dimensions ? 1 : 0, transition: 'all 0.4s' }} onLoad={({ target: img }) => {
            setDimensions({ height: img.offsetHeight, width: img.offsetWidth })
          }} />
          {object?.additionalImages?.length > 0 && object.additionalImages.map((img, i) => (
            <img key={i} src={img} css={{ opacity: dimensions ? 1 : 0, transition: 'all 0.4s', height: 'fit-content' }} />
          ))}
        </div>
      </MapInteractionCSS>

      {dimensions && (
        <div className='fixed m-1 bottom-0 right-0 z-10 flex flex-col items-end'>
          {revealed && (
            <div className='bg-black rounded mb-1 w-[300px]' css={{ padding: '2px 6px' }}>
              <div className='mb-1'>{object?.title}</div>
              <div>
                Dates: {object?.objectDate}, {object?.period ? `${object.period}, ` : ' '}
                {object?.objectBeginDate !== object?.objectEndDate && `${formatDate(object?.objectBeginDate)} to ${formatDate(object?.objectEndDate)}`}
              </div>
              <div>Area: {createArea(object)}</div>
              <div>
                <a href={object?.objectURL} target='_blank' rel='noreferrer'>View</a>
              </div>
            </div>
          )}
          <div>
            <Button onClick={() => setRevealed(!revealed)} css={{ marginRight: 4 }}>
              {revealed ? 'Hide' : 'Reveal'}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

const formatDate = d => {
  const date = String(d)
  if (!date) return

  if (date.includes('-')) {
    return `${date.replace(/-/g, '')} BC`
  } else {
    return `${date} AD`
  }
}

const createArea = (object) => {
  if (!object) return

  let s = ''
  if (object.city) s += object.city + ', '
  if (object.river) s += object.river + ', '
  if (object.state) s += object.state + ', '
  if (object.subregion) s += object.subregion + ', '
  if (object.region) s += object.region + ', '
  if (object.country) s += object.country

  return s
}