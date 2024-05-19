import axios from "axios"
import toast from "react-hot-toast"

export const useArtifacts = () => {

  const createArtifact = async object => {
    const res = await axios.post('/api/artifacts/new', object)
    if (res?.data?.success) toast.success('Artifact created')
    return true
  }

  return {
    createArtifact
  }
}