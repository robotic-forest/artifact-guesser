import { createContext, useCallback, useContext, useEffect, useState } from "react"
import useUser from "../../hooks/useUser"
import axios from "axios"
import { convertCountries } from "@/lib/artifactUtils"
import { countries } from "@/lib/countries"
import { getProximity } from "@/lib/getProximity"
import useSWR from "swr"
import { useHotkeys } from "react-hotkeys-hook"
import toast from "react-hot-toast"

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
  const { data, mutate } = useSWR(user?.isLoggedIn && '/api/games/current')
  const [isFullscreen, setIsFullscreen] = useState(false)

  const initGame = g => {
    setGame(g)
    setSelectedDate(g.roundData[g.round - 1].selectedDate || 0)
    setSelectedCountry(g.roundData[g.round - 1].selectedCountry || null)
  }

  // Sync with DB
  useEffect(() => { if (data) initGame(data) }, [data])

  // Reset game if logged out mid-game
  useEffect(() => {
    if (game?._id && user && !user?.isLoggedIn) {
      setGame(null)
    }
  }, [user])

  // if not logged in, get from localStorage, otherwise initialize game
  useEffect(() => {
    const localGame = async () => {
      if (user && !user?.isLoggedIn) {
        // Attempt fetch from localstorage
        const localG = JSON.parse(localStorage.getItem('game'))

        if (localG) initGame(localG)
        else {
          const mode = localStorage.getItem('mode')

          const newArtifact = await getRandomArtifact(null, mode)
          const newGame = {
            startedAt: new Date(),
            round: 1,
            rounds: 5,
            score: 0,
            mode: mode || 'Balanced',
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

    !game && localGame()
  }, [user, game])

  const updateGame = async (updatedGame, startNew, newMode) => {
    !startNew && setGame(updatedGame)

    if (user?.isLoggedIn) {
      const dbGame = { ...updatedGame, newMode }
      await axios.post('/api/games/edit', dbGame)
      if (startNew) {
        await mutate()
      }
    } else {
      if (startNew) {
        localStorage.removeItem('game')
        if (newMode) localStorage.setItem('mode', newMode)
        setGame(null)
      } else localStorage.setItem('game', JSON.stringify(updatedGame))
    }
  }

  const currentRound = game?.roundData?.find(round => round.round === game.round)
  const artifact = currentRound?.artifact

  const guessed = currentRound?.guessed  

  const makeGuess = () => {
    if (!selectedCountry) return toast.error('You have to select a country!')
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
    setIsFullscreen(false)

    updateGame(newGame)
  }

  const startNextRound = async () => {
    if (game.round === game.rounds) return

    setSelectedCountry(null)
    setSelectedDate(0)
    setLoading(true)

    const newArtifact = await getRandomArtifact(game, game.mode)
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

  const startNewGame = ({ mode }) => {
    setSelectedCountry(null)
    setSelectedDate(0)
    setLoading(true)
    updateGame({ ...game, ongoing: false }, true, mode)
  }

  const isViewingSummary = game?.isViewingSummary
  const viewSummary = () => {
    if (!user.isLoggedIn) axios.post('/api/games/noauth/log')
    updateGame({ ...game, isViewingSummary: true })
  }

  const handleArtifactLoadError = async () => {
    setLoading(true)
    const newArtifact = await getRandomArtifact(game, game.mode)
    const newGame = {
      ...game,
      roundData: game.roundData.map((round, i) => {
        if (i === game.round - 1) {
          return {
            ...round,
            artifactId: newArtifact._id,
            artifact: newArtifact
          }
        }
        return round
      })
    }

    // Mark artifact as problematic, so it won't be shown again
    await axios.post(`/api/artifacts/${artifact._id}/edit`, { problematic: true, problem: 'no image' })

    updateGame(newGame)
  }

  const nextStepKey = useCallback(() => {
    const isLastRound = game?.round === game?.rounds

    if (guessed) {
      if (isLastRound) {
        if (isViewingSummary) startNewGame()
        else viewSummary()
      } else startNextRound()
    } else makeGuess()
  }, [
    game,
    makeGuess,
    startNextRound,
    guessed,
    isViewingSummary,
    viewSummary,
    startNewGame
  ])

  useHotkeys(
    ['enter', 'space'],
    e => {
      e.preventDefault()
      nextStepKey()
    },
    { filter: () => true },
    [nextStepKey]
  )

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
      isViewingSummary,
      nextStepKey,
      handleArtifactLoadError,
      isFullscreen,
      setIsFullscreen,
    }}>
      {children}
    </GameContext.Provider>
  )
}

// utils

const getRandomArtifact = async (game, mode) => {
  const pickNew = Math.random() > 0.5
  const { data: newArtifact } = await axios.get(`/api/artifacts/random?mode=${mode || 'Balanced'}`)

  if (game) {
    const existingCountries = game.roundData.map(r => r.artifact.location.country)
    if (existingCountries.includes(newArtifact.location.country) && pickNew) {
      return getRandomArtifact(null, mode)
    }
  }

  return newArtifact
}