import { GameButton } from "@/components/buttons/GameButton"
import { IoIosArrowRoundForward } from "react-icons/io"

export const RoundScore = ({ points, isLastRound, viewSummary, isSummary, startNextRound }) => {

  return (
    <div className='rounded w-full text-black' css={{
      padding: '3px 8px',
      border: '3px solid #ffffff55',
      background: points > 175 ? '#7ae990' : points > 100 ? '#ffc045' : '#ff9999'
    }}>
      <div className='flex justify-between text-sm mb-2'>
        <div className='text-black/70'>Points</div>
        <div>{points} / 200</div>
      </div>
      <div className='flex justify-between'>
        {points === 200 ? 'Perfect! Thats amazing!' : points > 160 ? 'Wow, impressive!' : points > 100 ? 'Not bad!' : points > 0 ? 'Oh well. Try again!' : 'Oof.'}
        {!isSummary && (
          <GameButton
            onClick={isLastRound ? viewSummary : startNextRound}
            className='relative right-[-5px]'
            css={{
              background: '#90d6f8',
              color: '#000000',
              ':hover': { background: '#4db4e6' }
            }}
          >
            <IoIosArrowRoundForward className='mr-1' />
            {isLastRound ? 'View Game Summary' : 'Next Artifact'}
          </GameButton>
        )}
      </div>
    </div>
  )
}