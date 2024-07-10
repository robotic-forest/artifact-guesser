import { themeCSS } from "@/components/GlobalStyles"
import { Artifact3D } from "@/components/art/Artifact3D"
import { IconButton } from "@/components/buttons/IconButton"
import { MainHeader } from "@/components/gameui/MainHeader"
import { AuthHeader } from "@/components/layout/AuthHeader"
import { theme } from "@/pages/_app"
import { IoMdReturnLeft } from "react-icons/io"

export const Immersive3D = ({ roundSummary, setImmersive }) => {

  return (
    <div css={{
      background: 'black',
      position: 'relative',
      height: '100vh',
      width: '100vw',
    }}>
      {roundSummary && (
        <>
          <MainHeader />
          <AuthHeader />
          <div className='absolute bottom-1 right-1 z-10' css={themeCSS(theme)}>
            {roundSummary}
          </div>
        </>
      )}
      <Artifact3D
        url='/3D/ram-amun.glb'
        canvasStyle={{
          width: '100vw',
          height: '100vh',
        }}
        scale={2}
        cameraPosition={[5, 5, 10]}
      />
      <div className='absolute bottom-1 left-1 z-10 flex items-center'>
        <IconButton tooltip='Back to Main View' onClick={() => setImmersive(null)} css={{
          background: 'black',
          color: 'white',
          border: '1px solid #ffffff55',
          '&:hover': {
            background: '#343434',
            color: 'white'
          },
          outline: 0
        }}>
          <IoMdReturnLeft />
        </IconButton>
      </div>
    </div>
  )
}