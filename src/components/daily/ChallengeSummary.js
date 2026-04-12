import { useChallenge } from "./ChallengeProvider"
import { useState } from "react"
import { Simulator, SimulatorButton } from "../art/Simulator"
import { FancyBorderButton } from "../art/FancyBorder"
import { IconGenerator } from "../art/IconGenerator"
import { MasonryLayout } from "../layout/MasonryLayout"
import { Img } from "../html/Img"
import { YourGuess } from "../gameui/RoundSummary/components/YourGuess"
import { RoundScore } from "../gameui/RoundSummary/components/RoundScore"
import { ArtifactInfo } from "../gameui/RoundSummary/components/ArtifactInfo"
import { FaShare } from "react-icons/fa"
import { IoMdPeople } from "react-icons/io"
import Link from "next/link"
import toast from "react-hot-toast"
import axios from "axios"
import useUser from "@/hooks/useUser"
import { track } from "@/lib/analytics"

export const ChallengeSummary = () => {
  const { game, challenge } = useChallenge()

  return (
    <div css={{
      padding: '56px 48px 48px 48px',
      '@media (max-width: 800px)': { padding: '64px 6px 6px 6px' },
    }}>
      <Simulator
        top={<ChallengeScore />}
        bottom={<ChallengeRoundReview game={game} />}
      />
    </div>
  )
}

const ChallengeScore = () => {
  const { game, challenge } = useChallenge()
  const { user } = useUser()

  const yourScore = game?.score || 0
  const theirScore = challenge?.challengerScore || 0
  const youWon = yourScore > theirScore
  const tie = yourScore === theirScore

  const resultText = tie
    ? "It's a tie!"
    : youWon
      ? `You beat ${challenge?.challengerUsername}!`
      : `${challenge?.challengerUsername} wins!`

  const resultColor = tie ? '#ffc045' : youWon ? '#7ae990' : '#ff8a45'

  const handleShareChallenge = async () => {
    const shareUrl = typeof window !== 'undefined' ? window.location.href : ''
    const text = `I scored ${yourScore}/600 on this Artifact Guesser challenge! Can you beat me?`

    // Create a new challenge link for the recipient to re-challenge
    try {
      const { data } = await axios.post('/api/challenges/create', {
        dateKey: challenge?.dateKey,
        score: yourScore,
        username: user?.username || 'A friend'
      })

      const challengeUrl = `${window.location.origin}/challenge/${data.challengeId}`
      const fullText = `${text}\n${challengeUrl}`

      track('challenge_sent', {
        runType: 'challenge',
        challengeId: data.challengeId,
        score: yourScore
      })

      if (navigator.share) {
        try {
          await navigator.share({ text, url: challengeUrl })
          return
        } catch {}
      }

      await navigator.clipboard.writeText(fullText)
      toast.success('Challenge link copied!')
    } catch {
      toast.error('Failed to create challenge link')
    }
  }

  return (
    <div className='flex flex-col items-center relative'>
      <div className='flex text-2xl mt-4 font-mono font-bold'>
        <div className='mr-4 mt-1'><IconGenerator /></div>
        CHALLENGE RESULT
        <div className='ml-4 mt-1' css={{ transform: 'scaleX(-1)' }}><IconGenerator /></div>
      </div>

      {/* Score comparison */}
      <div className='flex items-center justify-center gap-8 my-6 w-full max-w-lg'>
        <div className='text-center flex-1'>
          <div className='text-white/60 text-sm mb-1'>You</div>
          <div className='text-3xl font-bold font-mono' css={{ color: youWon || tie ? '#7ae990' : '#ff8a45' }}>
            {yourScore}
          </div>
          <div className='text-white/40 text-sm'>/600</div>
        </div>
        <div className='text-2xl font-bold text-white/30'>vs</div>
        <div className='text-center flex-1'>
          <div className='text-white/60 text-sm mb-1'>{challenge?.challengerUsername}</div>
          <div className='text-3xl font-bold font-mono' css={{ color: !youWon && !tie ? '#7ae990' : '#ff8a45' }}>
            {theirScore}
          </div>
          <div className='text-white/40 text-sm'>/600</div>
        </div>
      </div>

      <FancyBorderButton disabled style={{ marginBottom: 24 }}>
        <div className='text-xl m-2 font-bold' css={{ color: resultColor }}>
          {resultText}
        </div>
      </FancyBorderButton>

      <div className='flex items-center justify-center flex-wrap gap-4 mb-6'>
        <SimulatorButton
          onClick={handleShareChallenge}
          css={{
            background: '#e67e22',
            boxShadow: '0 0 80px 0 #e67e2244',
            ':hover': { filter: 'brightness(1.1)', transition: 'all 0.2s' }
          }}
        >
          <span className='inline-flex items-center'>
            <IoMdPeople className='mr-2' />
            <b>Challenge a Friend</b>
          </span>
        </SimulatorButton>

        {challenge?.dateKey !== new Date().toISOString().slice(0, 10) && (
          <Link href='/daily'>
            <SimulatorButton css={{
              background: '#4f95ff',
              boxShadow: '0 0 80px 0 #4f95ff44',
              ':hover': { filter: 'brightness(1.1)', transition: 'all 0.2s' }
            }}>
              <b>Play Today's Run</b>
            </SimulatorButton>
          </Link>
        )}

        <Link href='/'>
          <SimulatorButton css={{
            boxShadow: '0 0 80px 0 #ffffff44',
            ':hover': { filter: 'brightness(1.1)', transition: 'all 0.2s' }
          }}>
            <b>Play Personal Game</b>
          </SimulatorButton>
        </Link>
      </div>
    </div>
  )
}

const ChallengeRoundReview = ({ game }) => {
  return (
    <div className='flex flex-col items-center'>
      <div className='flex text-2xl my-4 font-mono font-bold'>
        <div className='mr-4'><IconGenerator /></div>
        ROUND REVIEW
        <div className='ml-4' css={{ transform: 'scaleX(-1)' }}><IconGenerator /></div>
      </div>
      <div className='flex flex-wrap justify-center gap-6 m-2'>
        {game.roundData?.map(round => {
          const imgs = round.artifact?.images?.external

          return (
            <div key={round.round} className='mb-8 w-full md:w-[calc(48%)] lg:w-[calc(30%)]'>
              <div className='mb-3 text-xl text-center font-mono'>Round <b>{round.round}</b></div>
              <YourGuess {...round} />
              <RoundScore isSummary points={round.points} />
              <ArtifactInfo artifact={round.artifact} style={{ marginTop: 8 }} />
              {imgs && (
                <>
                  <div className='mb-2 mt-3'>Images (Click to zoom):</div>
                  <MasonryLayout>
                    {imgs.map((img, i) => (
                      <Img key={i} src={img} css={{
                        width: '100%', height: 'auto', margin: '0 4px 4px 0',
                        '&:last-of-type': { marginRight: 0 },
                        borderRadius: 4, cursor: 'pointer',
                        ':hover': { opacity: 0.7, transition: 'all 0.2s' }
                      }} />
                    ))}
                  </MasonryLayout>
                </>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
