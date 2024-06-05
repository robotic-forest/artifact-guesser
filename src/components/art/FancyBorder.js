import useWindowDimensions from '@/hooks/useWindowDimensions'
import React, { useRef, useEffect, useState, useCallback } from 'react'

export const FancyBorderButton = ({ style, onClick, children, disabled }) => {
  const [hover, setHover] = useState(false)

  return (
    <div style={{
      width: '100%',
      display: 'flex',
      justifyContent: 'center',
      ...style
    }}>
      <button style={{
        background: 'none',
        color: 'inherit',
        border: 'none',
        padding: 0,
        font: 'inherit',
        cursor: !disabled ? 'pointer' : 'default',
        outline: 'inherit',
        width: '80%'
      }} type='submit' onClick={onClick}>
        <FancyBorder
          style={{ marginTop: 15 }}
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
          strokeWidth={(hover && !disabled) ? 1 : 0.5}
          color='var(--textColor)'
        >
          <div style={{
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
          }}>
            {children}
          </div>
        </FancyBorder>
      </button>
    </div>
  )
}

export const FancyBorder = ({ offset = 5, color, children, strokeWidth = 1, style, ...props }) => {
  const { width: windowWidth } = useWindowDimensions()
  const outerContainer = useRef(null)
  const innerContainer = useRef(null)
  const [width, setWidth] = useState(offset * 6)
  const [height, setHeight] = useState(offset * 6)

  const updateDimensions = useCallback(() => {
    if (windowWidth) {
      setWidth(outerContainer.current?.offsetWidth)
      setHeight(innerContainer.current?.offsetHeight)
    }
  }, [outerContainer, innerContainer, windowWidth])

  useEffect(() => {
    updateDimensions()
  })

  return  (
    <div
      ref={outerContainer}
      style={{ width: `100%`, ...style }}
      {...props}
    >
      <svg height={height} width={width}>
        <rect
          y={offset * 2}
          x={offset * 2}
          height={height - (offset * 4)}
          width={width - (offset * 4)}
          style={{ fill: 'none', stroke: color || 'var(--textLowOpacity)', strokeWidth }}
        />
        <rect
          y={offset * 3}
          x={offset}
          height={height - (offset * 6)}
          width={width - (offset * 2)}
          style={{ fill: 'none', stroke: color || 'var(--textLowOpacity)', strokeWidth }}
        />
        <rect
          y={offset}
          x={offset * 3}
          height={height - (offset * 2)}
          width={width - (offset * 6)}
          style={{ fill: 'none', stroke: color || 'var(--textLowOpacity)', strokeWidth }}
        />
        <foreignObject x={0} y={0} width={width} height={height}>
          <div ref={innerContainer} style={{ padding: offset * 4 }}>
            {children}
          </div>
        </foreignObject>
      </svg>
    </div>
  )
}
