import { Collosus } from "../art/Collosus"

export const Collosi = ({ className }) => {

  return(
    <div className={className}>
      <Collosus
        preview='super' 
        color='#35ad8d'
        gltf='/3D/mesoamerican-stela-lowres.gltf'
        reactionSpeed={20}
        scale={0.3}
        canvasStyle={{
          marginRight: 8,
          width: 120,
          height: 120,
          zIndex: 666
        }}
        // divideBy={0.8}
      />
      <Collosus
        color='#35ad8d'
        gltf='/3D/tula-colossus-low-res.gltf'
        reactionSpeed={20}
        canvasStyle={{
          width: 120,
          height: 120,
          zIndex: 666
        }}
        scale={0.3}
        // divideBy={1.8}
        preview='super' 
      />
    </div>
  )
}