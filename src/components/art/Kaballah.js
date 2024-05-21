import { useEffect, useState } from "react"

export const Kaballah = ({
  totalUsers,
  unit = 40,
  radius = 5,
  fill = 'var(--textColor)',
  userClick,
  style
}) => {
  // if (totalUsers.length === 0) return <span>Checking for other users...</span>
  const users = totalUsers
    // .filter(u => u.ip !== JSON.parse(localStorage.getItem('ip')))

  if (users.length === 0) return null

  let initialNodes = []
  let x = 0
  let y = 0

  // calculate initial node positions
  let next = null
  for (let i = 0; i < users.length; i++) {
  	if (next === null) {
      y += 2
      initialNodes.push([x, y])
      next += 1
  	} else if (next === 1) {
      y -= 2
      initialNodes.push([x, y])
      next += 1
  	} else if (next === 2) {
      y += 1; x += 2
  	  x = -x
      initialNodes.push([x, y])
      next += 1
  	} else if (next === 3) {
      x = -x
      initialNodes.push([x, y])
      next += 1
  	} else if (next === 4) {
      x = 0; y -= 3
      initialNodes.push([x, y])
      next = 2
  	}
  }

  // Multiply distances between nodes by the unit
  const nodes = initialNodes.map(node => node.map(coordinate => coordinate * unit))

  const min_x = -2 * unit
  const max_x = 2 * unit
  let range = [null, null, null]
  var pointString = ""
  for(let i = 0; i < nodes.length; i++) {
    // find range of values to know how high to draw outdside lines
    if (nodes[i][0] === min_x) {
      if (range[0] === null) range[0] = [nodes[i][1], nodes[i][1]]
	    if (nodes[i][1] < range[0][0]) range[0][0] = nodes[i][1]
	    if (nodes[i][1] > range[0][1]) range[0][1] = nodes[i][1]
  	}
    if (nodes[i][0] === max_x) {
	    if (range[1] === null) range[1] = [nodes[i][1], nodes[i][1]]
	    if (nodes[i][1] < range[1][0]) range[1][0] = nodes[i][1]
	    if (nodes[i][1] > range[1][1]) range[1][1] = nodes[i][1]
  	}
    if (nodes[i][0] === 0) {
	    if (range[2] === null) range[2] = [nodes[i][1], nodes[i][1]]
	    if (nodes[i][1] < range[2][0]) range[2][0] = nodes[i][1]
	    if (nodes[i][1] > range[2][1]) range[2][1] = nodes[i][1]
  	}

    // Calculate string to feed the polyline
  	pointString += `${nodes[i][0]},${nodes[i][1]} `
  	if (i === 2 || (i > 3 && i % 3 === 0)) pointString += `${nodes[i - 2][0]},${nodes[i - 2][1]} `
  	if (i === 3 || i === 5) pointString += `${nodes[1][0]},${nodes[1][1]} `
  	if (i > 3 && (i - 5) % 3 === 0) pointString += `${nodes[i - 4][0]},${nodes[i - 4][1]} `
  }

  const width = users.length > 1
    ? Math.abs(max_x) + Math.abs(min_x) + radius * 6
    : 60
  const height = users.length > 1
    ? Math.abs(range[2][0]) + Math.abs(range[2][1]) + radius * 8
    : 20

  return (
    <svg
      width={width}
      height={height}
      viewBox={`${-(width / 2)}, ${-(height - nodes[0][1] - radius * 4)}, ${width}, ${height}`}
      style={style}
    >
      <polyline
        points={pointString}
        style={{
          stroke: fill,
          strokeWidth: 0.9,
          fill: 'none'
        }}
      />
      {range[0] !== null && (
        <line
          x1={min_x}
          y1={range[0][0]}
          x2={min_x}
          y2={range[0][1]}
          stroke={fill}
          strokeWidth={1}
        />
      )}
      {range[1] !== null && (
        <line
          x1={max_x}
          y1={range[1][0]}
          x2={max_x}
          y2={range[1][1]}
          stroke={fill}
          strokeWidth={0.9}
        />
      )}
      {nodes.map((node, index) => users[index].id && process.browser
        ? (
          <image
            onClick={() => { userClick && userClick(users[index]) }}
            key={index}
            alt={`avatar-${users[index].username}`}
            href={URL.createObjectURL(new Blob([users[index].avatar]))}
            x={node[0] - 8}
            y={node[1] - 8}
            height='16'
            width='16'
            decoding='async'
            style={{ cursor: userClick ? 'pointer' : 'initial', background: 'white' }}
          >
            <title>{users[index].username}</title>
          </image>
        ) : (
          <Circle
            onClick={() => { userClick && userClick(users[index]) }}
            style={{ cursor: userClick ? 'pointer' : 'initial' }}
            key={index}
            cx={node[0]}
            cy={node[1]}
            r={radius}
            title='anonymous'
            fill={fill}
          />
        )
      )}
    </svg>
  )
}

export const SuperKaballah = ({ n = 3, style, speed = 1000, smol }) => {
  
  return (
    <div style={{
      height: smol ? 40 : 90,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      ...style
    }}>
      <AnimatedKaballah
        maxNodes={smol ? 12 : 24}
        radius={0}
        unit={smol ? 6 : 8}
        speed={speed}
        fill={`#ffffff${smol ? '88' : ''}`}
        style={{ position: 'absolute' }}
      />
      {n> 1 && <AnimatedKaballah
        radius={0}
        unit={smol ? 10 : 12}
        maxNodes={smol ? 8 : 16} 
        speed={speed}
        fill={`#ffffff${smol ? '66' : '88'}`}
        style={{ position: 'absolute', transform: 'rotate(180deg)' }}
      />}
      {n > 2 && <AnimatedKaballah
        maxNodes={smol ? 4 : 8} 
        radius={0}
        unit={smol ? 10 : 16}
        speed={speed}
        fill={`#ffffff${smol ? '22' : '44'}`}
        style={{ position: 'absolute', transform: 'rotate(180deg)' }}
      />}
    </div>
  )
}

export const AnimatedKaballah = ({
  speed = 2500,
  maxNodes = 16,
  style,
  fill='#ffffff',
  radius = 2.5,
  unit = 15,
}) => {
  const [nodes, setNodes] = useState(2)
  const [update, setUpdate] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => setUpdate(!update), speed)
    return () => clearInterval(interval)
  })

  const incrementNodes = prevNodes => {
    if (prevNodes >= maxNodes) return 2
    return prevNodes + 1
  }

  const calculateNodes = prevNodes => {
    const newNodes = parseInt((Math.random() * maxNodes) + 2)
    if (newNodes === prevNodes) {
      return calculateNodes(newNodes)
    } else return newNodes
  }

  useEffect(() => {
    setNodes(calculateNodes)
  }, [update])

  return (
    <Kaballah
      style={{
        transform: Math.random() > 0.5
          ? 'rotate(180deg) scaleX(-1)'
          : Math.random() > 0.5
            ? 'scaleY(-1)'
            : 'initial',
        ...style
      }}
      userClick={null}
      unit={unit}
      radius={radius}
      user={null}
      fill={fill}
      totalUsers={Array.from(Array(nodes).keys())}
    />
  )
}

const Circle = ({ fill, title, style, ...props }) => {

  return (
    <circle
      style={style}
      stroke={fill}
      strokeWidth={1}
      fill={fill}
      {...props}
    >
      {title && <title>{title}</title>}
    </circle>
  )
}
