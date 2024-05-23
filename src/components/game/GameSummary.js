import { IoIosArrowRoundForward } from "react-icons/io"
import { GameButton } from "../buttons/GameButton"
import { ArtifactInfo } from "../gameui/RoundSummary/components/ArtifactInfo"
import { RoundScore } from "../gameui/RoundSummary/components/RoundScore"
import { YourGuess } from "../gameui/RoundSummary/components/YourGuess"
import { useGame } from "./GameProvider"
import { useState } from "react"
import useUser from "@/hooks/useUser"
import { SignupDialog } from "../dialogs/SignupDialog"
import { Img } from "../html/Img"

export const GameSummary = () => {
  const [signupOpen, setSignupOpen] = useState(false)
  const { user } = useUser()
  const { startNewGame } = useGame()

  return (
    <>
      <SignupDialog open={signupOpen} onClose={() => setSignupOpen(false)} />

      <div css={{ marginTop: '8vh', padding: 4, width: '100vw' }}>
        <GameSummaryUI />
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
      <div className='flex flex-wrap justify-center gap-6 m-2'>
        {game.roundData?.map(round => {
          const imgs = round.artifact?.images.external
          
          return (
            <div className='mb-8 w-full md:w-[calc(48%)] lg:w-[calc(30%)]' css={{
              '@media (min-width: 2400px)': { width: '18%' },
            }}>
              <div className='mb-3 text-xl text-center'>
                <b>Round {round.round}</b>
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
                    width: imgs?.length === 1 ? '100%' : imgs?.length === 2 ? 'calc(50% - 4px)' : 72,
                    margin: '0 4px 4px 0',
                    '&:last-of-type': { marginRight: 0 },
                    borderRadius: 4,
                    cursor: 'pointer',
                    ':hover': { opacity: 0.7, transition: 'all 0.2s' }
                  }} />
                ))}
              </div>
              {/* <div css={{
                width: '100%',
                display: 'flex',
                justifyContent: 'center',
                padding: 20,
                size: '2em',
                '@media (min-width: 800px)': { display: 'none' }
              }}>
                <IconGenerator />
              </div> */}
            </div>
          )
        })}
      </div>
    </div>
  )
}