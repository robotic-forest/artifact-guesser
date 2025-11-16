import { useEffect, useMemo, useState } from 'react'
import { keyframes } from '@emotion/react'
import { Dialog } from '@/components/dialogs/Dialog'
import { Merch } from '@/components/artifacts/components/BuyMerch'
import { Button } from '@/components/buttons/Button'
import { useMediaQuery } from 'react-responsive'
import { IconGenerator } from './IconGenerator'
import { MasonryLayout } from '@/components/layout/MasonryLayout'
import { formatDateRange, formatLocation } from '@/lib/artifactUtils'

export const MoneyDialog = ({ visible, onClose, images }) => {
  const isMobile = useMediaQuery({ maxWidth: 600 })
  const [chooserOpen, setChooserOpen] = useState(false)

  return (
    <Dialog
      visible={visible}
      closeDialog={onClose}
      fullScreen
    >
      <div className='w-[100vw] h-[100vh] flex items-start justify-center pb-20' css={{
        '@media (min-width: 600px)': {
          paddingTop: chooserOpen ? 20 : '90px',
        },
        overflowY: 'auto',
        paddingTop: chooserOpen ? 10 : '40px',
      }}>
          <div id='scrollsalot' className='flex flex-col items-center justify-center' css={{}}>
            {!chooserOpen ? (
              <>
                <div className='flex flex-col items-center text-md mb-8 text-start w-[600px]'>
                  <div className='px-4 mb-1 max-w-[100vw] w-[400px]'>Hey, dev here.</div>
                  <div className='px-4 mb-4 max-w-[100vw] w-[400px]'>
                    <span className='text-red-400'>Help.</span> My pet chickens and goats have banded together in a vegan gay communist uprising,
                    and are demanding I make money to buy them expensive things to eat and poop on.
                  </div>
                  <Boops size={70} speed={60} gap={16} />
                  <div className='mt-4 px-4 mb-4 max-w-[100vw] w-[400px]'>I built a merch generator that lets you buy the artifacts you just found as shirts, sweaters etc.</div>
                  <div className='px-4 mb-4 max-w-[100vw] w-[400px]'>Please give me money.<br/> Please.<br/>I'm scared.</div>
                </div>
                <div className='flex items-center justify-center relative'>
                  <div className='absolute z-10 font-mono text-xs w-[100px]' css={{
                    left: '180px',
                    top: '40px',
                    '@media (max-width: 600px)': { left: '160px' }
                  }}>
                    <div className='flex items-center gap-1 mb-1 text-lg'>
                      <IconGenerator />
                      <IconGenerator />
                    </div>
                    powered by<br/>unholy forces<br/>
                    <IconGenerator className='mt-1 text-lg' />
                  </div>
                  <Merch images={images} size={isMobile ? 1.7 : 2} noHover />
                </div>
              </>
            ) : (
              <div css={{ padding: 10, width: '100%', boxSizing: 'border-box' }}>
                <div className='text-md font-mono w-full text-center mb-4 px-4'>
                  Choose an artifact. Will open Merch Generator in new tab.
                </div>
                <MasonryLayout breaks={{ default: 6, 600: 2, 900: 3, 1200: 4, 1600: 5 }} gutter={0}>
                  {(images || []).map((img, idx) => {
                    const media = typeof img === 'string' ? img : (img?.src || img)
                    const src = media?.startsWith('http') || media?.startsWith('/') ? media : `/boops/${media}`
                    const artifactId = typeof img === 'object' ? img?.artifactId : undefined
                    const artifactName = typeof img === 'object' ? img?.artifactName : undefined
                    const artifactLocation = typeof img === 'object' ? img?.artifactLocation : undefined
                    const artifactTime = typeof img === 'object' ? img?.artifactTime : undefined
                    const findspot = artifactLocation ? formatLocation(artifactLocation) : undefined
                    const dates = artifactTime ? formatDateRange(artifactTime.start, artifactTime.end, 'to') : undefined
                    const descriptionParts = []
                    if (findspot) descriptionParts.push(findspot)
                    if (dates) descriptionParts.push(dates)
                    const artifactDescription = `${descriptionParts.join(', ')}${descriptionParts.length ? '. ' : ''}found on artifactguesser.com`

                    const url = artifactId ? `https://artifactguesser.com/artifacts/${artifactId}` : undefined
                    const href = `http://protocodex.com/merch-gen?media-url=${encodeURIComponent(src)}` +
                      `${url ? `&qr-link=${encodeURIComponent(url)}` : ''}` +
                      `&title=${encodeURIComponent(artifactName || 'Artifact')}` +
                      `&text=${encodeURIComponent(artifactDescription || 'Artifact')}`

                    return (
                      <a
                        key={`${src}-${idx}`}
                        href={href}
                        target='_blank'
                        rel='noreferrer'
                        css={{ display: 'block' }}
                      >
                        <img
                          src={src}
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
                <div
                  className='fixed bottom-2 left-0 right-0 w-full text-center mt-2 underline'
                  css={{
                    marginTop: 8,
                    textDecoration: 'underline',
                    cursor: 'pointer',
                    '&:hover': {
                      opacity: 0.8,
                    }
                  }}
                  onClick={onClose}
                >
                  <span className='p-1 px-2 bg-black'>I'm done, go to Round Summary</span>
                </div>
              </div>
            )}
          {!chooserOpen && (
            <div
              className='fixed bottom-0 left-0 right-0 flex flex-col items-center justify-center z-10 bg-black pb-4'
              css={{
                '@media (min-height: 900px)': {
                  position: 'relative',
                  top: 100
                }
              }}
            >
              <Button
                variant='outlined'
                css={{
                  background: 'var(--primaryColor)',
                  color: 'black',
                  '&:hover': {
                    background: 'var(--primaryColorLight)',
                    color: 'black',
                  },
                  border: '1px outset',
                  borderColor: '#ffffff77 #00000077 #00000077 #ffffff77',
                  boxShadow: 'none',
                  borderRadius: 0,
                  padding: '2px 10px',
                  fontSize: '0.9em',
                  fontWeight: 500,
                  fontFamily: 'monospace',
                }}
                onClick={() => setChooserOpen(true)}
              >
                Launch Merch Generator
              </Button>
              <div
                className='mt-2 underline'
                css={{
                  marginTop: 8,
                  textDecoration: 'underline',
                  cursor: 'pointer',
                  '&:hover': {
                    opacity: 0.8,
                  }
                }}
                onClick={onClose}
              >
                No, you capitalist swine
              </div>
            </div>
          )}
        </div>
      </div>
    </Dialog>
  )
}

export const DEFAULT_BOOPS = {
  'shake.webp': 'Shakespeare',
  'pene.webp': 'Penelope',
  'fern.webp': 'Fern',
  'dandelion.webp': 'Dandelion',
  'gabbro.webp': 'Gabbro',
  'gale.webp': 'Gale',
  'mocha.webp': 'Mocha',
  'marigold.webp': 'Cranberry'
}

export const Boops = ({ size = 50, speed = 30, gap = 8, images, fade = 60 }) => {
  const deriveNameFromFile = (file) => {
    const base = String(file || '')
      .replace(/^.*\//, '')
      .replace(/\.[^/.]+$/, '')
      .replace(/[-_]+/g, ' ')
      .trim()
    return base.replace(/\b\w/g, c => c.toUpperCase())
  }

  // Normalize input into [{ src, name }]
  const items = useMemo(() => {
    // images can be:
    // - array of strings (filenames or paths)
    // - array of objects { src?, file?, path?, name?/label? }
    // - object map { filenameOrPath: 'Human Name' } or { filename: { name: '...', src?: '...' } }
    if (Array.isArray(images) && images.length) {
      return images.map(entry => {
        if (typeof entry === 'string') {
          const raw = entry
          const src = raw.startsWith('/boops/') ? raw : `/boops/${raw}`
          const filename = raw.replace(/^.*\//, '')
          const name = DEFAULT_BOOPS[filename] || deriveNameFromFile(filename)
          return { src, name }
        }
        if (entry && typeof entry === 'object') {
          const raw = entry.src || entry.file || entry.path || ''
          const src = raw.startsWith('/boops/') ? raw : `/boops/${raw}`
          const filename = raw.replace(/^.*\//, '')
          const name = entry.name || entry.label || DEFAULT_BOOPS[filename] || deriveNameFromFile(filename)
          return { src, name }
        }
        return null
      }).filter(Boolean)
    } else if (images && typeof images === 'object' && images.constructor === Object) {
      return Object.entries(images).map(([raw, val]) => {
        const src = raw.startsWith('/boops/') ? raw : `/boops/${raw}`
        const filename = raw.replace(/^.*\//, '')
        const name = typeof val === 'string' ? val : (val?.name || DEFAULT_BOOPS[filename] || deriveNameFromFile(filename))
        return { src, name }
      })
    }
    // Fallback to defaults
    return Object.entries(DEFAULT_BOOPS).map(([file, name]) => ({
      src: `/boops/${file}`,
      name
    }))
  }, [images])

  const [containerWidth, setContainerWidth] = useState(0)
  useEffect(() => {
    const update = () => {
      if (typeof window !== 'undefined') setContainerWidth(window.innerWidth || 0)
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  const rowWidth = useMemo(() => {
    if (!items.length) return 0
    return items.length * size + Math.max(0, items.length - 1) * gap
  }, [items, size, gap])

  const durationSec = useMemo(() => {
    const d = rowWidth / Math.max(1, speed)
    return Math.max(1, Math.round(d))
  }, [rowWidth, speed])

  const slideLeft = useMemo(() => {
    return keyframes`
      0% { transform: translateX(0); }
      100% { transform: translateX(-${rowWidth}px); }
    `
  }, [rowWidth])

  const Item = ({ src, name }) => (
    <div
      css={{
        width: size,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        flex: '0 0 auto'
      }}
    >
      <div
        css={{
          width: '100%',
          height: size,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <img
          src={src}
          alt={name || ''}
          title={name || ''}
          css={{
            maxWidth: '100%',
            maxHeight: '100%',
            objectFit: 'contain'
          }}
        />
      </div>
      <div
        css={{
          marginTop: 4,
          fontSize: 12,
          lineHeight: 1.1,
          maxWidth: '100%',
          textAlign: 'center',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          color: 'var(--textColor)'
        }}
        title={name || ''}
      >
        {name}
      </div>
    </div>
  )

  const Row = ({ duplicateKey = 'a' }) => (
    <div
      className='boops-row'
      css={{
        display: 'flex',
        flexWrap: 'nowrap',
        gap,
        alignItems: 'center'
      }}
    >
      {items.map((it, i) => <Item key={`${duplicateKey}-${i}`} src={it.src} name={it.name} />)}
    </div>
  )

  return (
    <div
      className='boops-container'
      css={{
        width: '100%',
        overflow: 'hidden',
        maskImage: `linear-gradient(to right, rgba(0,0,0,0) 0, rgba(0,0,0,1) ${fade}px, rgba(0,0,0,1) calc(100% - ${fade}px), rgba(0,0,0,0) 100%)`,
        WebkitMaskImage: `linear-gradient(to right, rgba(0,0,0,0) 0, rgba(0,0,0,1) ${fade}px, rgba(0,0,0,1) calc(100% - ${fade}px), rgba(0,0,0,0) 100%)`
      }}
    >
      <div
        className='boops-track'
        css={{
          display: 'flex',
          flexWrap: 'nowrap',
          gap,
          alignItems: 'center',
          willChange: 'transform',
          animation: `${slideLeft} ${durationSec}s linear infinite`
        }}
      >
        {Array.from({ length: Math.max(2, Math.ceil(containerWidth / Math.max(1, rowWidth)) + 2) }).map((_, idx) => (
          <Row key={`dup-${idx}`} duplicateKey={String.fromCharCode(97 + (idx % 26))} />
        ))}
      </div>
    </div>
  )
}

