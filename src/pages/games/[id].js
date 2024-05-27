import { usePlayedGame } from "@/hooks/games/usePlayedGame"
import { gamesTheme } from "."
import { Layout } from "@/components/layout/Layout"
import { GameSummary } from "@/components/game/GameSummary"
import Link from "next/link"
import { GrReturn } from "react-icons/gr"

export default () => {
  const { game } = usePlayedGame()
  
  return game && (
    <Layout title='Games' theme={gamesTheme} contentCSS={{
      padding: 0,
      background: 'linear-gradient(0deg, #061c0d, #28663c)'
    }}>
      <div className='p-1 px-3'>
        <Link href='/games'>
          <div>
            <GrReturn className='inline-block mr-2' />
            Back to Games Overview
          </div>
        </Link>
      </div>
      <GameSummary game={game} />
    </Layout>
  )
}