import { GameInfo } from "../GameInfo"
import { useGame } from "../../game/GameProvider"
import { YourGuess } from "./components/YourGuess"
import { ArtifactInfo } from "./components/ArtifactInfo"
import { RoundScore } from "./components/RoundScore"

export const RoundSummary = () => {
  const { game, artifact, startNextRound, currentRound, selectedDate, selectedCountry, viewSummary } = useGame()
  const { countryPoints, datePoints, points } = currentRound
  const isLastRound = game.round === game.rounds

  return (
    <>
      <div className='fixed p-1 bottom-0 left-0 z-10 w-[450px] select-none' css={{
        '@media (max-width: 800px)': { display: 'none' }
      }}>
        <ArtifactInfo artifact={artifact} />
      </div>

      <div className='fixed p-1 bottom-0 right-0 z-10 w-[350px] select-none flex flex-col items-end' css={{
        '@media (max-width: 800px)': {
          width: '100vw',
        }
      }}>
        <div className='mb-1'>
          <GameInfo />
        </div>
        <YourGuess {...{ artifact, selectedDate, selectedCountry, datePoints, countryPoints }} />
        <RoundScore {...{ points, isLastRound, startNextRound, viewSummary }} />
        <div className='pt-1' css={{
          '@media (min-width: 800px)': { display: 'none' },
          width: '100%'
        }}>
          <ArtifactInfo artifact={artifact} />
        </div>
      </div>
    </>
  )
}