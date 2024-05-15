import { useState, useEffect } from 'react'

const getDimensions = () => {
  if (process.browser) {
    const { innerWidth: width, innerHeight: height } = window
    return { width, height }
  } else {
    return { width: 0, height: 0 }
  }
}

const useWindowDimensions = () => {
  const [windowDimensions, setWindowDimensions] = useState(getDimensions())

  useEffect(() => {
    const handleResize = () => {
      setWindowDimensions(getDimensions())
    }

    process.browser && window.addEventListener('resize', handleResize)
    return () => process.browser && window.removeEventListener('resize', handleResize)
  })

  return windowDimensions
}

export default useWindowDimensions
