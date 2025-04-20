import { Suspense,  useMemo, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import dynamic from 'next/dynamic'
import { OrbitControls, useGLTF } from '@react-three/drei'
import { SuperKaballah } from './Kaballah'

export const Artifact3D = ({ canvasStyle, cameraPosition, ...props }) => {
  const [rotate, setRotate] = useState(true)

  return (
    <Suspense fallback={(
      <SuperKaballah n={2} style={canvasStyle} speed={500} smol color='#000000' />
    )}>
      <Canvas
        style={canvasStyle}
        camera={{ position: cameraPosition }}
        onMouseOver={() => setRotate(false)}
      >
        <Scene {...props} rotate={rotate} />
      </Canvas>
    </Suspense>
  )
}

const Scene = ({ url, scale, rotate, noZoom }) => {
  
  return (
    <>
      {/* <pointLight position={[10, 10, 10]} /> */}
      <ambientLight intensity={0.5} />
      <Model url={url} scale={scale} rotate={rotate} position={[0, -0.35, 0]} />
      <OrbitControls
        enableZoom={!noZoom}
        enablePan={!noZoom}
        maxPolarAngle={Math.PI / 2}
        minPolarAngle={0}
      />
    </>
  )
}


const Model = dynamic(() => Promise.resolve(DisgustingPrimitive), { ssr: false })

const DisgustingPrimitive = ({ url, scale, position, rotate }) => {
  const ref = useRef()
  const { scene } = useGLTF(url)
  const copiedScene = useMemo(() => scene.clone(), [scene])

  useFrame(() => {
    if (rotate) ref.current.rotation.y += 0.004
  })

  return (
    <group ref={ref}>
      <primitive
        position={position}
        object={copiedScene}
        rotation={[0, Math.PI / 2, 0]}
        scale={scale}
      />
    </group>
  )
}