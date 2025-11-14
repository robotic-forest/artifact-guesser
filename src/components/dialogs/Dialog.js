import React, { useState, useEffect, useLayoutEffect, useRef, createContext, useContext } from 'react'
import ReactDOM from 'react-dom'
import styled from '@emotion/styled'
import { useHotkeys } from 'react-hotkeys-hook'
import useMeasure from 'react-use-measure'
import { useMediaQuery } from 'react-responsive'
import useWindowDimensions from '@/hooks/useWindowDimensions'
import { IoMdClose } from 'react-icons/io'
import { IconButton } from '../buttons/IconButton'
import { Button } from '../buttons/Button'
import { FormProvider, useForm } from 'react-hook-form'

export const ConfirmDialog = ({
  msg,
  visible,
  closeDialog,
  confirmText,
  onConfirm,
  confirmColor,
  title
}) => {

  return (
    <Dialog
      visible={visible}
      closeDialog={closeDialog}
      title={title}
    >
      <div css={{ marginBottom: 32 }}>
        {msg || 'Are you sure?'}
      </div>
      <div css={{ display: 'flex', float: 'right' }}>
        <Button
        small
          css={{ marginRight: 8 }}
          variant='outlined'
          onClick={closeDialog}
        >
          Cancel
        </Button>
        <Button onClick={onConfirm} color={confirmColor}>
          {confirmText || 'Confirm'}
        </Button>
      </div>
    </Dialog>
  )
}

const PromiseDialogContext = createContext()

export const useConfirmation = () => useContext(PromiseDialogContext)

export const PromiseDialog = ({ children }) => {
  const [confirmationState, setConfirmationState] = useState(null)

  const awaitingPromiseRef = useRef()

  const openConfirmation = options => {
    setConfirmationState(options)
    return new Promise(resolve => {
      awaitingPromiseRef.current = { resolve }
    })
  }

  const handleClose = () => {
    if (awaitingPromiseRef.current) {
      awaitingPromiseRef.current.resolve(false)
    }

    setConfirmationState(null)
  }

  const onSubmit = data => {
    
    if (awaitingPromiseRef.current) {
      awaitingPromiseRef.current.resolve(data)
    }

    setConfirmationState(null)
  }

  return (
    <>
      <PromiseDialogContext.Provider value={openConfirmation} children={children} />
      <Dialog
        visible={!!confirmationState}
        closeDialog={() => handleClose()}
        contentStyle={{ width: 600 }}
        title={confirmationState?.title}
      >
        {confirmationState?.description && (
          <div css={{
            marginBottom: 16
          }}>
            {confirmationState?.description}
          </div>
        )}
        {confirmationState?.form && (
          <PromiseDialogForm {...{ confirmationState, onSubmit, handleClose }} />
        )}
        {!confirmationState?.form && (
          <div css={{ display: 'flex', float: 'right' }}>
            {!confirmationState?.noCancel && (
              <Button
                small
                css={{ marginRight: 10 }}
                variant='outlined'
                onClick={handleClose}
              >
                {confirmationState?.cancelText || 'Cancel'}
              </Button>
            )}
            <Button onClick={onSubmit} color={confirmationState?.confirmColor}>
              {confirmationState?.confirmText || 'Confirm'}
            </Button>
          </div>
        )}
      </Dialog>
    </>
  )
}

const PromiseDialogForm = ({ confirmationState, onSubmit, handleClose }) => {
  const formProps = useForm({
    defaultValues: confirmationState.formDefaults
  })

  return (
    <form onSubmit={formProps.handleSubmit(onSubmit)}>
      <div css={{
        marginBottom: 16
      }}>
        <FormProvider {...formProps}>
          {confirmationState?.form(formProps)}
        </FormProvider>
        <div css={{ display: 'flex', float: 'right' }}>
          {!confirmationState.noCancel && (
            <Button
              css={{ marginRight: 10 }}
              variant='outlined'
              onClick={handleClose}
            >
              Cancel
            </Button>
          )}
          <Button type='submit'>
            {confirmationState?.confirmText || 'Confirm'}
          </Button>
        </div>
      </div>
    </form>
  )
}


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
  // ported props for compatibility with protocodex Dialog
  noTitle,
  boxBg,
  radialEffect,
  containerBg,
  transparentFullscreen,
  entryAnimation,
  entryDuration,
  clickThrough,
  shouldCloseOnBackdropClick,
  children
}) => {
  const { height: windowHeight, width: windowWidth } = useWindowDimensions()
  const isMobile = useMediaQuery({ maxWidth: 499 })
  const [dialogBoxPosition, setDialogBoxPosition] = useState('start')
  const [box, bounds] = useMeasure()
  const [boxVisible, setBoxVisible] = useState(false)
  const [backdropPointer, setBackdropPointer] = useState(false)

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

  // Derive optional entry animation from radialEffect[0]
  const entryAnimEffect = (Array.isArray(radialEffect) ? radialEffect : []).find(e => e && (e.animation || e.entryAnimation || e.entryDuration))
  const derivedEntryAnimation = entryAnimEffect
    ? (entryAnimEffect.animation?.type || entryAnimEffect.entryAnimation || 'fade')
    : undefined
  const derivedEntryDuration = entryAnimEffect
    ? (entryAnimEffect.animation?.duration || entryAnimEffect.entryDuration || '0.25s')
    : undefined

  // Prefer explicitly provided props over radialEffect-derived values
  const finalEntryAnimation = entryAnimation ?? derivedEntryAnimation ?? 'fadeUp'
  const finalEntryDuration = entryDuration ?? derivedEntryDuration

  return !visible ? null : (
    <>
      {(transparentFullscreen || seeNoBG || (!inContent && isMobile)) && visible && (() => {
        const hasArray = Array.isArray(radialEffect) && radialEffect.length > 0
        const effects = hasArray ? radialEffect.filter(e => e && e.type === 'blur') : []
        const baseMin = hasArray ? effects.reduce((m, e) => Math.max(m, typeof e.min === 'number' ? e.min : parseFloat(e.min || 0) || 0), 0) : 0
        return (
          <DialogBackground>
            {hasArray && baseMin > 0 && (
              <BackdropLayer blur={baseMin} />
            )}
            {hasArray && effects.map((e, i) => {
              const max = typeof e.max === 'number' ? e.max : parseFloat(e.max || 0) || 0
              const extra = Math.max(0, Math.sqrt(Math.max(0, max*max - baseMin*baseMin)))
              return (
                <RadialMaskLayer
                  key={i}
                  extraBlur={extra}
                  centerX={e.centerX || '50%'}
                  centerY={e.centerY || '50%'}
                  inner={e.inner || '30%'}
                  taper={e.taper || '15%'}
                  outer={e.outer || '60%'}
                  invert={!!e.invert}
                />
              )
            })}
          </DialogBackground>
        )
      })()}
      <DialogContainer
        { ...{ fullScreen, style, visible } }
        onMouseDown={e => {
          if (clickThrough) return
          if (transparentFullscreen) {
            if (typeof shouldCloseOnBackdropClick === 'function') {
              const { clientX, clientY } = e
              const shouldClose = !!shouldCloseOnBackdropClick(clientX, clientY)
              if (shouldClose) closeDialog()
            } else {
              closeDialog()
            }
          } else if (!isMobile && e.clientX < windowWidth - 10) closeDialog()
        }}
        onMouseMove={e => {
          if (transparentFullscreen && typeof shouldCloseOnBackdropClick === 'function') {
            const { clientX, clientY } = e
            setBackdropPointer(!!shouldCloseOnBackdropClick(clientX, clientY))
          } else {
            setBackdropPointer(false)
          }
        }}
        position={dialogBoxPosition}
        inContent={inContent && isMobile}
        hidden={!boxVisible} // Prevent scrollbar flash - wait until ref is rendered
        ref={containerRef}
        containerBg={containerBg}
        clickThrough={!!clickThrough}
        transparentFullscreen={transparentFullscreen}
        backdropPointer={backdropPointer}
      >
        {transparentFullscreen
          ? (
            <div
              onMouseDown={clickThrough ? undefined : (shouldCloseOnBackdropClick ? undefined : boxClick)}
              style={{ width: '100%', height: '100%', pointerEvents: clickThrough ? 'none' : undefined }}
            >
              {children}
            </div>
          )
          : (
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
                css: boxStyle,
                entryAnimation: finalEntryAnimation,
                entryDuration: finalEntryDuration
              } }
            >
              {noBoxBg ? null : title
                ? <TitleContainer { ...{ fullScreen } }>
                    <span className='title'>{title}</span>
                    {!noClose && <Close { ...{ fullScreen } }>
                      <IconButton onClick={closeDialog} css={{ '&:hover': { background: 'var(--backgroundColorDark)' } }}>
                        <IoMdClose />
                      </IconButton>
                    </Close>}
                  </TitleContainer>
                : (noClose || noTitle) ? null : <Close { ...{ fullScreen } }>
                    <IconButton onClick={closeDialog} css={{ '&:hover': { background: 'var(--backgroundColorDark)' } }}>
                      <IoMdClose />
                    </IconButton>
                  </Close>
              }
              <DialogContent { ...{ fullScreen } }>
                {children}
              </DialogContent>
            </DialogBox>
          )}
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
  background-color: transparent;
  pointer-events: none;
`

const BackdropLayer = styled.div`
  position: fixed;
  inset: 0;
  pointer-events: none;
  backdrop-filter: ${p => `blur(${typeof p.blur === 'number' ? p.blur + 'px' : p.blur})`};
  -webkit-backdrop-filter: ${p => `blur(${typeof p.blur === 'number' ? p.blur + 'px' : p.blur})`};
`

const RadialMaskLayer = styled.div`
  position: fixed;
  inset: 0;
  pointer-events: none;
  backdrop-filter: ${p => `blur(${typeof p.extraBlur === 'number' ? p.extraBlur + 'px' : p.extraBlur})`};
  -webkit-backdrop-filter: ${p => `blur(${typeof p.extraBlur === 'number' ? p.extraBlur + 'px' : p.extraBlur})`};
  ${p => {
    const cx = p.centerX || '50%'
    const cy = p.centerY || '50%'
    const inner = p.inner || '30%'
    const taper = p.taper || '15%'
    const outer = p.outer || '60%'
    const maskInside = `radial-gradient(circle at ${cx} ${cy}, rgba(0,0,0,1) ${inner}, rgba(0,0,0,1) calc(${inner} + ${taper}), rgba(0,0,0,0) ${outer})`
    const maskOutside = `radial-gradient(circle at ${cx} ${cy}, rgba(0,0,0,0) ${inner}, rgba(0,0,0,1) calc(${inner} + ${taper}), rgba(0,0,0,1) ${outer}, rgba(0,0,0,0) calc(${outer} + 1%))`
    return `
      mask-image: ${p.invert ? maskOutside : maskInside};
      -webkit-mask-image: ${p.invert ? maskOutside : maskInside};
      mask-size: 100% 100%;
      -webkit-mask-size: 100% 100%;
      mask-position: 0 0;
      -webkit-mask-position: 0 0;
      mask-repeat: no-repeat;
      -webkit-mask-repeat: no-repeat;
    `
  }}
`

const DialogContainer = styled.div`
  display: ${p => p.visible ? 'flex' : 'none'};
  /* background-color: var(--backgroundVeryLowOpacity); */
  color: var(--textColor);
  opacity: ${p => p.hidden && !p.inContent ? 0 : 1};
  background-color: ${p => p.containerBg || 'transparent'};
  pointer-events: ${p => p.clickThrough ? 'none' : 'auto'};
  cursor: ${p => p.backdropPointer ? 'pointer' : 'default'};

  ${p => !p.inContent && `
    position: fixed;
    overflow-y: ${p.position === 'start' && !p.fullScreen ? 'scroll' : 'auto'} !important;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
  `}

  @media (max-width: ${p => p.fullScreen ? '5000000' : '500'}px), (min-aspect-ratio: ${p => p.fullScreen ? '16/9' : ''}) {
    background-color: ${p => p.containerBg || 'var(--backgroundColor)'};
  }

  z-index: 1000000;
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
  border-radius: 0px;
  /* box-shadow: 0 10px 35px -5px var(--textKindaLowOpacity); */
  padding: 10px;
  min-height: min-content;
  height: ${p => p.height};
  max-height: ${p => p.maxHeight};
  z-index: 100;
  position: relative;

  ${p => {
    const duration = p.entryDuration || '0.6s'
    if (p.entryAnimation === 'fade') return `animation: fadeIn ${duration};`
    if (p.entryAnimation === 'fadeUp') return `animation: fadeInUp ${duration};`
    if (p.entryAnimation === 'none') return ''
    return ''
  }}

  @media (min-width: 500px) {
    /* animation: ${p => !p.fullScreen && !p.isMobile && 'slideDialogUp 0.2s, fadeIn 0.2s'};
    @keyframes slideDialogUp {
      0%   { margin-top: 72px; }
      100% { margin-top: 36px; }
    } */
  }

  @keyframes fadeIn {
    0% { opacity: 0; }
    100% { opacity: 1; }
  }
  @keyframes fadeInUp {
    0% { opacity: 0; transform: translateY(18px); }
    100% { opacity: 1; transform: translateY(0); }
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
  position: absolute;
  top: 6px;
  right: 6px;
`
