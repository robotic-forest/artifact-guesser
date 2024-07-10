import { ImmersiveDialog } from "@/components/dialogs/ImmersiveDialog"
import { ImageView, defaultMapValue } from "../Artifact"
import { MainHeader } from "@/components/gameui/MainHeader"
import { AuthHeader } from "@/components/layout/AuthHeader"
import { themeCSS } from "@/components/GlobalStyles"
import { theme } from "@/pages/_app"

export const Immersive2D = ({ value, setValue, setImmersive, roundSummary, artifact }) => {

  return (
    <ImmersiveDialog
      value={value}
      setValue={setValue}
      visible
      closeDialog={() => {
        setValue(defaultMapValue)
        setImmersive(null)
      }}
      roundSummary={roundSummary && (
        <>
          <MainHeader />
          <AuthHeader />
          <div className='absolute bottom-1 right-1 z-10' css={themeCSS(theme)}>
            {roundSummary}
          </div>
        </>
      )}
    >
      <ImageView imgs={artifact.images.external} />
    </ImmersiveDialog>
  )
}