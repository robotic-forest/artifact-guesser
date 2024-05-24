import styled from "@emotion/styled"
import { MapInteractionCSS } from 'react-map-interaction'
import { Dialog } from "./Dialog"

export const ImmersiveDialog = ({ closeDialog, visible, children, bg, text }) => {

  return !visible ? null : (
    <Dialog
      title={null}
      width='95vw'
      height='90vh'
      visible={visible}
      closeDialog={closeDialog}
      fullScreen
    >
      <ExpandedStyles style={{ background: bg, color: text }}>
        <MapInteractionCSS maxScale={100}>
          {children}
        </MapInteractionCSS>
      </ExpandedStyles>
    </Dialog>
  )
}

export const ExpandedStyles = styled.div`
  position: relative;
  overflow: hidden;
  width: 100vw;
  height: 100vh;
  min-height: 100vh;
  min-height: -webkit-fill-available;

  @media (max-width: 500px), (min-aspect-ratio: 16/9) {
    width: 100%;
    min-height: 120vh;
    min-height: -webkit-fill-available;
    border-radius: 0;
  }
`