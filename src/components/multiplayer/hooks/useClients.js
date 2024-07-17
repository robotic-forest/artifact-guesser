import { useQuery } from "@/hooks/useQuery"
import useUser from "@/hooks/useUser"
import { socket } from "@/pages/_app"
import { useEffect, useState } from "react"

export const useClients = () => {
  const { user } = useUser()
  const [clients, setClients] = useState()
  const { query } = useQuery()
  const lobby = query.lobby

  useEffect(() => {
    socket.on('clients', data => setClients(data))
  }, [])

  useEffect(() => {
    const clientNotFound = !clients?.clients?.find(client => client.username === user.username)
    if (lobby && user?.username && (clientNotFound || clients.lobby !== lobby )) {
      socket.emit('join', { username: user.username, lobby: lobby })
    }
  }, [user, lobby])

  return { clients: clients?.clients }
}