import { usePlayedGame } from "@/hooks/games/usePlayedGame"
import { gamesTheme } from "."
import { Layout } from "@/components/layout/Layout"
import { GameSummary } from "@/components/game/GameSummary"
import { GrReturn } from "react-icons/gr"
import { useRouter } from "next/router"

export default () => {
  const router = useRouter()
  const { game } = usePlayedGame()
  
  return game && (
    <Layout title='Games' theme={gamesTheme} contentCSS={{
      padding: 0,
      background: 'linear-gradient(0deg, #061c0d, #28663c)'
    }}>
      <a className='p-1 px-3 flex items-center' onClick={() => router.back()}>
        <GrReturn className='inline-block mr-2' />
        Go Back
      </a>
      <GameSummary game={game} />
    </Layout>
  )
}