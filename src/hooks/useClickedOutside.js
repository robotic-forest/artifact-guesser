import { useEffect, useRef } from "react"

export const useClickedOutside = onClickOutside => {
  const ref = useRef(null)

  useEffect(() => {
    const handleClickOutside = e => {
      if (ref.current && !ref.current.contains(e.target)) {
        onClickOutside && onClickOutside()
      }
    }
    document.addEventListener('click', handleClickOutside, true)

    return () => {
      document.removeEventListener('click', handleClickOutside, true);
    }
  }, [onClickOutside])

  return { ref }
}