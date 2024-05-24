import { IoIosArrowRoundForward } from "react-icons/io"
import { GameButton } from "../buttons/GameButton"
import { ArtifactInfo } from "../gameui/RoundSummary/components/ArtifactInfo"
import { RoundScore } from "../gameui/RoundSummary/components/RoundScore"
import { YourGuess, calcColors } from "../gameui/RoundSummary/components/YourGuess"
import { useGame } from "./GameProvider"
import { useState } from "react"
import useUser from "@/hooks/useUser"
import { SignupDialog } from "../dialogs/SignupDialog"
import { Img } from "../html/Img"
import { Simulator, SimulatorButton } from "../art/Simulator"
import { FancyBorderButton } from "../art/FancyBorder"
import { useHighscore } from "@/hooks/useHighscore"
import { IconGenerator } from "../art/IconGenerator"

export const GameSummary = () => {

  return (
    <div css={{
      padding: '56px 48px 48px 48px',
      '@media (max-width: 800px)': { padding: '32px 6px 6px 6px' },
    }}>
      <Simulator
        top={<GameScore />}
        bottom={<RoundReview />}
      />
    </div>
  )
}

const GameScore = () => {
  const { user } = useUser()
  const { highscore, gameId } = useHighscore()
  const { game, startNewGame } = useGame()
  const [signupOpen, setSignupOpen] = useState(false)

  const newHighscore = gameId === game._id
  console.log(gameId, game._id)

  return (
    <>
      <SignupDialog open={signupOpen} onClose={() => setSignupOpen(false)} />
      <div className='mb-4 flex flex-col items-center'>
        <div className='flex text-2xl mt-4 font-mono font-bold'>
          <div className='mr-4'>
            <IconGenerator />
          </div>
          GAME SUMMARY
          <div className='ml-4' css={{ transform: 'scaleX(-1)' }}>
            <IconGenerator />
          </div>
        </div>
        <FancyBorderButton disabled style={{ marginBottom: 16 }}>
          <div className='text-2xl m-2'>
            <span className='mr-2'>Final Score</span> <b css={{ color: calcColors(game.score / 10) }}>{game.score}</b> / 1000
          </div>
        </FancyBorderButton>
        {highscore && (
          <div className='text-lg mb-[24px]'>
            <span className='mr-2'>Your highscore:</span>
            <span className='text-xl'>{highscore} / 1000</span>
          </div>
        )}

        {!user?.isLoggedIn && (
          <div className='mb-4 bg-black rounded-lg p-[3px_7px_4px_4px]' css={{
            '@media (max-width: 800px)': { margin: '0 0 8px 0' }
          }}>
            <GameButton
              onClick={() => setSignupOpen(true)}
              css={{
                marginRight: 8,
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
        <SimulatorButton onClick={startNewGame} >
          Start New Game
        </SimulatorButton>
      </div>
    </>
  )
}


const RoundReview = () => {
  const { game } = useGame()

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
          const imgs = round.artifact?.images.external
          
          return (
            <div className='mb-8 w-full md:w-[calc(48%)] lg:w-[calc(30%)]' css={{
              '@media (min-width: 2400px)': { width: '18%' },
            }}>
              <div className='mb-3 text-xl text-center font-mono'>
                Round <b>{round.round}</b>
              </div>
              <YourGuess {...round} />
              <RoundScore isSummary points={round.points} />
              <ArtifactInfo artifact={round.artifact} style={{ marginTop: 8 }} />
              <div className='mb-2 mt-3'>
                Images (Click to zoom):
              </div>
              <div className='flex flex-wrap'>
                {imgs.map((img, i) => (
                  <Img key={i} src={img} css={{
                    width: imgs?.length === 1 ? '100%' : imgs?.length === 2 ? 'calc(50% - 4px)' : '17.5%',
                    margin: '0 4px 4px 0',
                    '&:last-of-type': { marginRight: 0 },
                    borderRadius: 4,
                    cursor: 'pointer',
                    ':hover': { opacity: 0.7, transition: 'all 0.2s' }
                  }} />
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}