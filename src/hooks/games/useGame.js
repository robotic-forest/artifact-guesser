import { useEffect } from "react"
import useUser from "../useUser"
import useSWR from "swr"

export const useGame = () => {
  const { user } = useUser()
  const [game, setGame] = useState()
  const { data } = useSWR(user ? `/api/games/current` : null)

  // if logged in, get game info from user, otherwise get from localStorage, otherwise initialize game
  useEffect(() => {
    if (game) return

    if (user && data) {
      setGame(data)
    } else {
      const game = JSON.parse(localStorage.getItem('game'))
      if (game) {
        setGame(game)
      } else {
        const newGame = {
          round: 1,
          rounds: 5,
          score: 0,
          mode: 'classic'
        }

        setGame(newGame)
        // sync localstorage
        localStorage.setItem('game', JSON.stringify(newGame))
      }
    }
  }, [user, game, data])

  return {
    game
  }
}