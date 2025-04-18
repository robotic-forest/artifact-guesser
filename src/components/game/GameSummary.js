import { Button } from "../buttons/Button" // Added Button import
import { GameButton } from "../buttons/GameButton"
import { ArtifactInfo } from "../gameui/RoundSummary/components/ArtifactInfo"
import { RoundScore } from "../gameui/RoundSummary/components/RoundScore"
import { YourGuess } from "../gameui/RoundSummary/components/YourGuess"
import { useGame } from "./GameProvider"
import { useState } from "react"
import useUser from "@/hooks/useUser"
import { SignupDialog } from "../dialogs/SignupDialog"
import { Img } from "../html/Img"
import { Simulator, SimulatorButton } from "../art/Simulator"
import { FancyBorderButton } from "../art/FancyBorder"
import dynamic from 'next/dynamic'; // Import dynamic
import { useHighscore } from "@/hooks/games/useHighscore"
import { IconGenerator } from "../art/IconGenerator"
import AAAAAA, { Shake } from "../art/AAAAAA"
import useAAAAtoast from '@/hooks/useAAAAtoast'; // Import the hook
import { MasonryLayout } from "../layout/MasonryLayout"
import { BiLinkExternal } from "react-icons/bi"
import Link from "next/link"
import { Tag } from "../tag/Tag"
import { ModeButton, modes } from "../gameui/ModeButton"
import { SocialMedia } from "../moloch/components/SocialMedia"
import toast from "react-hot-toast"
import { generateInsult } from "@/hooks/useInsult"
import { GiTimeBomb } from "react-icons/gi"; // Added Timer Icon

// Dynamically import AAAAAAConfetti
const AAAAAAConfettiDynamic = dynamic(() => import('@/components/art/AAAAAAConfetti'), {
  ssr: false,
});

// Define timer options (null represents 'No Timer')
const timerOptions = [5, 15, 30, 60, null];

// Re-define RoundButton locally for GameSummary (copied from Options.js)
const RoundButton = ({ css, isActive, disabled, children, ...p }) => (
  <Button
    variant='outlined'
    css={{
      background: isActive ? 'var(--primaryColor)' : 'var(--backgroundColorBarelyLight)',
      color: isActive ? '#000000' : '#ffffff',
      cursor: disabled ? 'not-allowed' : 'pointer',
      '&:hover': {
        background: disabled
          ? isActive ? 'var(--primaryColor)' : 'var(--backgroundColorBarelyLight)'
          : isActive ? 'var(--primaryColorLight)' : 'var(--backgroundColorLight)',
        color: isActive ? '#000000' : '#ffffff',
        boxShadow: 'none',
      },
      border: '1px outset',
      borderColor: '#ffffff77 #00000077 #00000077 #ffffff77',
      boxShadow: 'none',
      borderRadius: 0,
      marginRight: 4,
      padding: '4px 8px',
      minWidth: '40px',
      textAlign: 'center',
      ...css
    }}
    {...p}
    disabled={disabled}
  >
    {children}
  </Button>
);


export const GameSummary = ({ game: playedGame }) => {
  const { game: currentGame, startNewGame, selectedTimer, handleSetSelectedTimer } = useGame(); // Get timer state and handler

  const game = playedGame || currentGame; // Use playedGame if provided (viewing old summary), else current game state

  // Determine if we are viewing a summary of a *past* game or the *current* game's summary.
  // startNewGame is only available for the current game summary.
  const isPlayed = !startNewGame;

  // Pass timer state down only if it's the active game summary screen
  const gameScoreProps = isPlayed
    ? { game, isPlayed } // Viewing old summary, don't pass startNewGame or timer handlers
    : { game, startNewGame, selectedTimer, handleSetSelectedTimer, isPlayed }; // Current summary, pass everything

  return (
    <div css={{
      padding: '56px 48px 48px 48px',
      '@media (max-width: 800px)': { padding: '64px 6px 6px 6px' },
    }}>
      <Simulator
        top={<GameScore {...gameScoreProps} />}
        bottom={<RoundReview game={game} />}
      />
    </div>
  )
}

// Accept timer state and handler
const GameScore = ({ game, startNewGame, selectedTimer, handleSetSelectedTimer, isPlayed }) => {
  const { triggerAAAAtoast, showConfetti } = useAAAAtoast(); // Initialize the hook
  const { user } = useUser()
  // Use highscore hook only if it's the current game summary, not viewing an old one
  const { highscore, prevHighscore, gameId } = useHighscore({ skip: isPlayed })
  const [signupOpen, setSignupOpen] = useState(false)

  // Determine the timer to use for the "Start New Game" button
  // If viewing an old game summary (isPlayed=true), use its timer setting.
  // Otherwise (active summary), use the selectedTimer from context.
  const nextGameTimer = isPlayed ? game.selectedTimer : selectedTimer;

  const newHighscore = !isPlayed && (gameId && game._id) && gameId === game._id;

  // Ensure handleSetSelectedTimer is available before rendering timer options
  const canSetTimer = typeof handleSetSelectedTimer === 'function';

  return (
    <>
      {/* Conditionally render confetti */}
      {showConfetti && <AAAAAAConfettiDynamic />}
      <SignupDialog open={signupOpen} onClose={() => setSignupOpen(false)} />
      <div className='flex flex-col items-center relative'>
        <div className='flex text-2xl mt-4 font-mono font-bold'>
          <div className='mr-4 mt-1'>
            <IconGenerator />
          </div>
          GAME SUMMARY
          <div className='ml-4 mt-1' css={{ transform: 'scaleX(-1)' }}>
            <IconGenerator />
          </div>
        </div>
        <div className='mt-4 text-lg'>
          <Tag big noBorder color={`${modes[game.mode].color}cc`} style={{ textTransform: 'none', whiteSpace: 'wrap' }}>
            <b css={{ textTransform: 'uppercase', marginRight: 4, paddingLeft: 4 }}>{game.mode} Mode</b>{' '}
            <span css={{
              paddingRight: 4,
              '@media (max-width: 500px)': { display: 'none' }
            }}>
              {modes[game.mode].description}
            </span>
          </Tag>
        </div>
        <FancyBorderButton disabled style={{ marginBottom: 16 }}>
          <div className='text-2xl m-2 flex flex-wrap items-center justify-center'>
            <span className='mr-3'  css={{ whiteSpace: 'nowrap' }}>{game?.score === 1000 ? 'PERFECT SCORE!' : 'Final Score'}</span>
            <span css={{ whiteSpace: 'nowrap' }}>
              <b css={{ color: calcScoreColors(game?.score) }}>{game.score}</b> / 1000
            </span>
          </div>
        </FancyBorderButton>
        {!!highscore && !newHighscore && (
          <div className='text-lg mb-[24px]'>
            <span className='mr-2'>Your highscore:</span>
            <span className='text-xl'><b>{highscore}</b> / 1000</span>
          </div>
        )}

        {newHighscore && (
          <div className='font-mono text-4xl mb-6 flex justify-evenly w-full'>
            <div css={{
              position: 'relative',
              '@media (max-width: 1125px)': { transform: 'scale(0.7)' },
              '@media (max-width: 600px)': { transform: 'scale(0.5)' }
            }}>
              <AAAAAA
                style={{
                  position: 'absolute',
                  left: -236,
                  top: -50,
                  '@media (max-width: 1125px)': {
                    top: -150,
                    left: -118,
                  },
                }}
                initialAngry
                initialText={"Amazing!"}
                initialWidth={180}
                excited
                angle={10}
              />
            </div>
            <Shake active>
              <div className='flex'>
                <div className='mr-3'>NEW</div>
                <RainbowText text='HIGHSCORE!' />
              </div>
            </Shake>
            <div css={{
              position: 'relative',
              '@media (max-width: 1125px)': { transform: 'scale(0.7)' },
              '@media (max-width: 600px)': {
                transform: 'scale(0.5)',
              }
            }}>
              <AAAAAA
                style={{
                  position: 'absolute',
                  bottom: -60,
                  '@media (max-width: 1125px)': {
                    bottom: 60,
                    right: -90
                  },
                }}
                initialAngry
                initialText={"You are POWERFUL!"}
                initialWidth={200}
                excited
                angle={-10}
              />
            </div>
          </div>
        )}

        {newHighscore && !!prevHighscore && (
          <div className='text-lg mb-[24px]'>
            <span className='mr-2'>Previous highscore:</span>
            <span className='text-xl'><b>{prevHighscore}</b> / 1000</span>
          </div>
        )}

        {!isPlayed && !user?.isLoggedIn && (
          <div className='mb-8 mt-3 text-center text-lg' css={{
            '@media (max-width: 800px)': { margin: '0 0 8px 0' }
          }}>
            <GameButton
              onClick={() => setSignupOpen(true)}
              css={{
                marginRight: 8,
                background: '#E4C1F4',
                color: '#000000',
                padding: '2px 16px 1px',
                ':hover': { background: '#CCA5DE' },
              }}
            >
              <b>Sign Up</b>
            </GameButton>
            to save your games, highscores, favorite artifacts, and boost the develepor's ego.
            <div className='mt-2'>
              Join our community on{' '}
              <a href='https://discord.gg/MvkqPTdcwm' className='text-blue-300 hover:text-blue-500 hover:underline mx-1'>
                Discord
                <BiLinkExternal className='inline ml-1 relative bottom-[2px]' />
              </a>{' '}and/or{' '}
              <a href='https://reddit.com/r/artifactguesser' className='text-blue-300 hover:text-blue-500 hover:underline mx-1'>
                Reddit
                <BiLinkExternal className='inline ml-1 relative bottom-[2px]' />
              </a>{' '}
              for updates, feature requests, and to chat about the neat artifacts you find!
            </div>
          </div>
        )}
        
        {/* Only show game controls if startNewGame is available (i.e., not viewing an old summary) */}
        {!isPlayed && startNewGame && (
          <div className='flex flex-col items-center mb-8 text-base w-full'>
            {/* Timer Selection */}
            {canSetTimer && (
              <div className='mt-4 mb-6 w-full max-w-md'>
                <div className='text-sm mb-2 flex items-center justify-center'>
                  <GiTimeBomb className='mr-2'/> Timer for Next Game
                </div>
                <div className='p-2 text-sm flex justify-center' css={{ borderRadius: 6 }}>
                  {timerOptions.map(timerValue => (
                    <RoundButton
                      key={timerValue === null ? 'none' : timerValue}
                      onClick={() => handleSetSelectedTimer(timerValue)}
                      isActive={selectedTimer === timerValue}
                      disabled={false}
                    >
                      {timerValue === null ? 'None' : timerValue === 60 ? '1min' : `${timerValue}s`}
                    </RoundButton>
                  ))}
                </div>
              </div>
            )}

             {/* Start Game Buttons */}
             <div className='flex items-center justify-center flex-wrap' css={{
               margin: '8px 0 32px',
               gap: '16px',
             }}>
               <SimulatorButton
                 css={{
                   boxShadow: '0 0 180px 0 #ffffff, 0 0 100px 0 #ffffff77',
                   ':hover': {
                     boxShadow: '0 0 180px 0 #ffffff, 0 0 100px 0 #ffffffaa',
                     filter: 'brightness(1.1)',
                     transition: 'box-shadow 0.2s'
                   }
                 }}
                 onClick={() => startNewGame({ mode: game.mode, timer: selectedTimer })}
               >
                 <b className='text-lg'>Start New Game</b>
               </SimulatorButton>
               {/* Removed legacyBehavior, Link should wrap the component directly */}
               <Link href='/multiplayer'>
                 <SimulatorButton css={{
                   background: '#4f95ff',
                   boxShadow: '0 0 180px 0 #ffffff, 0 0 100px 0 #ffffff77',
                   ':hover': {
                     boxShadow: '0 0 180px 0 #ffffff, 0 0 100px 0 #ffffffaa',
                     filter: 'brightness(1.1)',
                     transition: 'box-shadow 0.2s'
                   }
                 }}>
                   <b className='text-lg'>Go to Multiplayer Lobby</b>
                 </SimulatorButton>
               </Link>
             </div>
             {/* Mode Selection */}
             <div className="text-center w-full">
               or try a different mode!
               <div className='flex flex-wrap justify-center mt-3 mb-2'>
                 {Object.keys(modes).filter(m => m !== game.mode && !modes[m]?.type).map(mode => (
                   <ModeButton key={mode} mode={mode} className='mb-2 mr-2' onClick={() => startNewGame({ mode: mode, timer: selectedTimer })} />
                 ))}
               </div>
               <b>Continent Modes!</b>
               <div className='flex flex-wrap justify-center mt-3 mb-2'>
                 {Object.keys(modes).filter(m => m !== game.mode && modes[m]?.type === 'Continent').map(mode => (
                   <ModeButton key={mode} mode={mode} className='mb-2 mr-2' onClick={() => startNewGame({ mode: mode, timer: selectedTimer })} />
                 ))}
               </div>
               <b>Era Modes!</b>
               <span className='text-center block'>
                 Experimental! {!user?.isLoggedIn && 'Please log in to play.'}
               </span>
               <div className='flex flex-wrap justify-center mt-3 mb-2'>
                 {Object.keys(modes).filter(m => m !== game.mode && modes[m]?.type === 'Era').map(mode => (
                   <ModeButton key={mode} mode={mode} className='mb-2 mr-2 text-base' onClick={() => {
                     if (user?.isLoggedIn) {
                       startNewGame({ mode: mode, timer: selectedTimer });
                     } else {
                       setSignupOpen(true);
                       // Extract JSX for clarity
                     const toastText = (
                       <>
                         Sign up to try this mode,<br/>
                         you {generateInsult('name')}!
                       </>
                     );
                     // Use the hook to trigger the toast/confetti
                     triggerAAAAtoast(
                       { // Props for AAAAAA component
                         initialAngry: true,
                         initialText: toastText, // Use the variable here
                         initialWidth: 280,
                         angle: 5,
                         textColor: '#ffffff',
                         style: {
                           padding: '0 12px 12px 0'
                         }
                       },
                       { position: 'bottom-right' } // Toast options
                     );
                   }
                 }} />
                 ))}
               </div>
             </div>
           </div>
         )}
         <div className='w-full flex items-center justify-between lg:mt-0 mt-4 px-1'>
           <div className='flex flex-wrap items-center justify-start'>
             <div className='mr-1'>
               Created by Sam (protocodex)
             </div>
             <SocialMedia />
           </div>
           <div className='text-right'>
             Learn more about the project{' '}
             <Link href='/about' className='text-blue-300 hover:text-blue-500 hover:underline'>
               here
             </Link>
           </div>
         </div>
       </div>
     </>
  )
}


const RoundReview = ({ game }) => {

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
            <div key={round.round} className='mb-8 w-full md:w-[calc(48%)] lg:w-[calc(30%)]' css={{
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
            </div>
          )
        })}
      </div>
    </div>
  )
}

const RainbowText = ({ text }) => {
  return (
    <div className='flex flex-wrap justify-center'>
      {text.split('').map((letter, i) => (
        <div key={i} css={{
          color: `hsl(${i * 30}, 100%, 50%)`,
          '@media (max-width: 800px)': { fontSize: '2.5rem' }
        }}>
          {letter}
        </div>
      ))}
    </div>
  )
}


export const calcScoreColors = (points) => {
  if (points === 1000) return '#00ff00'
  if (points >= 700) return '#7ae990'
  if (points >= 500) return '#ffc045'
  return '#ff8a45'
}
