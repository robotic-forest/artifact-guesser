import { usePlayedGame } from "@/hooks/games/usePlayedGame"
import { gamesTheme } from "."
import { Layout } from "@/components/layout/Layout"
import { GameSummary } from "@/components/game/GameSummary"
import { MultiplayerGameView } from "@/components/game/MultiplayerGameView"
import { GrReturn } from "react-icons/gr"
import { useRouter } from "next/router"

export default () => {
  const router = useRouter()
  const { game } = usePlayedGame()

  return game && (
    <Layout title='Games' theme={gamesTheme} contentCSS={{ padding: 0 }}>
      <a className='ml-8 mt-2 p-1 px-3 flex items-center' onClick={() => router.back()}>
        <GrReturn className='inline-block mr-2' />
        Go Back
      </a>
      {game.gameType === 'multiplayer'
        ? <MultiplayerGameView game={game} />
        : <GameSummary game={game} />
      }
    </Layout>
  )
}