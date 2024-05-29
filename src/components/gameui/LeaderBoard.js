import { useHighscores } from "@/hooks/games/useHighscores"
import { IconGenerator } from "../art/IconGenerator"
import { FaTrophy } from "react-icons/fa"
import { Tag } from "../tag/Tag"
import { useClickedOutside } from "@/hooks/useClickedOutside"
import { IconButton } from "../buttons/IconButton"
import { MdClose } from "react-icons/md"

export const LeaderBoard = ({ onClose }) => {
  const highscores = useHighscores()
  const { ref } = useClickedOutside(onClose)

  return (
    <div ref={ref} className='fixed p-1 top-[30px] left-1 z-[100] w-[400px] bg-black rounded-lg border border-white/30' css={{ 
      '@media (max-width: 500px)': { width: 'calc(100vw - 8px)' }
    }}>
      <div className='p-1 px-1.5 mb-1 flex items-center justify-between'>
        <div className='flex items-center'>
          <FaTrophy className='mr-2' />
          High Scores
        </div>
        <IconButton onClick={onClose} css={{ position: 'relative' }}>
          <MdClose />
        </IconButton>
      </div>
      {highscores?.map((game, i) => (
        <div key={game.id} className='flex items-center justify-between w-full p-2 mb-1'
          css={{ background: i % 2 === 0 ? 'var(--backgroundColorBarelyLight)' : 'var(--backgroundColorBarelyDark)' }}
        >
          <div className='flex items-center'>
            <Tag color={pastelBlueToGreenByIndex(i)} bold className='mr-4 w-[20px]' style={{ padding: 0, display: 'inline-grid', placeItems: 'center' }}>{i + 1}</Tag>
            <div className='flex items-center'>
              <div className='mr-2'>
                <IconGenerator />
              </div>
              <div>{game.username}</div>
            </div>
          </div>
          <div>
            {game.score} / 1000
          </div>
        </div>
      ))}
    </div>
  )
}

const pastelBlueToGreenByIndex = i => {
  const colors = [
    '#7ff572', '#8bffb5', '#8bffe0', '#8bfff0', '#8bdeffee', '#8bdeffdd', '#8bdeffcc', '#8bdeffbb', '#8bdeffaa', '#8bdeff99'
  ]

  return colors[i % colors.length]
}