import styled from '@emotion/styled'
import React, { useState, useRef, useEffect } from 'react'

export default function AAAAAA({
  initialAngry = false,
  initialText = 'AAAAAAAAAH',
  edit = false,
  staticWidth = true,
  initialWidth = 60,
  withBrows = true,
  uniBrow = true,
  headWidth = 40,
  headHeight = 40,
  mouthWidth = 10,
  jawHeight = 15,
  eyeSize = 14,
  fontSize = 'inherit',
  excited,
  style,
  angle,
  textColor,
  backgroundColor
}) {
  const container = useRef(null)
  const [refHeight, setRefHeight] = useState(0)
  const [width, setWidth] = useState(initialWidth)
  const [text, setText] = useState(initialText)
  const [angry, setAngry] = useState(initialAngry)
  const color = excited ? '#28663c' : angry ? 'rgb(255, 181, 181)' : 'var(--primaryColor)'

  const lineStyle = { stroke: 'black', strokeWidth: 1, shapeRendering: 'auto', strokeLinecap: 'round' }
  const browStyle = { ...lineStyle, strokeWidth: 2 }

  useEffect(() => {
    container.current && setRefHeight(container.current.offsetHeight)
    !staticWidth && container.current && setWidth(container.current.offsetWidth)
    initialText !== text && setText(initialText)
    initialAngry !== angry && setAngry(initialAngry)
  }, [container, text, initialText, angry, initialAngry, staticWidth])

  return (
    <div css={{ ...style, transform: angle ? `rotate(${angle}deg)` : angry ? 'rotate(-4deg)' : 'rotate(4deg)' }}>
      <Shake active={angry}>
        <svg
          width={width}
          viewBox={`0 0 ${width} ${refHeight + headHeight + jawHeight}`}
          xmlns='http://www.w3.org/2000/svg'
        >
          <foreignObject x="0" y={headHeight} width={width - mouthWidth} height={refHeight}>
            <div
              ref={container}
              style={{
                padding: 5,
                maxWdith: '40vw',
                minWidth: 30,
                width: !staticWidth ? 'max-content' : 'auto',
                paddingRight: !staticWidth ? 15 : 8,
                backgroundColor: backgroundColor || 'var(--backgroundColor)'
              }}
            >
              <p
                style={{
                  overflowWrap: 'break-word',
                  margin: 0,
                  textAlign: 'end',
                  color: textColor || (excited ? '#00ff00' : angry ? '#ff0000' : 'var(--textColor)'),
                  fontWeight: angry ? 'bold' : 'normal',
                  fontSize
                }}
              >
                {text}
              </p>
            </div>
          </foreignObject>
          <rect id='head' x={width - headWidth} y={0} width={headWidth} height={headHeight} style={{ fill: color }} />
          {angry && withBrows && (
            <>
              <line id='left-brow' x1={width - headWidth - eyeSize / 3} y1={headHeight / 3} x2={width - headWidth + eyeSize / 1.5} y2={headHeight / 1.8} style={browStyle} />
              <line id='right-brow' x1={uniBrow ? width - headWidth + eyeSize / 1.5 : width - 25} y1={headHeight / 1.8} x2={uniBrow ? width - headWidth + 20 : width - 11} y2={headHeight / 3} style={browStyle} />
            </>
          )}
          <Eye x={width - headWidth - eyeSize / 2} y={headHeight - headHeight * 0.5} width={eyeSize} height={eyeSize} direction={'left'} />
          <Eye x={width - 20} y={headHeight - headHeight * 0.5} width={eyeSize} height={eyeSize} direction={'right'} />
          <line id='mouth-top' x1={width - headWidth} y1={headHeight} x2={width - mouthWidth} y2={headHeight} style={lineStyle} />
          <rect id='mouth' x={width - mouthWidth} y={headHeight} width={mouthWidth} height={refHeight} style={{ fill: color }} />
          <line id='mouth-side' x1={width - mouthWidth} y1={headHeight} x2={width - mouthWidth} y2={refHeight + headHeight} style={lineStyle} />
          <rect id='jaw' x={width - headWidth} y={refHeight + headHeight} width={headWidth} height={jawHeight} style={{ fill: color }} />
          <line id='jaw-top' x1={width - headWidth} y1={headHeight + refHeight} x2={width - mouthWidth} y2={headHeight + refHeight} style={lineStyle} />
        </svg>
      </Shake>
      {edit && (
        <>
          <br/><br/><br/>
          <textarea name='text' value={text} onChange={(e) => { setText(e.target.value) }} />
          <span><input type='checkbox' name='angry' onChange={(e) => { setAngry(e.target.checked) }} />Enrage</span>
        </>
      )}
    </div>
  )
}

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
      <circle cx={pupils[0]} cy={pupils[1]} r={1} style={{ fill: '#000000', stroke: '#000000' }} />
    </svg>
  )
}
