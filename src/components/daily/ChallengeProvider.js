import { createContext, useCallback, useContext, useEffect, useState, useRef } from "react"
import useUser from "@/hooks/useUser"
import axios from "axios"
import { convertCountries } from "@/lib/artifactUtils"
import { countries } from "@/lib/countries"
import { getProximity } from "@/lib/getProximity"
import { useHotkeys } from "react-hotkeys-hook"
import toast from "react-hot-toast"
import { track } from "@/lib/analytics"

const ChallengeContext = createContext(null)

export const useChallenge = () => {
  const context = useContext(ChallengeContext)
  if (!context) return { game: null, challenge: null }
  return context
}

export const ChallengeProvider = ({ challengeId, children }) => {
  const { user } = useUser()
  const [game, setGame] = useState(null)
  const [challenge, setChallenge] = useState(null)
  const [selectedDate, setSelectedDate] = useState(0)
  const [selectedCountry, setSelectedCountry] = useState(null)
  const [loading, setLoading] = useState(true)
  const [imagesReadyForTimer, setImagesReadyForTimer] = useState(false)
  const fetchedRef = useRef(false)

  useEffect(() => {
    if (fetchedRef.current || !challengeId) return
    fetchedRef.current = true

    const fetchChallenge = async () => {
      try {
        const { data } = await axios.get(`/api/challenges/${challengeId}`)
        setChallenge(data.challenge)

        // Check localStorage for existing attempt
        const localKey = `challenge_${challengeId}`
        const localGame = JSON.parse(localStorage.getItem(localKey))

        if (localGame && !localGame.completed) {
          initGame(localGame)
        } else if (!localGame) {
          const newGame = {
            challengeId: data.challenge._id,
            startedAt: new Date().toISOString(),
            round: 1,
            rounds: data.challenge.rounds,
            score: 0,
            completed: false,
            artifactIds: data.challenge.artifactIds,
            roundData: [
              {
                round: 1,
                artifactId: data.challenge.artifactIds[0],
                artifact: data.artifact,
                guessed: false
              }
            ]
          }
          localStorage.setItem(localKey, JSON.stringify(newGame))
          initGame(newGame)

          track('challenge_opened', {
            runType: 'challenge',
            challengeId
          })
        } else {
          // Already completed — show the summary
          initGame(localGame)
        }
      } catch (err) {
        console.error('Failed to fetch challenge:', err)
        toast.error('Challenge not found')
      }
    }

    fetchChallenge()
  }, [challengeId])

  const initGame = (g) => {
    setGame(g)
    setSelectedDate(0)
    setSelectedCountry(null)
    setImagesReadyForTimer(false)
    setLoading(false)
  }

  const updateGame = (updatedGame) => {
    if (challengeId) {
      localStorage.setItem(`challenge_${challengeId}`, JSON.stringify(updatedGame))
    }
    setGame(updatedGame)
  }

  const currentRound = game?.roundData?.find(r => r.round === game.round)
  const artifact = currentRound?.artifact
  const guessed = currentRound?.guessed
  const timedOut = currentRound?.timedOut
  const isViewingSummary = game?.isViewingSummary

  const makeGuess = () => {
    if (!selectedCountry) return toast.error('You have to select a country!')

    const dateIsCorrect = artifact?.time.start <= selectedDate && artifact?.time.end >= selectedDate
    const distanceToDate = Math.min(Math.abs(artifact?.time.start - selectedDate), Math.abs(artifact?.time.end - selectedDate))
    const datePoints = dateIsCorrect ? 100 : Math.round(distanceToDate > 300 ? 0 : 100 - (distanceToDate / 3))

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

    updateGame(newGame)
  }

  const startNextRound = async () => {
    if (game.round >= game.rounds) return

    setImagesReadyForTimer(false)
    setSelectedCountry(null)
    setSelectedDate(0)

    const nextArtifactId = game.artifactIds[game.round]
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

    track('challenge_completed', {
      runType: 'challenge',
      challengeId,
      score: game.score,
      completed: true
    })

    updateGame(completedGame)
  }

  const handleArtifactLoadError = async () => {
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
    e => { e.preventDefault(); nextStepKey() },
    { filter: () => true },
    [nextStepKey]
  )

  return (
    <ChallengeContext.Provider value={{
      game,
      challenge,
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
      // Stubs
      selectedTimer: null,
      handleSetSelectedTimer: () => {},
      countdown: null,
      isTimerActive: false,
      splashToShow: null,
      startGameFromSplash: () => {},
      startNewGame: null
    }}>
      {children}
    </ChallengeContext.Provider>
  )
}
