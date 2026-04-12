import { createContext, useCallback, useContext, useEffect, useState, useRef } from "react"
import useUser from "@/hooks/useUser"
import axios from "axios"
import { convertCountries } from "@/lib/artifactUtils"
import { countries } from "@/lib/countries"
import { getProximity } from "@/lib/getProximity"
import { useRouter } from "next/router"
import { useHotkeys } from "react-hotkeys-hook"
import toast from "react-hot-toast"
import { track } from "@/lib/analytics"

const DailyContext = createContext(null)

export const useDaily = () => {
  const context = useContext(DailyContext)
  if (!context) {
    return { game: null, currentRound: null, daily: null }
  }
  return context
}

export const DailyProvider = ({ children }) => {
  const { user } = useUser()
  const router = useRouter()
  const [game, setGame] = useState(null)
  const [daily, setDaily] = useState(null) // { dateKey, rounds, artifactIds (for non-auth) }
  const [selectedDate, setSelectedDate] = useState(0)
  const [selectedCountry, setSelectedCountry] = useState(null)
  const [loading, setLoading] = useState(true)
  const [imagesReadyForTimer, setImagesReadyForTimer] = useState(false)
  const [leaderboard, setLeaderboard] = useState(null)
  const fetchedRef = useRef(false)

  // Fetch today's daily challenge
  useEffect(() => {
    if (fetchedRef.current) return
    fetchedRef.current = true

    const fetchDaily = async () => {
      try {
        const { data } = await axios.get('/api/daily/current')
        setDaily(data.daily)

        if (data.game) {
          // Logged-in user — server gave us the game
          initGame(data.game)
          if (!data.game.completed) {
            track('daily_run_started', { runType: 'daily', dateKey: data.daily.dateKey })
          }
        } else if (data.artifact) {
          // Not logged in — check localStorage for existing daily game.
          // Once completed (even without login), the same game is re-hydrated
          // so non-logged-in users can't replay the daily for a better score.
          // They can still game this by clearing storage / using incognito,
          // but that's an intentional soft-lock — the real sign is a signup CTA.
          const localKey = `daily_${data.daily.dateKey}`
          const localGame = JSON.parse(localStorage.getItem(localKey))

          if (localGame) {
            initGame(localGame)
            if (!localGame.completed) {
              track('daily_run_started', { runType: 'daily', dateKey: data.daily.dateKey })
            }
          } else {
            // Start fresh local daily game
            const newGame = {
              dateKey: data.daily.dateKey,
              startedAt: new Date().toISOString(),
              round: 1,
              rounds: 3,
              score: 0,
              completed: false,
              artifactIds: data.daily.artifactIds,
              roundData: [
                {
                  round: 1,
                  artifactId: data.daily.artifactIds[0],
                  artifact: data.artifact,
                  guessed: false
                }
              ]
            }
            localStorage.setItem(localKey, JSON.stringify(newGame))
            initGame(newGame)
            track('daily_run_started', { runType: 'daily', dateKey: data.daily.dateKey })
          }
        }
      } catch (err) {
        console.error('Failed to fetch daily challenge:', err)
        toast.error('Failed to load daily challenge')
      }
    }

    fetchDaily()
  }, [])

  const initGame = (g) => {
    setGame(g)
    setSelectedDate(0)
    setSelectedCountry(null)
    setImagesReadyForTimer(false)
    setLoading(false)
  }

  const updateGame = async (updatedGame) => {
    if (user?.isLoggedIn && updatedGame._id) {
      try {
        // Strip artifacts before sending to server
        const payload = { ...updatedGame }
        if (Array.isArray(payload.roundData)) {
          payload.roundData = payload.roundData.map(r => {
            const { artifact, ...rest } = r
            return rest
          })
        }
        await axios.post('/api/daily/edit', payload)
      } catch (err) {
        console.error('Failed to save daily game:', err)
        toast.error('Failed to save progress')
      }
    } else if (daily?.dateKey) {
      // Save to localStorage for non-logged-in users
      localStorage.setItem(`daily_${daily.dateKey}`, JSON.stringify(updatedGame))
    }
    setGame(updatedGame)
  }

  // Computed state
  const currentRound = game?.roundData?.find(r => r.round === game.round)
  const artifact = currentRound?.artifact
  const guessed = currentRound?.guessed
  const timedOut = currentRound?.timedOut
  const isViewingSummary = game?.isViewingSummary

  const makeGuess = () => {
    if (!selectedCountry) return toast.error('You have to select a country!')

    // Date scoring
    const dateIsCorrect = artifact?.time.start <= selectedDate && artifact?.time.end >= selectedDate
    const distanceToDate = Math.min(Math.abs(artifact?.time.start - selectedDate), Math.abs(artifact?.time.end - selectedDate))
    const datePoints = dateIsCorrect ? 100 : Math.round(distanceToDate > 300 ? 0 : 100 - (distanceToDate / 3))

    // Country scoring
    const artifactCountry = convertCountries(countries.find(c => artifact?.location.country.includes(c)) || artifact?.location.country)
    const countryIsCorrect = artifactCountry === selectedCountry

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
      timedOut: false,
      selectedDate: Number(selectedDate),
      selectedCountry,
      dateIsCorrect,
      distanceToDate,
      datePoints,
      countryPoints,
      points
    }

    newGame.score += points

    track('daily_round_completed', {
      runType: 'daily',
      round: game.round,
      score: points,
      dateKey: daily?.dateKey
    })

    updateGame(newGame)
  }

  const startNextRound = async () => {
    if (game.round >= game.rounds) return

    setImagesReadyForTimer(false)
    setSelectedCountry(null)
    setSelectedDate(0)

    const nextRoundIndex = game.round // 0-indexed for artifactIds array
    // artifactIds come from daily (logged-in) or stored on the game object (anon)
    const artifactIds = daily?.artifactIds || game.artifactIds
    const nextArtifactId = artifactIds?.[nextRoundIndex]

    if (!nextArtifactId) {
      toast.error('Could not load next artifact')
      return
    }

    const { data: nextArtifact } = await axios.get(`/api/daily/artifact?id=${nextArtifactId}`)

    const newGame = {
      ...game,
      round: game.round + 1,
      roundData: [
        ...game.roundData,
        {
          round: game.round + 1,
          artifactId: nextArtifactId,
          artifact: nextArtifact,
          guessed: false,
          timedOut: false
        }
      ]
    }

    updateGame(newGame)
  }

  const viewSummary = () => {
    const completedGame = {
      ...game,
      isViewingSummary: true,
      completed: true,
      completedAt: new Date().toISOString()
    }

    track('daily_run_completed', {
      runType: 'daily',
      score: game.score,
      completed: true,
      dateKey: daily?.dateKey
    })

    updateGame(completedGame)
  }

  const handleArtifactLoadError = async () => {
    console.error("Daily artifact image failed to load")
    // For daily challenges, we can't swap artifacts — they're fixed.
    // Just mark images as ready so the player can still guess.
    setImagesReadyForTimer(true)
    toast.error("Some images failed to load, but you can still play!")
  }

  const nextStepKey = useCallback(() => {
    const isLastRound = game?.round === game?.rounds
    const currentRoundData = game?.roundData?.find(r => r.round === game.round)
    const isGuessedOrTimedOut = currentRoundData?.guessed || currentRoundData?.timedOut

    if (isGuessedOrTimedOut) {
      if (isLastRound) {
        if (!isViewingSummary) viewSummary()
      } else {
        startNextRound()
      }
    } else {
      makeGuess()
    }
  }, [game, makeGuess, startNextRound, isViewingSummary, viewSummary])

  useHotkeys(
    ['enter', 'space'],
    e => {
      e.preventDefault()
      nextStepKey()
    },
    { filter: () => true },
    [nextStepKey]
  )

  // Fetch leaderboard when viewing summary
  useEffect(() => {
    if (isViewingSummary && daily?.dateKey && !leaderboard) {
      axios.get(`/api/daily/leaderboard?dateKey=${daily.dateKey}`)
        .then(res => setLeaderboard(res.data))
        .catch(err => console.error('Failed to load leaderboard:', err))
    }
  }, [isViewingSummary, daily?.dateKey, leaderboard])

  return (
    <DailyContext.Provider value={{
      game,
      daily,
      currentRound,
      selectedDate,
      setSelectedDate,
      selectedCountry,
      setSelectedCountry,
      artifact,
      guessed,
      timedOut,
      makeGuess,
      startNextRound,
      loading,
      setLoading,
      viewSummary,
      isViewingSummary,
      nextStepKey,
      handleArtifactLoadError,
      imagesReadyForTimer,
      setImagesReadyForTimer,
      leaderboard,
      // Stubs to satisfy components that read from useGame
      selectedTimer: null,
      handleSetSelectedTimer: () => {},
      countdown: null,
      isTimerActive: false,
      splashToShow: null,
      startGameFromSplash: () => {},
      startNewGame: null // No "new game" for daily — it's one per day
    }}>
      {children}
    </DailyContext.Provider>
  )
}
