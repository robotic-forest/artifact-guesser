export const ModeButton = ({ mode, onClick, className }) => {

  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-start px-2 py-1 text-lg rounded-lg border-4 border-white/40 ${className}`}
      css={{
        background: modes[mode].color,
        color: 'black',
        '&:hover': {
          filter: 'brightness(1.15)'
        }
      }}
    >
      <b>{mode}</b>
      <div className='text-sm'>
        {modes[mode].description}
      </div>
    </button>
  )
}

export const modes = {
  'Classic': {
    color: '#bdc4f7',
    description: 'Random artifacts. Hardest mode.'
  },
  'Highlights': {
    color: '#ffc977',
    description: 'Only the most maaarvelous artifacts!'
  },
  'Balanced': {
    color: '#8ed2b9',
    description: 'Equal chance of highlights and random artifacts.'
  }
}