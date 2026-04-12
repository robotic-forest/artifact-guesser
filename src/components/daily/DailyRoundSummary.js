import { useDaily } from "./DailyProvider"
import { YourGuess } from "../gameui/RoundSummary/components/YourGuess"
import { RoundScore } from "../gameui/RoundSummary/components/RoundScore"
import { Artifact } from "@/components/artifacts/Artifact"
import { createStyles } from "@/components/GlobalStyles"
import { artifactsTheme } from "@/pages/artifacts"
import { DailyHeader } from "./DailyHeader"
import { AuthHeader } from "@/components/layout/AuthHeader"

export const DailyRoundSummary = () => {
  const { game, artifact, startNextRound, currentRound, selectedDate, selectedCountry, viewSummary } = useDaily()
  const { countryPoints, datePoints, points } = currentRound
  const isLastRound = game.round === game.rounds

  return (
    <div>
      <DailyHeader />
      <AuthHeader />
      <div css={createStyles(artifactsTheme)}>
        <Artifact
          artifact={artifact}
          roundSummary={(
            <div className='p-1 z-10 w-[350px] select-none flex flex-col items-end' css={{
              '@media (max-width: 600px)': { width: 'calc(100vw - 6px)' },
              color: 'var(--textColor)'
            }}>
              <div className='mb-1'>
                <DailyGameInfoSmall />
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

const DailyGameInfoSmall = () => {
  const { game } = useDaily()

  return !game ? null : (
    <div className='bg-black rounded py-1 px-2 text-sm overflow-hidden relative flex w-[fit-content]'>
      <div className='mr-3'>
        <span className='text-white/60 mr-2'>Round</span> <b>{game.round} / {game.rounds}</b>
      </div>
      <div>
        <span className='text-white/60 mr-2'>Score</span> <b>{game.score}</b> / 600
      </div>
    </div>
  )
}
