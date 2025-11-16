import { useMemo, useState, useEffect } from 'react'
import { keyframes } from '@emotion/react'
import { Button } from '@/components/buttons/Button'
import { Dialog } from '@/components/dialogs/Dialog'
import { CosmicInitiation } from '@/components/dialogs/CosmicInitiation'
import { MasonryLayout } from '@/components/layout/MasonryLayout'
import { FaShoppingCart } from 'react-icons/fa'
import { formatDateRange, formatLocation } from '@/lib/artifactUtils'

const useCyclingArray = (items, intervalMs = 1000) => {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (!items || items.length === 0) {
      setIndex(0)
      return
    }

    // reset to start when items change
    setIndex(0)

    if (items.length === 1) return

    const id = setInterval(() => {
      setIndex((i) => (i + 1) % items.length)
    }, intervalMs)

    return () => clearInterval(id)
  }, [items, intervalMs])

  return items && items.length ? items[index] : undefined
}

// (moved below BuyMerch as function declarations to allow hoisting)

export const BuyMerch = ({ artifact, style, className, type, useImage, babelSize = 1 }) => {
  const [open, setOpen] = useState(false)
  const [cosmicOpen, setCosmicOpen] = useState(false)

  const images = useMemo(() => artifact?.images?.external || [], [artifact])
  const title = useMemo(() => artifact?.name || 'Artifact', [artifact?.name])
  const findspot = useMemo(() => {
    try {
      return artifact?.location ? formatLocation(artifact.location) : undefined
    } catch (_) {
      return undefined
    }
  }, [artifact?.location])
  const dates = useMemo(() => {
    try {
      return artifact?.time ? formatDateRange(artifact.time.start, artifact.time.end, 'to') : undefined
    } catch (_) {
      return undefined
    }
  }, [artifact?.time?.start, artifact?.time?.end])
  const artifactDescription = useMemo(() => {
    const descriptionParts = []
    if (findspot) descriptionParts.push(findspot)
    if (dates) descriptionParts.push(dates)
    return `${descriptionParts.join(', ')}${descriptionParts.length ? '. ' : ''}found on artifactguesser.com`
  }, [findspot, dates])

  const cyclingExternalImage = useCyclingArray(images, 2000)

  const handleClick = () => {
    if (images.length === 1) {
      const img = images[0]
      const href =
        `http://protocodex.com/merch-gen?media-url=${encodeURIComponent(img)}` +
        `&qr-link=${encodeURIComponent(`https://artifactguesser.com/artifacts/${artifact._id}`)}` +
        `&title=${encodeURIComponent(title)}` +
        `&description=${encodeURIComponent(artifactDescription)}` +
        `&text=${encodeURIComponent(artifactDescription)}`
      window.open(href, '_blank', 'noopener,noreferrer')
      return
    }
    // Show cosmic initiation first; on close, open the selection dialog
    // setCosmicOpen(true)
    setOpen(true)
  }

  // Determine what to render based on new `type` prop
  // Backwards-compat: if `type` is not provided, map `useImage` (true => 'merch', false => 'button')
  const renderType = useMemo(() => {
    if (type) return type
    if (useImage === true) return 'merch'
    return 'button'
  }, [type, useImage])

  // Separate renderings for merch vs babel so styles can differ

  return (
    <div css={style} className={className}>
      {renderType === 'button' && (
        <Button onClick={handleClick} css={{
          background: 'var(--primaryColor)',
          color: 'black',
          '&:hover': {
            background: 'var(--primaryColorLight)',
            boxShadow: 'none',
          },
          border: '1px outset',
          borderColor: '#ffffff77 #00000077 #00000077 #ffffff77',
          boxShadow: 'none',
          borderRadius: 0,
          ...style,
        }}>
          <FaShoppingCart className='mr-2' />
          Buy Merch
        </Button>
      )}

      {renderType === 'merch' && (
        <MerchPreview onClick={handleClick} cyclingExternalImage={cyclingExternalImage} />
      )}

      {renderType === 'babel' && (
        <Babel onClick={handleClick} images={images} size={babelSize} />
      )}

      {/* <CosmicInitiation
        open={cosmicOpen}
        onClose={() => {
          setCosmicOpen(false)
          setOpen(true)
        }}
      /> */}

      <Dialog
        visible={open}
        closeDialog={() => setOpen(false)}
        title='Choose Which image to Buy'
        width='90vw'
      >
        <div css={{ padding: 10 }}>
          <MasonryLayout breaks={{ default: 6, 600: 2, 900: 3, 1200: 4, 1600: 5 }} gutter={0}>
            {images.map((img) => {
              const href =
                `http://protocodex.com/merch-gen?media-url=${encodeURIComponent(img)}` +
                `&qr-link=${encodeURIComponent(`https://artifactguesser.com/artifacts/${artifact._id}`)}` +
                `&title=${encodeURIComponent(title)}` +
                `&description=${encodeURIComponent(artifactDescription)}` +
                `&text=${encodeURIComponent(artifactDescription)}`
              return (
                <a
                  key={img}
                  href={href}
                  target='_blank'
                  rel='noreferrer'
                  css={{ display: 'block' }}
                >
                  <img
                    src={img}
                    css={{
                      width: '100%',
                      display: 'block',
                      transition: 'filter 0.15s ease',
                      '&:hover': { filter: 'brightness(1.2)' }
                    }}
                  />
                </a>
              )
            })}
          </MasonryLayout>
        </div>
      </Dialog>
    </div>
  )
}

// Exportable Merch component for external use (e.g., full-screen dialog)
export const Merch = ({ images, artifact, size = 1.5, onClick, noHover = false }) => {
  const resolvedImages = useMemo(() => {
    if (Array.isArray(images) && images.length > 0) {
      return images.map((it) => typeof it === 'string' ? it : (it?.src || it))
    }
    if (artifact?.images?.external?.length) return artifact.images.external
    return []
  }, [images, artifact])

  return (
    <Babel onClick={onClick} images={resolvedImages} size={size} noHover={noHover} />
  )
}

function MerchPreview({ onClick, cyclingExternalImage }) {
  return (
    <div className='flex items-center justify-center' onClick={onClick} css={{
      userSelect: 'none',
      cursor: 'pointer',
      position: 'relative',
      '&:hover': { filter: 'brightness(0.8)' },
    }}>
      <img src='/merch/shirt.webp' css={{
        width: 50,
        height: 50,
        objectFit: 'cover',
        filter: 'brightness(0.3)',
      }} />
      {cyclingExternalImage && (
        <img className='absolute' src={cyclingExternalImage} css={{
          width: 20,
          height: 20,
          objectFit: 'cover',
          left: '50%',
          top: 8,
          transform: 'translateX(-50%)',
        }} />
      )}
    </div>
  )
}

function Babel({ onClick, images, size = 1.5, noHover = false }) {
  // Scale all pixel-based distances with `size` to keep proportions stable
  const shirtStartTop = 45 * size           // where shirts emerge (scaled)
  const shirtLeftPx = -10 * size            // how far left from center shirts start (scaled)
  const shirtRightPx = 70 * size            // how far to travel to the right (scaled)
  const shirtSizePx = size * 20             // shirt size
  const shirtConcurrentCount = 4            // how many shirts visible at once
  const shirtSpawnIntervalSec = 1.5         // time between shirt spawns
  // Tweaks for input artwork stream
  const inputStartLeft = '40%'              // percentage-based, keep constant
  const inputStartTop = -80 * size          // initial vertical start (scaled)
  const inputEndTop = 40 * size             // end height (scaled)
  const inputHeightPx = size * 24           // input image height
  const inputDurationSec = 20               // animation duration for inputs (speed)
  const inputSpawnIntervalSec = 2.0         // time between input spawns
  // Hover text positioning and sizing
  const hoverTextLeftOffsetPx = 50 * size   // distance to the right of center (scaled)
  const hoverTextFontSizePx = 17 * size     // font size (scaled)
  const hoverTextHoverTopPx = 2 * size     // target top on hover (scaled)
  // Container vertical nudge to align component (scaled)
  const containerTopOffsetPx = 35 * size

  const streamIn = keyframes`
    0% {
      top: ${inputStartTop}px;
      opacity: 0;
    }
    12% {
      opacity: 1;
    }
    30% {
      top: ${inputEndTop}px;
      opacity: 1;
    }
    99% {
      top: ${inputEndTop}px;
      opacity: 1;
    }
    100% {
      top: ${inputEndTop}px;
      opacity: 1;
    }
  `
  const shirtStream = keyframes`
    0% {
      left: calc(50% - ${shirtLeftPx}px);
      top: ${shirtStartTop}px;
      opacity: 1;
    }
    20% {
      left: calc(50% - ${shirtLeftPx}px);
      top: ${shirtStartTop}px;
      opacity: 1;
    }
    60% {
      left: calc(50% - ${shirtLeftPx}px + ${shirtRightPx * 0.7}px);
      top: ${shirtStartTop}px;
      opacity: 0.8;
    }
    80% {
      left: calc(50% - ${shirtLeftPx}px + ${shirtRightPx}px);
      top: ${shirtStartTop}px;
      opacity: 0.5;
    }
    100% {
      left: calc(50% - ${shirtLeftPx}px + ${shirtRightPx * 1.2}px);
      top: ${shirtStartTop}px;
      opacity: 0;
    }
  `

  // choose stable sources per trail so each image remains constant
  const trailSources = useMemo(() => {
    if (!images || images.length === 0) return []
    // use all images for the stream
    return images
  }, [images])
  // inputs: ensure continuous stream by rendering a fixed number of concurrent instances
  const inputConcurrentCount = useMemo(() => {
    return Math.max(1, Math.ceil(inputDurationSec / inputSpawnIntervalSec))
  }, [inputDurationSec, inputSpawnIntervalSec])
  const inputSources = useMemo(() => {
    if (!trailSources.length) return []
    return Array.from({ length: inputConcurrentCount }, (_, i) => trailSources[i % trailSources.length])
  }, [trailSources, inputConcurrentCount])
  const shirtDurationSec = useMemo(() => {
    // exact multiple of spawn interval to keep a continuous stream
    return shirtConcurrentCount * shirtSpawnIntervalSec
  }, [shirtConcurrentCount, shirtSpawnIntervalSec])
  // limit concurrent shirts but keep a continuous stream using constant spawn interval
  const shirtSources = useMemo(() => {
    if (!trailSources.length) return []
    return Array.from({ length: shirtConcurrentCount }, (_, i) => trailSources[i % trailSources.length])
  }, [trailSources, shirtConcurrentCount])

  return (
    <div className='flex items-center justify-center relative' onClick={onClick} css={{
      userSelect: 'none',
      cursor: noHover ? 'default' : 'pointer',
      position: 'relative',
      top: containerTopOffsetPx,
      ...(noHover ? {} : { '&:hover': { filter: 'brightness(1.2)' } }),
      ...(noHover ? {} : { '&:hover .generate-text': { opacity: 1, top: `${hoverTextHoverTopPx}px` } }),
      transition: 'transform 0.3s ease, filter 0.3s ease',
    }}>
      {/* <div className='absolute' css={{
        pointerEvents: 'none',
        zIndex: 0,
        left: '40%',
        top: size * 90,
        transform: 'translate(-50%, -50%)',
        width: size * 250,
        height: size * 250,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(0,0,0,1) 0%, rgba(0,0,0,8) 20%, rgba(0,0,0,0.4) 40%, rgba(0,0,0,0.1) 60%, rgba(0,0,0,0) 70%)',
      }} /> */}



      <img src='/merch/babel-fg.webp' css={{
        width: size * 100,
        height: size * 100,
        objectFit: 'cover',
        zIndex: 4,
        filter: 'drop-shadow(0 0 20px rgba(0,0,0,1))',
      }} />
      <img src='/merch/babel-bg.webp' className='absolute' css={{
        width: size * 100,
        height: size * 100,
        objectFit: 'cover',
        zIndex: 3,
        filter: 'drop-shadow(0 0 20px rgba(0,0,0,1)) brightness(1.2)',
      }} />

      {inputSources.length > 0 && (
        <>
          {inputSources.map((src, i) => {
            const durationSec = inputDurationSec
            const staggerSec = inputSpawnIntervalSec
            return (
            <img
              key={`input-${i}`}
              className='absolute'
              src={src}
              css={{
                height: inputHeightPx,
                objectFit: 'cover',
                left: inputStartLeft,
                top: inputStartTop,
                transform: 'translateX(-50%)',
                filter: 'brightness(1.2)',
                // border: '1px solid #ffffff',
                zIndex: 3,
                opacity: 1,
                animation: `${streamIn} ${durationSec}s linear infinite`,
                animationDelay: `-${i * staggerSec}s`,
                animationFillMode: 'both',
                willChange: 'left, top, opacity',
              }}
            />
            )
          })}
        </>
      )}

      {!noHover && (
        <>
        {/* hover text to the right */}
      <div className='generate-text absolute text-nowrap flex items-center' css={{
        pointerEvents: 'none',
        zIndex: 4,
        left: `calc(50% + ${hoverTextLeftOffsetPx}px)`,
        top: '15%',
        transform: 'translateY(-50%)',
        opacity: 0,
        transition: 'all 0.45s ease',
        color: '#fff',
        fontSize: `${hoverTextFontSizePx}px`
      }}>
        <img
          src='/merch/moloch.webp'
          className='brightness-150 invert'
          css={{
            width: `${50 * size}px !important`,
            height: 'auto',
          }}
        />
        <div className='ml-2 relative top-[-2px] font-mono'>
          <div className='bg-black'>Feed the <span className='text-red-500 font-bold'>Capitalist Machine</span>!</div>
            <div className='bg-black w-[min-content]'>Buy this artifact as merch.</div>
          </div>
        </div>
        </>
      )}

      {/* Shirt stream emerging from the building center, moving right, then fading */}
      {shirtSources.length > 0 && (
        <>
          {shirtSources.map((src, i) => {
            const durationSec = shirtDurationSec
            const staggerSec = shirtSpawnIntervalSec
            return (
              <div
                key={`shirt-${i}`}
                className='absolute'
                css={{
                  width: shirtSizePx,
                  height: shirtSizePx,
                  left: `calc(50% - ${shirtLeftPx}px)`,
                  top: shirtStartTop,
                  transform: 'translateX(-50%)',
                  zIndex: 3,
                  opacity: 0,
                  animation: `${shirtStream} ${durationSec}s linear infinite`,
                  animationDelay: `-${i * staggerSec}s`,
                  animationFillMode: 'both',
                  willChange: 'left, top, opacity',
                }}
              >
                <img
                  src='/merch/shirt.webp'
                  css={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    filter: 'brightness(0.95)',
                  }}
                />
                <img
                  src={src}
                  className='absolute'
                  css={{
                    width: '45%',
                    height: '45%',
                    objectFit: 'cover',
                    left: '50%',
                    top: '44%',
                    transform: 'translate(-50%, -50%)',
                    border: '1px solid #ffffff',
                  }}
                />
              </div>
            )
          })}
        </>
      )}
    </div>
  )
}

// (interactive shadow editor removed per request)
