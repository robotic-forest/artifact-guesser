import toast from "react-hot-toast"
import useUser from "../useUser"
import useSWR from "swr"
import axios from "axios"


export const useFavorites = ({ artifactId }) => {
  const { user } = useUser()
  const { data: isFavorite, mutate } = useSWR(user?.isLoggedIn ? `/api/artifacts/favorites/${artifactId}` : null)

  const toggleFavorite = async () => {
    if (!user?.isLoggedIn) return toast.error('You have to be logged in to favorite an artifact!')

    if (isFavorite) {
      const res = await axios.post(`/api/artifacts/favorites/${artifactId}/delete`)
      if (res.data) toast.success('Removed from favorites!')
    } else {
      const res = await axios.post(`/api/artifacts/favorites/new`, { id: artifactId })
      if (res.data) toast.success('Added to favorites!')
    }
    mutate()
  }

  return {
    toggleFavorite, isFavorite
  }
}