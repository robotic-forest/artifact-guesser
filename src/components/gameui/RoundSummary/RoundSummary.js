import { GameInfo } from "../GameInfo"
import { useGame } from "../../game/GameProvider"
import { YourGuess } from "./components/YourGuess"
import { RoundScore } from "./components/RoundScore"
import { Artifact } from "@/components/artifacts/Artifact"
import { createStyles } from "@/components/GlobalStyles"
import { artifactsTheme } from "@/pages/artifacts"
import { MainHeader } from "../MainHeader"
import { AuthHeader } from "@/components/layout/AuthHeader"

export const RoundSummary = () => {
  const { game, artifact, startNextRound, currentRound, selectedDate, selectedCountry, viewSummary } = useGame()
  const { countryPoints, datePoints, points } = currentRound
  const isLastRound = game.round === game.rounds

  console.log({
    game,
    artifact,
    selectedDate,
    selectedCountry,
    datePoints,
    countryPoints,
    points
  })

  return (
    <div>
      <MainHeader />
      <AuthHeader />
      <div css={createStyles(artifactsTheme)}>
        <Artifact
          artifact={artifact}
          roundSummary={(
            <div className='p-1 z-10 w-[350px] select-none flex flex-col items-end' css={{
              '@media (max-width: 800px)': { width: '100vw' },
              color: 'var(--textColor)'
            }}>
              <div className='mb-1'>
                <GameInfo />
              </div>
              <YourGuess {...{ artifact, selectedDate, selectedCountry, datePoints, countryPoints }} />
              <RoundScore {...{ points, isLastRound, startNextRound, viewSummary }} />
            </div>
          )}
        />
      </div>
    </div>
  )
}