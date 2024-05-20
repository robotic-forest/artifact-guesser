import axios from "axios"
import { useEffect, useState } from "react"
import useUser from "../useUser"

export const useRandomArtifact = () => {
  const { user } = useUser()
  const [artifact, setArtifact] = useState()

  useEffect(() => {
    !artifact && user && !user.isLoggedIn && axios.get('/api/artifacts/random').then(res => setArtifact(res.data))
  }, [artifact])

  return {
    artifact,
    getNewArtifact: () => setArtifact(null)
  }
}