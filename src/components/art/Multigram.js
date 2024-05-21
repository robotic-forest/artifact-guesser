import React, { useState, useEffect, forwardRef } from 'react'

export const AnimatedIntergram = forwardRef(({ speed = 1000, frontpage, ...props }, ref) => {
  const [update, setUpdate] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => setUpdate(!update), speed)
    return () => clearInterval(interval)
  })

  return (
    <div
      ref={ref}
      style={frontpage
        ? { width: '100%', display: 'flex', justifyContent: 'center' }
        : { width: 'fit-content' }
      }
    >
      <Intergram update={update} {...props} />
    </div>
  )
})

export const Intergram = ({
  shadowColor,
  update,
  nopointer,
  maxNodes = 4,
  diameter = 50,
  ...props
}) => {
  const [nodes, setNodes] = useState(9)
  const [hover, setHover] = useState(false)

  const calculateNodes = prevNodes => {
    const newNodes = parseInt(Math.random() * 5 + maxNodes)
    if (newNodes === prevNodes) {
      return calculateNodes(newNodes)
    } else return newNodes
  }

  useEffect(() => {
    setNodes(calculateNodes)
  }, [update])

  return (
    <div
      style={{
        cursor: nopointer ? 'default' : 'pointer',
        height: diameter < 40 ? diameter + (diameter / 16) : diameter + (diameter / 20)
      }}
      onMouseEnter={() => { !nopointer && setHover(true) }}
      onMouseLeave={() => { setHover(false) }}
    >
      <Multigram
        nodeNumber={nodes}
        diameter={diameter}
        color={props.color ? props.color : hover ? 'var(--textColorextLowOpacity)' : 'var(--textColor)'}
        nodeObjectOptions={{
          stroke: props.color ? props.color : 'var(--textColor)',
          multiplier: props.color ? 1.5 : 0.5,
          fill: props.color ? props.color : 'var(--textColor)',
          strokeWidth: 1,
        }}
        circleOptions={{
          fill: props.background ? props.background : 'var(--backgroundColor)',
          strokeWidth: 2.5
        }}
        {...props}
      />
    </div>
  )
}

export const Multigram = ({
  diameter = 666,
  nodeNumber = 9,
  circleOptions = {
    fill: 'none',
    strokeWidth: 2.5
  },
  innerCircle = false,
  nodeObjectOptions = {
    stroke: 'black',
    multiplier: 1,
    fill: 'none',
    strokeWidth: 0,
  },
  color = 'var(--textColor)',
  onMouseEnter,
  onMouseLeave,
  style
}) => {
  const radius = diameter / 2
  const nodeObjectRadius = nodeObjectOptions.multiplier

  // generate node coordinates
  let nodes = []
  for (let i = 0; i < nodeNumber; i++) {
    var x = nodeObjectRadius + radius + (radius * Math.cos(2 * Math.PI * i / nodeNumber))
    var y = nodeObjectRadius + radius + (radius * Math.sin(2 * Math.PI * i / nodeNumber))
    nodes.push([x, y])
  }

  // connect each node to all other nodes with an svg line
  let lines = []
  let nodeObjects = []
  for (let i = 0; i < nodeNumber; i++) {
    const x1 = nodes[i][0]
    const y1 = nodes[i][1]

    nodeObjects.push(
      <circle
        key={`${x1}${y1}`}
        cx={x1}
        cy={y1}
        r={nodeObjectRadius * nodeObjectOptions.strokeWidth}
        style={{
          fill: nodeObjectOptions.fill,
          stroke: nodeObjectOptions.stroke,
          strokeWidth: nodeObjectOptions.strokeWidth
        }}
      />
    )

    for (let j = 0; j < nodeNumber; j++) {
      if (j === i) continue
      const x2 = nodes[j][0]
      const y2 = nodes[j][1]
      lines.push(<line key={`${x1}${y1}${x2}${y2}`} x1={x1} y1={y1} x2={x2} y2={y2} style={{ stroke: color, strokeWidth: 0.5 }} />)
    }
  }

  return (
    <svg
      width={diameter + nodeObjectRadius * 2}
      height={diameter + nodeObjectRadius * 2}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{ borderRadius: 50, ...style }}
    >
      {innerCircle && <circle
        cx={radius + nodeObjectRadius}
        cy={radius + nodeObjectRadius}
        r={radius}
        style={{ fill: circleOptions.fill, stroke: color, strokeWidth: circleOptions.strokeWidth }}
      />}
      <g transform={`rotate(-90 ${radius + nodeObjectRadius} ${radius + nodeObjectRadius})`}>
        {lines.map(line => line)}
        {nodeObjects.map(object => object)}
      </g>
    </svg>
  )
}
