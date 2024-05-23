import { IoIosArrowRoundForward } from "react-icons/io"
import { GameButton } from "../buttons/GameButton"
import { ArtifactInfo } from "../gameui/RoundSummary/components/ArtifactInfo"
import { RoundScore } from "../gameui/RoundSummary/components/RoundScore"
import { YourGuess } from "../gameui/RoundSummary/components/YourGuess"
import { useGame } from "./GameProvider"
import { MapInteractionCSS } from 'react-map-interaction'
import useMeasure from "react-use-measure"
import useWindowDimensions from "@/hooks/useWindowDimensions"
import { useEffect, useState } from "react"
import { IconGenerator } from "../art/IconGenerator"
import useUser from "@/hooks/useUser"
import { SignupDialog } from "../dialogs/SignupDialog"

export const GameSummary = () => {
  const [signupOpen, setSignupOpen] = useState(false)
  const { user } = useUser()
  const { startNewGame } = useGame()

  const [ref, bounds] = useMeasure()
  const { height, width } = useWindowDimensions()
  const [value, setValue] = useState()

  useEffect(() => {
    if (bounds && height && width) {
      const w = width / bounds.width
      const h = height / bounds.height
      const scale = Math.min(w, h)

      setValue({ scale, translation: { x: w, y: h } })
    }
  }, [bounds])

  return (
    <>
      <SignupDialog open={signupOpen} onClose={() => setSignupOpen(false)} />
      <div css={{ '@media (max-width: 700px)': { display: 'none' } }}>
        <MapInteractionCSS value={value} onChange={v => setValue(v)} maxScale={100}>
          <div ref={ref} css={{ opacity: bounds ? 1 : 0, marginTop: '10vh' }}>
            <GameSummaryUI />
          </div>
        </MapInteractionCSS>
      </div>

      <div css={{ '@media (min-width: 700px)': { display: 'none' } }}>
        <div css={{ marginTop: '8vh', padding: 4, width: '100vw' }}>
          <GameSummaryUI />
        </div>
      </div>

      <div className='fixed p-3 py-4 bottom-0 right-0 z-10 flex flex-wrap items-center select-none'
        css={{ '@media (max-width: 800px)': { width: '100vw' }, borderRadius: '8px 0 0 0' }}>
        {!user?.isLoggedIn && (
          <div className='mr-4 bg-black rounded-lg p-[3px_7px_4px_4px]' css={{
            '@media (max-width: 800px)': { margin: '0 0 8px 0' }
          }}>
            <GameButton
              onClick={() => setSignupOpen(true)}
              css={{
                marginRight: 6,
                background: '#E4C1F4',
                color: '#000000',
                ':hover': { background: '#CCA5DE' },
              }}
            >
              <b>Sign Up</b>
            </GameButton>
            for free to save your games and highscores!
          </div>
        )}
        <GameButton
          onClick={startNewGame}
          css={{
            background: '#7dddc3',
            color: '#000000',
            ':hover': { background: '#40f59a' },
            padding: '3px 12px',
            fontSize: '1.2em',
            width: 300,
            '@media (max-width: 800px)': { width: '100%' },
            boxShadow: '0 0 0 4px black'
          }}
        >
          <IoIosArrowRoundForward className='mr-2' />
          Start New Game
        </GameButton>
      </div>
    </>
  )
}

const GameSummaryUI = () => {
  const { game } = useGame()

  return (
    <div className='flex flex-col items-center w-full'>
      <div className='mb-10 flex flex-col items-center'>
        <div className='text-4xl mb-6'><b>Game Summary</b></div>
        <div className='rounded-xl py-4 px-6 text-3xl overflow-hidden relative flex w-[fit-content] bg-blue-300 text-black'>
          <div>
            <span className='text-black/60 mr-2'>Final Score</span> <b>{game.score}</b> / 1000
          </div>
        </div>
      </div>
      <div className='flex' css={{
        '@media (max-width: 800px)': { flexDirection: 'column' }
      }}>
        {game.roundData?.map(round => {
          
          return (
            <div className='m-2'>
              <div className='mb-2 text-lg text-center'>
                <b>Round {round.round}</b>
              </div>
              <YourGuess {...round} />
              <RoundScore isSummary points={round.points} />
              <ArtifactInfo artifact={round.artifact} style={{ marginTop: 8 }} />
              {round.artifact?.images.external.map((img, i) => (
                <img key={i} src={img} css={{
                  minWidth: 400, marginTop: 16, borderRadius: 4,
                  '@media (max-width: 800px)': { minWidth: '100%', maxWidth: '100%' },
                }} />
              ))}
              <div css={{
                width: '100%',
                display: 'flex',
                justifyContent: 'center',
                padding: 20,
                size: '2em',
                '@media (min-width: 800px)': { display: 'none' }
              }}>
                <IconGenerator />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}