import Image from 'next/image'; // Import the Next.js Image component
import { useState } from 'react';
import { EaNasirSplash } from '../splash/EaNasirSplash';

export const ModeButton = ({ mode, onClick, className, css }) => {
  const { color, description } = modes[mode]
  const isEaNasirMode = mode === 'Ea Nasir Mode';
  const [hovered, setHovered] = useState(false);

  return (
    <div className="relative">
      {/* Ea Nasir Image - Conditionally render only for the specific mode */}
      {isEaNasirMode && (
        <Image
          src="/ea-nasir-cropped.png"
          alt="A small figure of Ea-Nasir"
          width={120} // Adjust size as needed
          height={120} // Adjust size as needed
          className="ea-nasir-image absolute right-[30px] transition-top duration-300 ease-in-out pointer-events-none" // Positioning, transition, initial state, REMOVED z-10
          style={{ top: hovered ? '-90px' : '-75px' }} // Adjust the top position on hover
          unoptimized // If the image is static and doesn't need Next.js optimization
        />
      )}
      <button
        onClick={onClick}
        className={`relative flex flex-col items-start px-2 py-1 text-lg text-left rounded-lg border-4 border-white/40 ${className}`} // Added relative and overflow-hidden
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        css={{
          background: color,
          color: 'black',
          '&:hover': {
            filter: 'brightness(1.15)'
          },
          ...css
        }}
      >
        <div>
          <b>{mode}</b>
          {description && <div className='text-sm'>{description}</div>}
        </div>
      </button>
    </div>
  )
}

export const modes = {
  // Basic Modes
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
  },
  'Ea Nasir Mode': {
    color: '#D2691E', // Copper color
    description: 'Can you tell if these copper artifacts are of inferior quality?',
    splash: EaNasirSplash
    // splashDuration removed
  },

  // Continent Modes
  'Africa': {
    type: 'Continent',
    color: '#f7bdc4'
  },
  'Asia': {
    type: 'Continent',
    color: '#f7bdc4'
  },
  'Europe': {
    type: 'Continent',
    color: '#f7bdc4'
  },
  'North America': {
    type: 'Continent',
    color: '#f7bdc4'
  },
  'South America': {
    type: 'Continent',
    color: '#f7bdc4'
  },
  'Oceania': {
    type: 'Continent',
    color: '#f7bdc4'
  },

  // Era Modes
  'Bronze Age': {
    type: 'Era',
    description: '3000 - 1200 BC',
    start: -3000,
    end: -1200,
    color: '#e09bf1'
  },
  'Iron Age': {
    type: 'Era',
    description: '1200 - 600 BC',
    start: -1200,
    end: -600,
    color: '#e09bf1'
  },
  'Classical Antiquity': {
    type: 'Era',
    description: '600 BC - 0 AD',
    start: -600,
    end: 0,
    color: '#e09bf1'
  },
  'Late Antiquity': {
    type: 'Era',
    description: '0 - 500 AD',
    start: 0,
    end: 500,
    color: '#e09bf1'
  },
  'Middle Ages': {
    type: 'Era',
    description: '500 - 1500 AD',
    start: 500,
    end: 1500,
    color: '#e09bf1'
  },
  'Early Modern': {
    type: 'Era',
    description: '1500 - 1800 AD',
    start: 1500,
    end: 1800,
    color: '#e09bf1'
  },
  'Modern': {
    type: 'Era',
    description: `1800 - ${new Date().getFullYear()} AD`,
    start: 1800,
    end: new Date().getFullYear(),
    color: '#e09bf1'
  },
}
