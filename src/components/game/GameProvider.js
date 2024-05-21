import { createContext, useContext, useEffect, useState } from "react"
import useUser from "../../hooks/useUser"
import axios from "axios"
import { convertCountries } from "@/lib/artifactUtils"

const GameContext = createContext(null)

export const useGame = () => {
  const context = useContext(GameContext)
  if (!context) {
    return { game: null, currentRound, updateGame: null }
  }
  return context
}

export const GameProvider = ({ children }) => {
  const { user } = useUser()
  const [game, setGame] = useState()
  const [selectedDate, setSelectedDate] = useState(0)
  const [selectedCountry, setSelectedCountry] = useState()
  const [loading, setLoading] = useState(false)

  // if logged in, get game info from user, otherwise get from localStorage, otherwise initialize game
  useEffect(() => {
    const initGame = async () => {
      if (user?.isLoggedIn) {
        const { data } = await axios.get('/api/games/current')
        setGame(data)
        if (data.roundData[data.round - 1].selectedDate) setSelectedDate(data.roundData[data.round - 1].selectedDate)
        if (data.roundData[data.round - 1].selectedCountry) setSelectedCountry(data.roundData[data.round - 1].selectedCountry)
      } else if (user && !user?.isLoggedIn) {
        const game = JSON.parse(localStorage.getItem('game'))
        if (game) {
          setGame(game)
          if (game.roundData[game.round - 1].selectedDate) setSelectedDate(game.roundData[game.round - 1].selectedDate)
          if (game.roundData[game.round - 1].selectedCountry) setSelectedCountry(game.roundData[game.round - 1].selectedCountry)
        } else {
          const { data: newArtifact } = await axios.get('/api/artifacts/random')

          const newGame = {
            round: 1,
            rounds: 5,
            score: 0,
            mode: 'Classic',
            roundData: [
              {
                round: 1,
                artifactId: newArtifact._id,
                artifact: newArtifact,
                guessed: false
              }
            ]
          }
  
          setGame(newGame)
          // sync localstorage
          localStorage.setItem('game', JSON.stringify(newGame))
        }
      }
    }

    !game && initGame()
  }, [user, game])

  const updateGame = async (newGame, startNew) => {
    !startNew && setGame(newGame)

    if (user?.isLoggedIn) {
      const dbGame = { ...newGame }
      dbGame.roundData = newGame.roundData.map(({ artifact, ...rest }) => rest)
      await axios.post('/api/games/edit', dbGame)
      if (startNew) setGame(null)
    } else {
      if (startNew) localStorage.removeItem('game')
      else localStorage.setItem('game', JSON.stringify(newGame))
      if (startNew) setGame(null)
    }
  }

  const currentRound = game?.roundData?.find(round => round.round === game.round)
  const artifact = currentRound?.artifact

  const guessed = currentRound?.guessed
  const makeGuess = () => {
    const dateIsCorrect = artifact?.time.start <= selectedDate && artifact?.time.end >= selectedDate
    const distanceToDate = Math.min(Math.abs(artifact?.time.start - selectedDate), Math.abs(artifact?.time.end - selectedDate))
    const datePoints = dateIsCorrect ? 100 : Math.round(distanceToDate > 300 ? 0 : 100 - (distanceToDate / 3))
    const countryIsCorrect = convertCountries(artifact?.location.country).includes(selectedCountry)
    const points = datePoints + (countryIsCorrect ? 100 : 0)

    const newGame = { ...game }
    newGame.roundData[game.round - 1] = {
      ...newGame.roundData[game.round - 1],
      guessed: true,
      selectedDate: Number(selectedDate),
      selectedCountry,
      dateIsCorrect,
      distanceToDate,
      datePoints,
      countryIsCorrect,
      points,
      loading
    }

    newGame.score += points

    updateGame(newGame)
  }

  const startNextRound = async () => {
    if (game.round === game.rounds) return

    setSelectedCountry(null)
    setSelectedDate(0)

    setLoading(true)
    const { data: newArtifact } = await axios.get('/api/artifacts/random')
    setLoading(false)

    const newGame = {
      ...game,
      round: game.round + 1,
      roundData: [
        ...game.roundData,
        {
          round: game.round + 1,
          artifactId: newArtifact._id,
          artifact: newArtifact,
          guessed: false
        }
      ]
    }

    updateGame(newGame)
  }

  const startNewGame = () => {
    setSelectedCountry(null)
    setSelectedDate(0)
    updateGame({ ...game, ongoing: false }, true)
  }

  return (
    <GameContext.Provider value={{
      game,
      currentRound,
      selectedDate,
      setSelectedDate,
      selectedCountry,
      setSelectedCountry,
      artifact,
      guessed,
      makeGuess,
      startNextRound,
      startNewGame
    }}>
      {children}
    </GameContext.Provider>
  )
}