import React, { useRef } from 'react'
import { Dialog } from '@/components/dialogs/Dialog'
import { PlatformMainframe } from './Platforms'
import { darken } from 'polished'

// radialEffect: [{ type: 'blur', min, max, inner, outer, taper, centerX, centerY, invert? }]
// - min/max: base/target blur (px or CSS length)
// - inner/outer: radii (percent strings, e.g. '30%')
// - taper: transition width between inner→outer (percent string)
// - centerX/centerY: mask center ('50%' or px)
// - invert?: apply strong blur outside the ring instead of inside
// - Multiple effects supported. Darkness overlays are disabled when using radialEffect.

export const CosmicInitiation = ({ open, onClose }) => {
  const platformHitTestRef = useRef(() => false)
  const frontview = true

  const ziggurat2 = {
    x: 450,
    y: -70,
    color: '#35ad8d',
  }

  const ziggurat3 = {
    x: 510,
    y: 150,
    color: '#c9a88c',
  }

  const ziggurat4 = {
    x: -487.5,
    y: 150,
    invert: true,
    wallWidthX: 5,
    wallWidthY: 5,
    frontview: false,
    color: '#9c7070',
  }

  return !open ? null : (
    <>
      <Dialog
        transparentFullscreen
        centerMobile
        visible={open}
        closeDialog={onClose}
        seeNoBG
        noTitle
        containerBg='transparent'
        shouldCloseOnBackdropClick={(x, y) => !platformHitTestRef.current(x, y)}
        entryAnimation='fadeUp'
        entryDuration='1.6s'
        radialEffect={[
          { type: 'blur', min: 1.5, max: 14, inner: '5%', outer: '82%', taper: '20%', centerX: '50%', centerY: '50%' }
        ]}
      >
        <PlatformMainframe
          entryAnimation='fadeUp'
          entryDuration='1.6s'
          onRegisterHitTest={fn => { platformHitTestRef.current = typeof fn === 'function' ? fn : () => false }}
          config={[
            // Background
            { w: 1620, h: 1000, color: darken(0.1, '#9c7070'), x: 0, y: 345, wallWidthX: 40, wallWidthY: 40, frontview },
            // { w: 1220, h: 1000, color: darken(0.075, '#9c7070'), x: 0, y: 345, wallWidthX: 40, wallWidthY: 40, frontview },

            // Central Ziggurat 
            { w: 630, h: 525, color: darken(0.05, '#9c7070'), x: 0, y: 57.5, wallWidthX: 50, wallWidthY: 50, frontview },
            { w: 550, h: 500, color: darken(0.025, '#9c7070'), x: 0, y: 25, wallWidthX: 20, wallWidthY: 20, frontview },
            { w: 480, h: 480, color: darken(0, '#9c7070'), x: 0, y: 0, wallWidthX: 15, wallWidthY: 15, frontview },
            { w: 420, h: 420, color: darken(0, '#9c7070'), x: 0, y: 0, wallWidthX: 3, wallWidthY: 5, invert: true },

            // Green Ziggurat 2
            { w: 100, h: 100, color: darken(0.08, ziggurat2.color), x: ziggurat2.x, y: ziggurat2.y, wallWidthX: 5, wallWidthY: 5, frontview },
            { w: 80, h: 80, color: darken(0.04, ziggurat2.color), x: ziggurat2.x, y: ziggurat2.y - 2, wallWidthX: 5, wallWidthY: 5, frontview },
            { w: 60, h: 60, color: darken(0, ziggurat2.color), x: ziggurat2.x, y: ziggurat2.y - 4, wallWidthX: 5, wallWidthY: 5, frontview },

            // Beige Ziggurat 3
            { w: 120, h: 180, color: darken(0.08, ziggurat3.color), x: ziggurat3.x, y: ziggurat3.y, wallWidthX: 10, wallWidthY: 10, frontview: false },
            { w: 110, h: 170, color: darken(0.04, ziggurat3.color), x: ziggurat3.x, y: ziggurat3.y, wallWidthX: 10, wallWidthY: 10, frontview: false },
            { w: 100, h: 160, color: darken(0, ziggurat3.color), x: ziggurat3.x, y: ziggurat3.y, wallWidthX: 10, wallWidthY: 10, frontview: false },
            { w: 66, h: 66, color: darken(0.01, ziggurat3.color), x: ziggurat3.x, y: ziggurat3.y, wallWidthX: 2.5, wallWidthY: 2.5, frontview: false, invert: true },

            // Ziggurat 4 TNML
            { ...ziggurat4, w: 180, h: 240, color: darken(0.1, ziggurat4.color), y: ziggurat4.y, wallWidthX: 6, wallWidthY: 6 },
            { ...ziggurat4, w: 150, h: 210, color: darken(0.13, ziggurat4.color), y: ziggurat4.y, wallWidthX: 4, wallWidthY: 4 },
            { ...ziggurat4, w: 120, h: 180, color: darken(0.15, ziggurat4.color), y: ziggurat4.y, wallWidthX: 2, wallWidthY: 2 },

            // TNML
            // { w: 160, h: 160, x: -487.5, y : -60, component: (
            //   <img src='/tnml-logo-cropped.png' alt='TNML Logo' className='w-[100px] h-[auto]' css={{
            //     filter: 'hue-rotate(40deg) drop-shadow(0 0 15px #00000088)',
            //   }} />
            // ) },

            { w: 420, h: 420, color: '#000000', x: 0, y: 0, wallWidthX: 0, wallWidthY: 0 },
          ]}
        />
      </Dialog>
    </>
  )
}


