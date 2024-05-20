import axios from "axios"
import { useEffect, useState } from "react"

export const useRandomArtifact = () => {
  const [artifact, setArtifact] = useState()

  useEffect(() => {
    !artifact && axios.get('/api/artifacts/random').then(res => setArtifact(res.data))
  }, [artifact])

  return {
    artifact,
    getNewArtifact: () => setArtifact(null)
  }
}