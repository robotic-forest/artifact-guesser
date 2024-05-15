import React, { useState, useEffect, useLayoutEffect, useRef } from 'react'
import ReactDOM from 'react-dom'
import styled from '@emotion/styled'
import { useHotkeys } from 'react-hotkeys-hook'
import useMeasure from 'react-use-measure'
import { useMediaQuery } from 'react-responsive'
import useWindowDimensions from '@/hooks/useWindowDimensions'
import { IoMdClose } from 'react-icons/io'
import { IconButton } from '../buttons/IconButton'

export const Dialog = props => {

  return process.browser
    ? ReactDOM.createPortal(<DialogComponent {...props} />, document.getElementById('__next'))
    : null
}

const DialogComponent = ({
  width = '600px',
  height,
  maxHeight,
  title = '',
  style,
  boxStyle,
  visible,
  closeDialog,
  centerMobile = false,
  inContent,
  fullScreen,
  noBoxBg,
  seeNoBG,
  noClose,
  children
}) => {
  const { height: windowHeight, width: windowWidth } = useWindowDimensions()
  const isMobile = useMediaQuery({ maxWidth: 499 })
  const [dialogBoxPosition, setDialogBoxPosition] = useState('start')
  const [box, bounds] = useMeasure()
  const [boxVisible, setBoxVisible] = useState(false)

  useHotkeys('esc', () => closeDialog())

  useEffect(() => {
    setScroll(visible, isMobile, inContent)
    return () =>  setScroll(false, isMobile, inContent)
  }, [visible, inContent, isMobile])

  useLayoutEffect(() => {
    if (bounds) {
      const boxHeight = bounds.height + 72
      setDialogBoxPosition(boxHeight > windowHeight || isMobile ? 'start' : 'center')
      setBoxVisible(true)
    }
    return () => setDialogBoxPosition('start')
  }, [bounds, windowHeight, visible, isMobile, title])

  const containerRef = useRef()
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scroll(0, 0)
    }
  }, [containerRef, visible])

  return !visible ? null : (
    <>
      {(seeNoBG || (!inContent && isMobile)) && visible && <DialogBackground />}
      <DialogContainer
        { ...{ fullScreen, style, visible } }
        onMouseDown={e => {
          if (!isMobile && e.clientX < windowWidth - 10) closeDialog()
        }}
        position={dialogBoxPosition}
        inContent={inContent && isMobile}
        hidden={!boxVisible} // Prevent scrollbar flash - wait until ref is rendered
        ref={containerRef}
      >
        <DialogBox
          className='active-dialog'
          ref={box}
          onMouseDown={boxClick}
          { ...{
            fullScreen,
            width,
            height,
            maxHeight,
            centerMobile,
            noBoxBg,
            style: boxStyle
          } }
        >
          {noBoxBg ? null : title
            ? <TitleContainer { ...{ fullScreen } }>
                <span className='title'>{title}</span>
                {!noClose && <Close { ...{ fullScreen } }>
                  <IconButton onClick={closeDialog}>
                    <IoMdClose />
                  </IconButton>
                </Close>}
              </TitleContainer>
            : noClose ? null : <Close { ...{ fullScreen } }>
                <IconButton onClick={closeDialog}>
                  <IoMdClose />
                </IconButton>
              </Close>
          }
          <DialogContent { ...{ fullScreen } }>
            {children}
          </DialogContent>
        </DialogBox>
      </DialogContainer>
    </>
  )
}

const setScroll = (visible, isMobile, inContent) => {
  const body = document.body.style

  if (isMobile) {
    if (!inContent && visible) body.position = "fixed"
    else body.position = "static"
  } else {
    if (visible) body.overflow = "hidden"
    else body.overflow = "auto"
  }
}

const boxClick = event => {
  event.stopPropagation()
  return false
}

const DialogBackground = styled.div`
  z-index: 99;
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: var(--backgroundColor);
`

const DialogContainer = styled.div`
  display: ${p => p.visible ? 'flex' : 'none'};
  background-color: var(--backgroundLowOpacity);
  color: var(--textColor);
  opacity: ${p => p.hidden && !p.inContent ? 0 : 1};

  ${p => !p.inContent && `
    position: fixed;
    overflow-y: ${p.position === 'start' && !p.fullScreen ? 'scroll' : 'auto'} !important;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
  `}

  @media (max-width: ${p => p.fullScreen ? '5000000' : '500'}px), (min-aspect-ratio: ${p => p.fullScreen ? '16/9' : ''}) {
    background-color: var(--backgroundColor);
  }

  z-index: 100;
  justify-content: center;
  align-items: ${p => p.position};
`

const DialogBox = styled.div`
  @media (max-width: ${p => p.fullScreen ? '5000000' : '500'}px), (min-aspect-ratio: ${p => p.fullScreen ? '16/9' : ''}) {
    width: 100%;
    max-width: 100vw;
    border: none;
    border-radius: 0;
    justify-content: ${p => p.centerMobile ? 'center' : 'start'};
    height: ${p => p.centerMobile ? '100vh' : 'auto'};
    align-items: center;
    margin: 0;
    /* this will look weird in chrome devtools, but is right for mobile */
    padding: ${p => p.fullScreen ? 0 : 15};
    box-shadow: none;
  }
  margin: 36px 10px;
  display: flex;
  flex-direction: column;
  width: ${p => p.width};
  max-width: 93vw;
  background-color: ${p => p.noBoxBg ? 'transparent' : 'var(--backgroundColor)'};
  border: 1px solid ${p => p.noBoxBg ? 'transparent' : 'var(--textVeryLowOpacity)'};
  border-radius: 6px;
  box-shadow: 0 10px 35px -5px var(--textKindaLowOpacity);
  padding: 10px;
  min-height: min-content;
  height: ${p => p.height};
  max-height: ${p => p.maxHeight};
  z-index: 100;

  @media (min-width: 500px) {
    animation: ${p => !p.fullScreen && !p.isMobile && 'slideDialogUp 0.2s, fadeIn 0.2s'};
    @keyframes slideDialogUp {
      0%   { margin-top: 72px; }
      100% { margin-top: 36px; }
    }
  }
`

const DialogContent = styled.div`
  height: 100%;

  @media (max-width: ${p => p.fullScreen ? '5000000' : '500'}px), (min-aspect-ratio: ${p => p.fullScreen ? '16/9' : ''}) {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
  }
`

const TitleContainer = styled.div`
  position: ${p => p.fullScreen ? 'fixed' : 'static'};
  top: 12px;
  left: 12px;
  z-index: 1;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin-bottom: 16px;

  .title {
    font-weight: 600;
    margin-right: 8px;
  }

  @media (max-width: ${p => p.fullScreen ? '5000000' : '500'}px), (min-aspect-ratio: ${p => p.fullScreen ? '16/9' : ''}) {
    align-self: start
  }
`

const Close = styled.div`
  @media (max-width: ${p => p.fullScreen ? '5000000' : '500'}px), (min-aspect-ratio: ${p => p.fullScreen ? '16/9' : ''}) {
    position: fixed;
    right: 0;
    top: 0;
    padding: 8px;
    box-sizing: content-box;
    z-index: 100;
  }
  cursor: pointer;
  margin-left: auto;
`
