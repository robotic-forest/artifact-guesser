import { useDaily } from "./DailyProvider"
import { useState, useEffect, useRef } from "react"
import useUser from "@/hooks/useUser"
import { SignupDialog } from "../dialogs/SignupDialog"
import { Simulator, SimulatorButton } from "../art/Simulator"
import { FancyBorderButton } from "../art/FancyBorder"
import { IconGenerator } from "../art/IconGenerator"
import { MasonryLayout } from "../layout/MasonryLayout"
import { Img } from "../html/Img"
import { YourGuess } from "../gameui/RoundSummary/components/YourGuess"
import { RoundScore } from "../gameui/RoundSummary/components/RoundScore"
import { ArtifactInfo } from "../gameui/RoundSummary/components/ArtifactInfo"
import { BiLinkExternal } from "react-icons/bi"
import { FaTrophy } from "react-icons/fa"
import { IoMdPeople } from "react-icons/io"
import Link from "next/link"
import toast from "react-hot-toast"
import axios from "axios"
import { calcScoreColors } from "../game/GameSummary"
import { track } from "@/lib/analytics"

export const DailySummary = () => {
  const { game, daily, leaderboard } = useDaily()

  return (
    <div css={{
      padding: '56px 48px 48px 48px',
      '@media (max-width: 800px)': { padding: '64px 6px 6px 6px' },
    }}>
      <Simulator
        top={<DailyScore leaderboard={leaderboard} />}
        bottom={<DailyRoundReview game={game} />}
      />
    </div>
  )
}

const DailyScore = ({ leaderboard }) => {
  const { game, daily, refreshLeaderboard } = useDaily()
  const { user } = useUser()
  const [signupOpen, setSignupOpen] = useState(false)
  const [challengeUrl, setChallengeUrl] = useState(null)
  const [teaseImg, setTeaseImg] = useState('')
  const [shareCardErrored, setShareCardErrored] = useState(false)
  const claimedRef = useRef(false)

  // Anonymous-completed daily → user signs up → transfer server-side doc to
  // their account so the score lands on today's leaderboard.
  useEffect(() => {
    if (!user?.isLoggedIn) return
    if (!game?.completed) return
    if (!daily?.dateKey) return
    if (claimedRef.current) return

    let anonymousId = null
    try { anonymousId = localStorage.getItem('ag_anon_id') } catch {}
    if (!anonymousId) return

    claimedRef.current = true
    axios.post('/api/daily/claim', { dateKey: daily.dateKey, anonymousId })
      .then(() => {
        toast.success('Score saved to the leaderboard!')
        refreshLeaderboard?.()
      })
      .catch(err => {
        const code = err?.response?.data?.error
        if (code === 'Daily already claimed') return
        if (code === 'No anonymous daily run found for this device') return
        console.error('Failed to claim daily run:', err)
      })
  }, [user?.isLoggedIn, game?.completed, daily?.dateKey])

  // Fetch a random artifact image for the share card (not from today's run)
  useEffect(() => {
    axios.get('/api/daily/tease')
      .then(({ data }) => { if (data.image) setTeaseImg(data.image) })
      .catch(() => {})
  }, [])

  const dateStr = daily?.dateKey
    ? new Date(daily.dateKey + 'T12:00:00').toLocaleDateString('en-US', {
        weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
      })
    : 'Today'

  // Pre-create the challenge as soon as the summary renders so the Share
  // Challenge click handler can fire navigator.share synchronously (no
  // awaits between click and share = user-gesture token stays valid).
  // Abort in-flight request on cleanup so React strict-mode double-effects
  // don't create duplicate challenge docs.
  const challengeCreatedRef = useRef(false)
  useEffect(() => {
    if (!daily?.dateKey || challengeUrl || challengeCreatedRef.current) return
    challengeCreatedRef.current = true
    const controller = new AbortController()
    let anonymousId = null
    try { if (!user?.isLoggedIn) anonymousId = localStorage.getItem('ag_anon_id') } catch {}
    axios.post('/api/challenges/create', {
      dateKey: daily.dateKey,
      score: game.score,
      username: user?.username || 'A friend',
      anonymousId,
    }, { signal: controller.signal })
      .then(({ data }) => {
        setChallengeUrl(`${window.location.origin}/challenge/${data.challengeId}`)
      })
      .catch(err => {
        if (axios.isCancel?.(err) || err?.name === 'CanceledError') return
        challengeCreatedRef.current = false // allow retry on real failures
        console.warn('Challenge pre-create failed:', err)
      })
    return () => controller.abort()
  }, [daily?.dateKey])

  const shareText = `I scored ${game.score}/600 on Today's Run at Artifact Guesser. Can you beat me?`

  const handleCopyLink = () => {
    if (!challengeUrl) {
      toast.error('Challenge link still loading — try again in a moment')
      return
    }

    track('challenge_sent', {
      runType: 'daily',
      score: game.score,
      dateKey: daily?.dateKey
    })

    navigator.clipboard.writeText(`${shareText}\n${challengeUrl}`)
      .then(() => toast.success('Challenge link copied!'))
      .catch(() => toast.error('Could not copy to clipboard'))
  }

  const handleNativeShare = () => {
    if (!challengeUrl) {
      toast.error('Challenge link still loading — try again in a moment')
      return
    }

    track('score_shared', { runType: 'daily', score: game.score, dateKey: daily?.dateKey })

    if (navigator.share) {
      navigator.share({ text: shareText, url: challengeUrl })
        .catch(err => {
          if (err?.name === 'AbortError') return
        })
    }
  }

  return (
    <>
      <SignupDialog open={signupOpen} onClose={() => setSignupOpen(false)} />
      <div className='flex flex-col items-center relative'>
        <div className='flex items-center text-2xl mt-4 mb-4 font-mono font-bold flex-wrap justify-center'>
          <div className='mr-4 mt-1'>
            <IconGenerator />
          </div>
          <span>TODAY'S RUN</span>
          <span className='ml-3 text-base font-normal text-white'>{dateStr}</span>
          <div className='ml-4 mt-1' css={{ transform: 'scaleX(-1)' }}>
            <IconGenerator />
          </div>
        </div>

        <FancyBorderButton disabled style={{ marginBottom: 16 }}>
          <div className='text-2xl m-2 flex flex-wrap items-center justify-center'>
            <span className='mr-3' css={{ whiteSpace: 'nowrap' }}>
              {game?.score === 600 ? 'PERFECT SCORE!' : 'Final Score'}
            </span>
            <span css={{ whiteSpace: 'nowrap' }}>
              <b css={{ color: calcDailyScoreColor(game?.score) }}>{game.score}</b> / 600
            </span>
          </div>
        </FancyBorderButton>

        <DailyLeaderboard leaderboard={leaderboard} />

        {!user?.isLoggedIn && game?.completed && (
          <div
            className='mb-6 mt-2 w-full max-w-lg p-4 rounded text-center'
            css={{
              background: 'linear-gradient(135deg, rgba(228,193,244,0.15), rgba(204,165,222,0.05))',
              border: '1px solid rgba(228,193,244,0.5)',
            }}
          >
            <div className='text-white text-lg font-bold mb-1'>
              Save your <span css={{ color: calcDailyScoreColor(game?.score) }}>{game.score}</span> / 600 to the leaderboard
            </div>
            <div className='text-white/70 text-sm mb-3'>
              Sign up in 10 seconds — your run today gets recorded and you can track your streak.
            </div>
            <button
              onClick={() => setSignupOpen(true)}
              className='text-lg'
              css={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '8px 22px',
                color: '#1a0f1f',
                fontWeight: 800,
                letterSpacing: 0.3,
                border: '3px outset',
                borderColor: '#ffffff77 #00000077 #00000077 #ffffff77',
                cursor: 'pointer',
                background: 'linear-gradient(120deg, #ffd97d 0%, #f5b8e8 50%, #b58bff 100%)',
                boxShadow: '0 0 60px 0 #b58bff44, 0 0 30px 0 #f5b8e833',
                '&:hover': {
                  filter: 'brightness(1.1)',
                  borderColor: '#ffffffaa #000000aa #000000aa #ffffffaa',
                },
                '&:active': {
                  border: '3px inset',
                  borderColor: '#00000077 #ffffff77 #ffffff77 #00000077',
                },
              }}
            >
              <FaTrophy css={{ marginRight: 10, color: '#7a2d6b' }} />
              Sign Up &amp; Save My Score
            </button>
          </div>
        )}

        {/* Share card preview + primary CTA */}
        <div className='mb-6 w-full max-w-lg flex flex-col items-center'>
          {teaseImg && !shareCardErrored && (
            <>
              <div className='text-white text-base mb-2 text-center font-bold uppercase tracking-wider'>
                Your share card
              </div>
              <div className='text-white text-base mb-3 text-center max-w-md'>
                This image previews on Twitter, Discord, iMessage and more when your link is shared
              </div>
              <img
                src={`/api/og/daily?score=${game.score}&by=${encodeURIComponent(user?.username || '')}&dateKey=${daily?.dateKey || ''}&tease=${encodeURIComponent(teaseImg)}`}
                className='w-full shadow-lg mb-4'
                css={{ border: '1px solid rgba(255,255,255,0.15)' }}
                alt='Share card preview'
                onError={() => setShareCardErrored(true)}
              />
            </>
          )}

          <div className='text-white text-base mb-8 text-center max-w-md'>
            <b>Send the link to a friend</b> — they'll play the <b>exact same three artifacts</b>{' '}
            you just played and you can compare scores.
          </div>

          <SimulatorButton
            onClick={handleCopyLink}
            css={{
              background: '#e67e22',
              boxShadow: '0 0 120px 0 #e67e2244, 0 0 60px 0 #e67e2233',
              ':hover': { filter: 'brightness(1.1)', transition: 'all 0.2s' },
              width: '100%',
              maxWidth: 400,
              padding: '8px 16px',
            }}
          >
            <span className='inline-flex items-center text-lg'>
              <IoMdPeople className='mr-2' />
              <b>Copy Challenge Link</b>
            </span>
          </SimulatorButton>

        </div>

        {/* Secondary actions */}
        <div className='flex items-center justify-center flex-wrap gap-4 mb-6'>
          <Link href='/'>
            <SimulatorButton css={{
              boxShadow: '0 0 80px 0 #ffffff44',
              ':hover': { filter: 'brightness(1.1)', transition: 'all 0.2s' }
            }}>
              <b>Resume Personal Game</b>
            </SimulatorButton>
          </Link>
        </div>

      </div>
    </>
  )
}

const DailyLeaderboard = ({ leaderboard }) => {
  if (!leaderboard?.scores?.length) return null

  return (
    <div className='flex flex-col items-center mb-8 w-full max-w-lg'>
      <div className='flex text-xl my-4 font-mono font-bold'>
        <FaTrophy className='mr-3 text-yellow-400' />
        DAILY LEADERBOARD
        <FaTrophy className='ml-3 text-yellow-400' />
      </div>
      <div className='w-full'>
        {leaderboard.scores.map((entry, i) => (
          <div
            key={i}
            className='flex items-center justify-between px-4 py-2 mb-1 rounded'
            css={{
              background: i === 0 ? '#c9ae5f33' : i < 3 ? '#ffffff11' : '#ffffff08',
              border: i === 0 ? '1px solid #c9ae5f55' : '1px solid transparent'
            }}
          >
            <div className='flex items-center'>
              <span className='w-8 text-white/50 font-mono text-sm'>#{entry.rank}</span>
              <span className={i === 0 ? 'font-bold text-yellow-300' : ''}>
                {entry.username}
              </span>
            </div>
            <div className='font-mono'>
              <b css={{ color: calcDailyScoreColor(entry.score) }}>{entry.score}</b>
              <span className='text-white/40'> / 600</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

const DailyRoundReview = ({ game }) => {
  return (
    <div className='flex flex-col items-center'>
      <div className='flex text-2xl my-4 font-mono font-bold'>
        <div className='mr-4'>
          <IconGenerator />
        </div>
        ROUND REVIEW
        <div className='ml-4' css={{ transform: 'scaleX(-1)' }}>
          <IconGenerator />
        </div>
      </div>
      <div className='flex flex-wrap justify-center gap-6 m-2'>
        {game.roundData?.map(round => {
          const imgs = round.artifact?.images?.external

          return (
            <div key={round.round} className='mb-8 w-full md:w-[calc(48%)] lg:w-[calc(30%)]'>
              <div className='mb-3 text-xl text-center font-mono'>
                Round <b>{round.round}</b>
              </div>
              <YourGuess {...round} />
              <RoundScore isSummary points={round.points} />
              <ArtifactInfo artifact={round.artifact} style={{ marginTop: 8 }} />
              {imgs && (
                <>
                  <div className='mb-2 mt-3'>Images (Click to zoom):</div>
                  <MasonryLayout>
                    {imgs.map((img, i) => (
                      <Img key={i} src={img} css={{
                        width: '100%',
                        height: 'auto',
                        margin: '0 4px 4px 0',
                        '&:last-of-type': { marginRight: 0 },
                        borderRadius: 4,
                        cursor: 'pointer',
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

const calcDailyScoreColor = (points) => {
  if (points === 600) return '#00ff00'
  if (points >= 420) return '#7ae990'
  if (points >= 300) return '#ffc045'
  return '#ff8a45'
}
