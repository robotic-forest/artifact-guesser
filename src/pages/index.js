import useWindowDimensions from "@/hooks/useWindowDimensions"
import { useEffect, useState } from "react"
import useSWR from "swr"
import { MapInteractionCSS } from 'react-map-interaction'
import { Button } from "@/components/buttons/Button"
import { AuthHeader } from "@/components/layout/AuthHeader"
import { GiGreekSphinx } from "react-icons/gi"
import { IoMdEye } from "react-icons/io"
import { VscLinkExternal } from "react-icons/vsc"
import { IconButton } from "@/components/buttons/IconButton"
import { GrRefresh } from "react-icons/gr"
import { useRouter } from "next/router"

// the MET API: https://metmuseum.github.io/

export default () => {
  const router = useRouter()
  const { height, width } = useWindowDimensions()
  const [dimensions, setDimensions] = useState()
  const [value, setValue] = useState()
  const [revealed, setRevealed] = useState(false)

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

  console.log(object)

  return (
    <div css={{ height: '100vh', width: '100vw' }}>
      <div className='fixed flex items-center m-1 top-0 left-0 bg-black z-10 p-[1px_5px] rounded-[4px] text-sm overflow-hidden'>
        <GiGreekSphinx className='mr-2' />
        Ur Context
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

      {dimensions && (
        <div className='fixed m-1 mb-2 bottom-0 right-0 z-10 flex flex-col items-end'>
          {revealed && (
            <div className='bg-black rounded mb-1 w-[300px] border border-white/20' css={{ padding: '3px 8px' }}>
              <div className='mb-2 flex justify-between items-center'>
                <b>{object?.title}</b>
                <a css={{ float: 'right', display: 'inline-flex', alignItems: 'center' }} href={object?.objectURL} target='_blank' rel='noreferrer'>
                  <VscLinkExternal className='mr-2' />
                  View
                </a>
              </div>
              <div className='mb-1'>
                {object?.objectDate}{object?.period ? ` - ${object.period}` : ''}
                {/* {object?.objectBeginDate !== object?.objectEndDate && `${formatDate(object?.objectBeginDate)} to ${formatDate(object?.objectEndDate)}`} */}
              </div>
              <div>{createArea(object)}</div>
            </div>
          )}
          <div className='flex'>
            <IconButton className='mr-1.5' css={{ border: '1px solid #ffffff44' }} onClick={() => router.reload()}>
              <GrRefresh />
            </IconButton>
            <Button onClick={() => setRevealed(!revealed)} css={!revealed && {
              background: '#35ad8d',
              color: '#000000',
              ':hover': { background: '#7dddc3' }
            }}>
              <IoMdEye className='mr-2' />
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