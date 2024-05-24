import { createContext, useContext, useEffect, useState } from "react"
import useUser from "../../hooks/useUser"
import axios from "axios"
import { convertCountries } from "@/lib/artifactUtils"
import { countries } from "@/lib/countries"
import { getProximity } from "@/lib/getProximity"

const GameContext = createContext(null)

export const useGame = () => {
  const context = useContext(GameContext)
  if (!context) {
    return { game: null, currentRound: null, updateGame: null }
  }
  return context
}

export const GameProvider = ({ children }) => {
  const { user } = useUser()
  const [game, setGame] = useState()
  const [selectedDate, setSelectedDate] = useState(0)
  const [selectedCountry, setSelectedCountry] = useState()
  const [loading, setLoading] = useState(true)
  const [isViewingSummary, setIsViewingSummary] = useState(false)

  // if logged in, get game info from user, otherwise get from localStorage, otherwise initialize game
  useEffect(() => {
    const initGame = async () => {
      if (user?.isLoggedIn) {
        const { data } = await axios.get('/api/games/current')
        setGame(data)

        if (data.roundData[data.round - 1].selectedDate) setSelectedDate(data.roundData[data.round - 1].selectedDate)
        if (data.roundData[data.round - 1].selectedCountry) setSelectedCountry(data.roundData[data.round - 1].selectedCountry)
        if (data.round === data.rounds && data.roundData.every(r => r.guessed)) setIsViewingSummary(true)
      } else if (user && !user?.isLoggedIn) {
        const game = JSON.parse(localStorage.getItem('game'))
        if (game) {
          setGame(game)
          if (game.roundData[game.round - 1].selectedDate) setSelectedDate(game.roundData[game.round - 1].selectedDate)
          if (game.roundData[game.round - 1].selectedCountry) setSelectedCountry(game.roundData[game.round - 1].selectedCountry)
          if (game.round === game.rounds && game.roundData.every(r => r.guessed)) setIsViewingSummary(true)
        } else {
          const { data: newArtifact } = await axios.get('/api/artifacts/random')

          const newGame = {
            startedAt: new Date(),
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
    // Date stuff
    const dateIsCorrect = artifact?.time.start <= selectedDate && artifact?.time.end >= selectedDate
    const distanceToDate = Math.min(Math.abs(artifact?.time.start - selectedDate), Math.abs(artifact?.time.end - selectedDate))
    const datePoints = dateIsCorrect ? 100 : Math.round(distanceToDate > 300 ? 0 : 100 - (distanceToDate / 3))

    // Country stuff
    const artifactCountry = convertCountries(countries.find(c => artifact?.location.country.includes(c)) || artifact?.location.country)
    const countryIsCorrect = artifactCountry === selectedCountry
    
    // If country is not correct,
    // calculate distance between chosen country centroid and the correct centroid
    let countryPoints = countryIsCorrect ? 100 : 0
    if (!countryIsCorrect) {
      const { distance, isNeighbor, couldNotResolve } = getProximity(selectedCountry, artifactCountry)
      const distanceScore = couldNotResolve ? 0 : Math.round(distance > 1000 ? 0 : 100 - distance / 10)
      countryPoints = isNeighbor ? Math.max(50, distanceScore) : distanceScore
      console.log({ distance, isNeighbor, distanceScore, countryPoints })
    }

    const points = datePoints + countryPoints

    const newGame = { ...game }
    newGame.roundData[game.round - 1] = {
      ...newGame.roundData[game.round - 1],
      guessed: true,
      selectedDate: Number(selectedDate),
      selectedCountry,
      dateIsCorrect,
      distanceToDate,
      datePoints,
      countryPoints,
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
    setLoading(true)
    setIsViewingSummary(false)
    updateGame({ ...game, ongoing: false }, true)
  }

  const viewSummary = () => setIsViewingSummary(true)

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
      startNewGame,
      loading,
      setLoading,
      viewSummary,
      isViewingSummary
    }}>
      {children}
    </GameContext.Provider>
  )
}