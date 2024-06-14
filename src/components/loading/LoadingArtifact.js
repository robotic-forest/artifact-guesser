import { SuperKaballah } from "../art/Kaballah"
import { useEffect, useState } from "react"

export const LoadingArtifact = ({ className, msg, color = '#ffffff' }) => {

  return (
    <div className={`flex flex-col w-full h-full justify-center items-center overflow-hidden ${className}`} css={{
      color
    }}>
      <SuperKaballah speed={500} color={color} />
      <div className='my-12 flex items-center justify-center'>
        {msg || 'Loading Artifact'}
        <span className='inline-block tracking-widest ml-[2px] min-w-[16px]'><EllipsesAnimation /></span>
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