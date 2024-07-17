import { socket } from "@/pages/_app"
import { useEffect, useState } from "react"
import { ChatInput } from "./ChatInput"
import { ChatDisplay } from "./ChatDisplay"

export const Chat = () => {
  const [chat, setChat] = useState()

  useEffect(() => {
    socket.on('chat', data => setChat(data))
    socket.on('join', data => setChat(data))
  }, [])

  return (
    <div className='my-4 w-full'>
      <div className='flex justify-between'>
        <div>
          Chat
        </div>
      </div>
      <ChatDisplay chat={chat} />
      <ChatInput />
    </div>
  )
}