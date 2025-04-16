import styled from '@emotion/styled'
import React, { useState, useRef, useEffect } from 'react'

// Define a base width and a scaling factor per depth level
const BASE_WIDTH = 350; // Start wider to contain children
const WIDTH_DECREMENT_FACTOR = 0.8; // Multiplicative factor for width decrease
const MIN_WIDTH = 40; // Minimum width

export default function RecursiveAAAAAA({
  initialAngry = false,
  initialText = null, // Expecting a React element (the child)
  withBrows = true,
  uniBrow = true,
  headWidth = 40,
  headHeight = 40,
  mouthWidth = 10,
  jawHeight = 15,
  eyeSize = 14,
  excited,
  style,
  angle,
  textColor,
  backgroundColor,
  depth = 0 // Add depth prop
}) {
  const container = useRef(null)
  const [refHeight, setRefHeight] = useState(0)
  const [mouthHeightFactor, setMouthHeightFactor] = useState(1); // State for dynamic mouth height

  // Calculate width based on depth using a multiplicative factor
  const calculatedWidth = Math.max(MIN_WIDTH, BASE_WIDTH * Math.pow(WIDTH_DECREMENT_FACTOR, depth));
  const [width, setWidth] = useState(calculatedWidth);

  const [angry, setAngry] = useState(initialAngry)
  const color = excited ? '#28663c' : angry ? 'rgb(255, 181, 181)' : 'var(--primaryColor)'

  const lineStyle = { stroke: 'black', strokeWidth: 1, shapeRendering: 'auto', strokeLinecap: 'round' }
  const browStyle = { ...lineStyle, strokeWidth: 2 }

  // Simple scaling for internal elements based on depth
  const scaleFactor = Math.max(0.4, 1 - depth * 0.1);
  const scaledHeadWidth = headWidth * scaleFactor;
  const scaledHeadHeight = headHeight * scaleFactor;
  const scaledJawHeight = jawHeight * scaleFactor;
  const scaledEyeSize = eyeSize * scaleFactor;
  const scaledMouthWidth = mouthWidth * scaleFactor;
  const scaledFontSize = `${Math.max(0.5, 1 - depth * 0.1)}rem`; // Scale font size too

  useEffect(() => {
    // Calculate a mouth opening factor with a gentler decrease (no randomness)
    // Base factor decreases less sharply (using 0.6 power instead of 0.4)
    const calculatedMouthFactor = Math.max(1, 1 + 3 * Math.pow(0.6, depth)); // Example: 4x at depth 0, ~2.8x at depth 1, ~2.08x at depth 2
    setMouthHeightFactor(calculatedMouthFactor);

    // Update refHeight when the container (holding the child) changes size
    const updateHeight = () => {
      if (container.current) {
        // Use scrollHeight to get the full height of the content, even if overflowing
        setRefHeight(container.current.scrollHeight);
      }
    };
    updateHeight(); // Initial calculation
    // Optional: Recalculate if window resizes, though less relevant here
    // window.addEventListener('resize', updateHeight);
    // return () => window.removeEventListener('resize', updateHeight);

    // Update width if depth changes (unlikely in this setup but good practice)
    setWidth(calculatedWidth);
    // Update angry state if prop changes
    initialAngry !== angry && setAngry(initialAngry)
  }, [container, initialText, calculatedWidth, initialAngry, angry, depth]) // Add depth and initialText to dependencies

  // Calculate effective mouth height using the factor
  const effectiveMouthHeight = refHeight * mouthHeightFactor;

  // Calculate viewBox height dynamically, incorporating the effective mouth height
  const viewBoxHeight = effectiveMouthHeight + scaledHeadHeight + scaledJawHeight + 10; // Add some padding

  return (
    <div css={{ ...style, transform: angle ? `rotate(${angle}deg)` : angry ? 'rotate(-4deg)' : 'rotate(4deg)', display: 'inline-block' /* Prevent block layout issues */ }}>
      <Shake active={angry}>
        <svg
          width={width}
          // Use dynamic viewBox height
          viewBox={`0 0 ${width} ${viewBoxHeight}`}
          xmlns='http://www.w3.org/2000/svg'
          style={{ overflow: 'visible' }} // Allow content to be visible if slightly larger
        >
          {/* ForeignObject to hold the child component */}
          {/* Position it below the head */}
          <foreignObject x="5" y={scaledHeadHeight + 5} width={width - scaledMouthWidth - 10} height={refHeight + 10} style={{ overflow: 'visible' }}>
            <div
              ref={container}
              style={{
                // Ensure container allows child to dictate height
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                width: '100%',
                height: 'auto', // Let content determine height
                minHeight: '20px', // Ensure some minimum height
                padding: `${5 * scaleFactor}px`,
                boxSizing: 'border-box',
                // backgroundColor: 'rgba(0, 255, 0, 0.1)' // Debug background
              }}
            >
              {/* Conditionally render based on initialText type */}
              {React.isValidElement(initialText) ? (
                // Recursive case: Render the child component
                React.cloneElement(initialText, { depth: depth + 1 })
              ) : typeof initialText === 'string' ? (
                // Insult case: Render the string in a paragraph
                <p
                  style={{
                    overflowWrap: 'break-word',
                    margin: 0,
                    textAlign: 'center', // Center insults? Or keep end?
                    color: textColor || (excited ? '#00ff00' : angry ? '#ff0000' : 'var(--textColor)'),
                    fontWeight: angry ? 'bold' : 'normal',
                    fontSize: scaledFontSize // Use scaled font size
                  }}
                >
                  {initialText}
                </p>
              ) : null /* Handle other cases or render nothing */}
            </div>
          </foreignObject>

          {/* Head, Eyes, Mouth, Jaw - Use scaled dimensions */}
          {/* Position elements relative to the right edge (width) */}
          <rect id='head' x={width - scaledHeadWidth} y={0} width={scaledHeadWidth} height={scaledHeadHeight} style={{ fill: color }} />
          {angry && withBrows && (
            <>
              <line id='left-brow' x1={width - scaledHeadWidth - scaledEyeSize / 3} y1={scaledHeadHeight / 3} x2={width - scaledHeadWidth + scaledEyeSize / 1.5} y2={scaledHeadHeight / 1.8} style={browStyle} />
              <line id='right-brow' x1={uniBrow ? width - scaledHeadWidth + scaledEyeSize / 1.5 : width - 25 * scaleFactor} y1={scaledHeadHeight / 1.8} x2={uniBrow ? width - scaledHeadWidth + 20 * scaleFactor : width - 11 * scaleFactor} y2={scaledHeadHeight / 3} style={browStyle} />
            </>
          )}
          <Eye x={width - scaledHeadWidth - scaledEyeSize / 2} y={scaledHeadHeight - scaledHeadHeight * 0.6} width={scaledEyeSize} height={scaledEyeSize} direction={'left'} />
          <Eye x={width - scaledEyeSize * 1.5} y={scaledHeadHeight - scaledHeadHeight * 0.6} width={scaledEyeSize} height={scaledEyeSize} direction={'right'} />

          {/* Mouth Lines and Rects - Position relative to head and use effectiveMouthHeight */}
          <line id='mouth-top' x1={width - scaledHeadWidth} y1={scaledHeadHeight} x2={width - scaledMouthWidth} y2={scaledHeadHeight} style={lineStyle} />
          <rect id='mouth' x={width - scaledMouthWidth} y={scaledHeadHeight} width={scaledMouthWidth} height={effectiveMouthHeight} style={{ fill: color }} />
          <line id='mouth-side' x1={width - scaledMouthWidth} y1={scaledHeadHeight} x2={width - scaledMouthWidth} y2={effectiveMouthHeight + scaledHeadHeight} style={lineStyle} />

          {/* Jaw - Position below the effective mouth height */}
          <rect id='jaw' x={width - scaledHeadWidth} y={effectiveMouthHeight + scaledHeadHeight} width={scaledHeadWidth} height={scaledJawHeight} style={{ fill: color }} />
          <line id='jaw-top' x1={width - scaledHeadWidth} y1={scaledHeadHeight + effectiveMouthHeight} x2={width - scaledMouthWidth} y2={scaledHeadHeight + effectiveMouthHeight} style={lineStyle} />
        </svg>
      </Shake>
    </div>
  )
}

// Shake and Eye components remain the same
export const Shake = styled.div`
  animation: ${p => p.active ? 'shake 0.5s' : 'none'};
  animation-iteration-count: infinite;

  @keyframes shake {
    0% { transform: translate(1px, 1px) rotate(0deg) }
    10% { transform: translate(-1px, -2px) rotate(-1deg) }
    20% { transform: translate(-3px, 0px) rotate(1deg) }
    30% { transform: translate(3px, 2px) rotate(0deg) }
    40% { transform: translate(1px, -1px) rotate(1deg) }
    50% { transform: translate(-1px, 2px) rotate(-1deg) }
    60% { transform: translate(-3px, 1px) rotate(0deg) }
    70% { transform: translate(3px, 1px) rotate(-1deg) }
    80% { transform: translate(-1px, -1px) rotate(1deg) }
    90% { transform: translate(1px, 2px) rotate(0deg) }
    100% { transform: translate(1px, -2px) rotate(-1deg) }
  }
`

const Eye = ({ x, y, width, direction }) => {
  const getPupils = (direction) => {
    switch(direction) {
      case 'left': return ['30%', '50%']
      case 'up': return ['50%', '30%']
      case 'right': return ['70%', '50%']
      case 'down': return ['50%', '70%']
      default: return ['50%', '50%']
    }
  }

  const pupils = getPupils(direction)

  return (
    <svg x={x} y={y} width={width + 1} height={width + 1}>
      <circle cx='50%' cy='50%' r={width / 2} style={{ fill: '#ffffff', stroke: '#000000' }} />
      <circle cx={pupils[0]} cy={pupils[1]} r={Math.max(1, width * 0.1)} style={{ fill: '#000000', stroke: '#000000' }} /> {/* Scale pupil size slightly */}
    </svg>
  )
}
