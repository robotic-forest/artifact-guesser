import React, { useRef, Suspense, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import dynamic from 'next/dynamic'
import { MeshDistortMaterial, OrthographicCamera, useGLTF } from '@react-three/drei'
import useWindowDimensions from '@/hooks/useWindowDimensions'
import { SuperKaballah } from '../art/Kaballah'

const Model = dynamic(() => Promise.resolve(Map), { ssr: false })

const Map = ({ url, placeholderColor, reactionSpeed = 10, scale = 1, divideBy }) => {
  const group = useRef()
  
  const { x: mx, y: my } = useMousePosition()
  const { width, height } = useWindowDimensions()

  useFrame(() => {
    const x = Math.max(-2, Math.min(2, normalize(mx,  width)))
    group.current.rotation.y += (x / reactionSpeed  - group.current.rotation.y / reactionSpeed)

    const y = Math.max(-2, Math.min(1, normalize(my, height)))
    group.current.rotation.x += (y / reactionSpeed  - group.current.rotation.x / reactionSpeed)
  })

  return (
    <group
      ref={group}
      position={[0, 0, 0]}
      dispose={null}
      scale={0.05}
    >
      {url ? (
        <DisgustingPrimitive url={url} scale={scale} />
      ) : (
        <mesh>
          <boxGeometry args={[2, 3, 1]} />
          <meshStandardMaterial color={placeholderColor} />
        </mesh>
      )}
    </group>
  )
}

const DisgustingPrimitive = ({ url, scale }) => {
  const { scene } = useGLTF(url)
  const copiedScene = useMemo(() => scene.clone(), [scene])

  return (
    <primitive
      position={[0, 0, 0]}
      object={copiedScene}
      scale={scale}
    />
  )
}

export const Collosus = ({ gltf, color, reactionSpeed, canvasStyle, scale, preview, divideBy = 1 }) => {

  return (
    <Suspense fallback={preview ? preview === 'super' ? (
      <SuperKaballah n={2} style={canvasStyle} speed={500} smol color='#000000' />
    ) : (
      <div style={canvasStyle} />
    ) : null}>
      <Canvas style={canvasStyle}>
        <OrthographicCamera
          position={[0, 0, 5]}
          zoom={190}
          near={1}
          far={100}
          makeDefault
        />
        <ambientLight />
        <pointLight position={[10, 10, 10]} />
        <Model url={gltf} placeholderColor={color} reactionSpeed={reactionSpeed} scale={scale} divideBy={divideBy} />

        <mesh scale={0.4 * scale} position={[0, 0, -1]}>
          <circleGeometry />
          <MeshDistortMaterial color='#ffffff' opacity={0.3} transparent distort={0.3} speed={0.7} />
        </mesh>
        <mesh scale={0.7 * scale} position={[0, 0, -1]}>
          <circleGeometry />
          <MeshDistortMaterial color='#ffffff' opacity={0.3} transparent distort={0.4} speed={0.7} />
        </mesh>
        <mesh scale={0.9 * scale} position={[0, 0, -1]}>
          <circleGeometry />
          <MeshDistortMaterial color='#ffffff' opacity={0.3} transparent distort={0.5} speed={0.7} />
        </mesh>
      </Canvas>
    </Suspense>
  )
}

function normalize(x, max) {
  return (x / max) * 2 - 1;
}

const useMousePosition = () => {
  const [
    mousePosition,
    setMousePosition
  ] = React.useState({ x: null, y: null });
  React.useEffect(() => {
    const updateMousePosition = ev => {
      setMousePosition({ x: ev.clientX, y: ev.clientY });
    };
    window.addEventListener('mousemove', updateMousePosition);
    return () => {
      window.removeEventListener('mousemove', updateMousePosition);
    };
  }, []);
  return mousePosition;
};

