import { useGame } from "../game/GameProvider"

export const GameInfo = () => {
  const { game } = useGame()

  return !game ? null : (
    <div className='bg-black rounded mb-1 py-1 px-2 text-sm overflow-hidden relative flex w-[fit-content]'>
      <div className='mr-3'>
        <span className='text-white/60 mr-2'>Round</span> <b>{game.round} / {game.rounds}</b>
      </div>
      <div>
        <span className='text-white/60 mr-2'>Score</span> <b>{game.score}</b> / 1000
      </div>
    </div>
  )
}