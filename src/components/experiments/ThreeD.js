import { Artifact3D } from "../art/Artifact3D"

export const ThreeD = () => {

  return (
    <div css={{
      height: '100vh',
      width: '100vw',
    }}>
      <Artifact3D
        url='/3D/ram-amun.glb'
        canvasStyle={{
          width: '100%',
          height: '100%',
        }}
        scale={2.5}
      />
    </div>
  )
}