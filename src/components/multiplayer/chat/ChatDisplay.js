import { useEffect, useRef } from "react"

export const ChatDisplay = ({ chat }) => {
  const chatRef = useRef()

  useEffect(() => {
    if (chatRef?.current) chatRef.current.scrollTop = chatRef.current.scrollHeight
  }, [chatRef, chat])

  return (
    <div className='relative h-[fit-content]'>
      <div className='absolute h-full w-full top-0 left-0 z-[10]' css={{
        background: 'linear-gradient(0deg, transparent 90%, var(--ghostText) 100%)',
        pointerEvents: 'none',
        borderRadius: 3,
      }} />
      <div ref={chatRef} className='mt-1 p-1 pb-0 pr-0 text-sm' css={{
        background: `var(--backgroundColorBarelyDark)`,
        borderRadius: 3,
        height: 143,
        overflow: 'auto',
        ...scrollbarCSS
      }}>
        <div className='flex flex-col justify-end min-h-full'>
          {chat?.map((c, i) => (
            <div key={i} className='p-2 pt-0' css={{
              color: c.username ? 'var(--textColor)' : 'var(--textLowOpacity)',
            }}>
              {c.username && <b>{c.username}</b>} {c.message}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const scrollbarCSS = {
  '&::-webkit-scrollbar': {
    width: 12,
    height: 12,
  },
  '&::-webkit-scrollbar-track': {
    background: 'none',
  },
  '&::-webkit-scrollbar-thumb': {
    backgroundColor: 'var(--textVeryLowOpacity)',
    borderRadius: 25,
    border: '5px solid var(--backgroundColorBarelyDark)',
  },
  '&::-webkit-scrollbar-thumb:hover': {
    backgroundColor: 'var(--textLowOpacity)',
  }
}