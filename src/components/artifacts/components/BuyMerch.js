import { useMemo, useState, useEffect } from 'react'
import { Button } from '@/components/buttons/Button'
import { Dialog } from '@/components/dialogs/Dialog'
import { MasonryLayout } from '@/components/layout/MasonryLayout'
import { FaShoppingCart } from 'react-icons/fa'

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

export const BuyMerch = ({ artifact, style, className, type, useImage }) => {
  const [open, setOpen] = useState(false)

  const images = useMemo(() => artifact?.images?.external || [], [artifact])

  const cyclingExternalImage = useCyclingArray(images, 2000)

  const handleClick = () => {
    if (images.length === 1) {
      const img = images[0]
      const href = `http://protocodex.com/merch-gen?media-url=${encodeURIComponent(img)}&qr-link=${encodeURIComponent(`${window.location.origin}/artifacts/${artifact._id}`)}&text=${artifact.name}`
      window.open(href, '_blank', 'noopener,noreferrer')
      return
    }
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
        <BabelPreview onClick={handleClick} cyclingExternalImage={cyclingExternalImage} />
      )}

      <Dialog
        visible={open}
        closeDialog={() => setOpen(false)}
        title='Choose Which image to Buy'
        width='90vw'
      >
        <div css={{ padding: 10 }}>
          <MasonryLayout breaks={{ default: 6, 600: 2, 900: 3, 1200: 4, 1600: 5 }} gutter={0}>
            {images.map((img) => {
              const href = `http://protocodex.com/merch-gen?media-url=${encodeURIComponent(img)}&qr-link=${encodeURIComponent(`${window.location.origin}/artifacts/${artifact._id}`)}&text=${artifact.name}`
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

function BabelPreview({ onClick, cyclingExternalImage }) {
  const size= 1

  return (
    <div className='flex items-center justify-center relative top-[35px]' onClick={onClick} css={{
      userSelect: 'none',
      cursor: 'pointer',
      position: 'relative',
      '&:hover': { transform: 'translateY(-3px)', filter: 'brightness(1.2)' },
      '&:hover .generate-text': { opacity: 1 },
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



      <img src='/merch/babel.webp' css={{
        width: size * 100,
        height: size * 100,
        objectFit: 'cover',
        zIndex: 3,
        filter: 'drop-shadow(0 0 20px rgba(0,0,0,1))',
      }} />

      {cyclingExternalImage && (
        <img className='absolute' src={cyclingExternalImage} css={{
          height: size * 44,
          objectFit: 'cover',
          left: '50%',
          top: -size * 55,
          transform: 'translateX(-50%)',
          filter: 'brightness(1.2)',
          border: '1px solid #ffffff',
          boxShadow: '0 0 20px 5px rgba(0,0,0,0.7)',
          zIndex: 3,
        }} />
      )}

      {/* hover text to the right */}
      <div className='generate-text absolute text-nowrap' css={{
        pointerEvents: 'none',
        zIndex: 4,
        left: 'calc(50% + 60px)',
        top: '65%',
        transform: 'translateY(-50%)',
        opacity: 0,
        transition: 'opacity 0.25s ease',
        background: 'rgba(0,0,0)',
        color: '#fff',
        padding: '0 4px',
        fontSize: '12px'
      }}>
        Generate Merch
      </div>
    </div>
  )
}

// (interactive shadow editor removed per request)
