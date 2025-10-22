import { useMemo, useState } from 'react'
import { Button } from '@/components/buttons/Button'
import { Dialog } from '@/components/dialogs/Dialog'
import { MasonryLayout } from '@/components/layout/MasonryLayout'
import { FaShoppingCart } from 'react-icons/fa'

export const BuyMerch = ({ artifact, style, className }) => {
  const [open, setOpen] = useState(false)

  const images = useMemo(() => artifact?.images?.external || [], [artifact])

  console.log(window.location, artifact)

  return (
    <div css={style} className={className}>
      <Button onClick={() => setOpen(true)} css={{
        background: 'var(--primaryColor)',
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
