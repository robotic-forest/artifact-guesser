import { useEffect, useRef } from 'react'
import { useRouter } from 'next/router'

// Hack to allow back to DB navigation in Artifact View, where the iframe mutates the history stack
// https://github.com/vercel/next.js/discussions/36723
export const usePreviousRoute = () => {
  const { asPath } = useRouter()
  const ref = useRef(null)

  useEffect(() => {
    if (asPath?.includes('/artifacts?') && !asPath?.includes('__noTrack')) ref.current = asPath
  }, [asPath])

  return ref.current
}