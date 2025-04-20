import { useHighscores } from "@/hooks/games/useHighscores";
import { IconGenerator } from "../art/IconGenerator";
import { FaTrophy } from "react-icons/fa";
import { Tag } from "../tag/Tag";
import { useClickedOutside } from "@/hooks/useClickedOutside";
import { IconButton } from "../buttons/IconButton";
import { MdClose } from "react-icons/md";
import { capitalizeFirstLetter } from "@/lib/utils"; // Assuming a utility function exists

export const LeaderBoard = ({ onClose, mode, timer, rounds }) => {
  // Pass the game configuration to the hook
  const highscores = useHighscores({ mode, timer, rounds });
  const { ref } = useClickedOutside(onClose);

  // Generate a dynamic title based on the provided configuration
  let title = "High Scores";
  const configDetails = [];
  if (mode) configDetails.push(capitalizeFirstLetter(mode));
  if (timer) configDetails.push(`${timer}s`);
  if (rounds) configDetails.push(`${rounds} Rounds`);

  if (configDetails.length > 0) {
    title += ` (${configDetails.join(', ')})`;
  } else {
    title += " (Overall)"; // Default if no specific config provided
  }


  return (
    <div ref={ref} className='fixed p-1 top-[30px] left-1 z-[100] w-[400px] bg-black rounded-lg border border-white/30' css={{ 
      '@media (max-width: 500px)': { width: 'calc(100vw - 8px)' }
    }}>
      <div className='p-1 px-1.5 mb-1 flex items-center justify-between'>
        <div className='flex items-center'>
          <FaTrophy className='mr-2' />
          {title}
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
            {/* Display score relative to max possible score based on rounds */}
            {game.score} {game.rounds ? `/ ${game.rounds * 200}` : ''}
          </div>
        </div>
      ))}
      {highscores?.length === 0 && (
        <div className="p-4 text-center text-white/70">No high scores found for this configuration.</div>
      )}
    </div>
  )
}

const pastelBlueToGreenByIndex = i => {
  const colors = [
    '#7ff572', '#8bffb5', '#8bffe0', '#8bfff0', '#8bdeffee', '#8bdeffdd', '#8bdeffcc', '#8bdeffbb', '#8bdeffaa', '#8bdeff99'
  ]

  return colors[i % colors.length]
}
