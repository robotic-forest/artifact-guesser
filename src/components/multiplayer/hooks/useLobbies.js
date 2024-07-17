import useUser from "@/hooks/useUser"
import { socket } from "@/pages/_app"
import { useEffect, useState } from "react"
import useSWR from "swr"

export const useLobbies = () => {
  const { user } = useUser()
  const [lobbies, setLobbies] = useState()
  const { data: init } = useSWR(!lobbies && '/api/lobbies')

  // init lobbies
  useEffect(() => { !lobbies && init && setLobbies(init) }, [lobbies, init])

  // listen for updates, keep state in sync
  useEffect(() => { socket.on('update-lobbies', update => {
    if (update.type === 'create') {
      setLobbies([...lobbies, update.lobby])
    } else if (update.type === 'delete') {
      setLobbies(lobbies.filter(lobby => lobby._id !== update._id))
    } else if (update.type === 'update') {
      setLobbies(lobbies.map(lobby => lobby._id === update.lobby._id ? update.lobby : lobby))
    }
  }) }, [])

  const createLobby = async isPublic => {
    if (!user || !user.isLoggedIn) return

    socket.emit('create-lobby', {
      public: isPublic,
      mode: user.currentMode,
      time: user.currentTime || 60
    })
  }

  const joinLobby = async (lobby) => {
    console.log(lobby)
  }
  
  return { lobbies, createLobby, joinLobby }
}