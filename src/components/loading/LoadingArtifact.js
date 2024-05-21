import { GiGreekSphinx } from "react-icons/gi"
import { SuperKaballah } from "../art/Kaballah"
import { useEffect, useState } from "react"


export const LoadingArtifact = () => {

  return (
    <div className='fixed flex flex-col w-full h-full justify-center items-center overflow-hidden'>
      <SuperKaballah speed={500} />
      <div className='my-12 flex items-center justify-center'>
        {/* <GiGreekSphinx className='mr-4 text-white/70' css={{
          transform: 'scaleX(-1)'
        }} /> */}
        <div>
          Loading Artifact
          <span className='inline-block tracking-widest ml-[2px] min-w-[16px]'><EllipsesAnimation /></span>
        </div>
        {/* <GiGreekSphinx className='ml-3 text-white/70' /> */}
      </div>
    </div>
  )
}

const EllipsesAnimation = () => {
  const [ellipses, setEllipses] = useState("")

  useEffect(() => {
    const interval = setInterval(() => {
      if (ellipses.length === 3) {
        setEllipses("")
      } else {
        setEllipses(prevEllipses => prevEllipses + ".")
      }
    }, 200)

    return () => {
      clearInterval(interval)
    }
  }, [ellipses])

  return <>{ellipses}</>
}