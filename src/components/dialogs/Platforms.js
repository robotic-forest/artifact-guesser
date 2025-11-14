import React, { useEffect, useMemo } from 'react'
import styled from '@emotion/styled'
import useWindowDimensions from '@/hooks/useWindowDimensions'

// Draws one or more ziggurat step-like platforms as an SVG overlay, centered on the viewport
export const PlatformMainframe = ({ config = [], entryAnimation, entryDuration, onRegisterHitTest }) => {
  const { width: vw, height: vh } = useWindowDimensions()

  const platforms = Array.isArray(config) ? config : [config]

  // Precompute drawable shapes in viewport coordinates
  const shapes = useMemo(() => {
    const shade = (hex, amount /* -1..1 */) => {
      try {
        const normHex = (hex || '#777').replace('#', '')
        const full = normHex.length === 3
          ? normHex.split('').map(c => c + c).join('')
          : normHex
        const r = parseInt(full.substring(0, 2), 16)
        const g = parseInt(full.substring(2, 4), 16)
        const b = parseInt(full.substring(4, 6), 16)
        const mix = amount >= 0 ? 255 : 0
        const f = Math.min(1, Math.max(-1, amount))
        const rr = Math.round(r + (mix - r) * Math.abs(f))
        const gg = Math.round(g + (mix - g) * Math.abs(f))
        const bb = Math.round(b + (mix - b) * Math.abs(f))
        const toHex = n => n.toString(16).padStart(2, '0')
        return `#${toHex(rr)}${toHex(gg)}${toHex(bb)}`
      } catch (e) {
        return hex || '#777'
      }
    }

    return platforms.map((p, idx) => {
      const wIn = Number(p.w) || 0
      const hIn = Number(p.h) || 0
      const cx = vw / 2 + (Number(p.x) || 0)
      const cy = vh / 2 + (Number(p.y) || 0)
      
      // If a React element `component` is provided, render it using a foreignObject with no platform walls/top
      if (p.component && React.isValidElement(p.component)) {
        const w = wIn
        const h = hIn
        const TL = { x: cx - w / 2, y: cy - h / 2 }
        return {
          key: idx,
          // Keep a rect geometry for hit-testing only; it will not be rendered visually
          topRect: { x: TL.x, y: TL.y, w, h, fill: 'transparent' },
          walls: [],
          strokeWidth: 0,
          strokeColor: 'none',
          foreign: { x: TL.x, y: TL.y, w, h, node: p.component }
        }
      }

      const w = wIn
      const h = hIn
      const TL = { x: cx - w / 2, y: cy - h / 2 }
      const TR = { x: cx + w / 2, y: cy - h / 2 }
      const BR = { x: cx + w / 2, y: cy + h / 2 }
      const BL = { x: cx - w / 2, y: cy + h / 2 }
      const wallWidthX = Number(p.wallWidthX ?? p.wallWidth ?? p.l ?? 10)
      const wallWidthY = Number(p.wallWidthY ?? p.wallWidth ?? p.l ?? 10)
      const base = p.color || '#888'
      const frontview = !!p.frontview
      // Compute outer points by expanding horizontally by wallWidthX; vertically by wallWidthY:
      // - top edge: normally up by wallWidthY; when frontview, down by wallWidthY
      // - bottom edge: always down by wallWidthY
      const TL2 = { x: TL.x - wallWidthX, y: TL.y + (frontview ? +wallWidthY : -wallWidthY) }
      const TR2 = { x: TR.x + wallWidthX, y: TR.y + (frontview ? +wallWidthY : -wallWidthY) }
      const BR2 = { x: BR.x + wallWidthX, y: BR.y + wallWidthY }
      const BL2 = { x: BL.x - wallWidthX, y: BL.y + wallWidthY }

      // Lighter for top/left, darker for bottom/right
      // Per-side tonal biases:
      // - Bottom slightly darker than right
      // - Top slightly lighter than left
      // These deltas are preserved when invert=true (lights/darks swap by side).
      const invert = !!p.invert
      const topLightMag = 0.20
      const leftLightMag = 0.14
      const rightDarkMag = 0.16
      const bottomDarkMag = 0.22
      const topDarkMag = 0.22
      const leftDarkMag = 0.16
      const rightLightMag = 0.14
      const bottomLightMag = 0.20
      const topFill = shade(base, invert ? -topDarkMag : +topLightMag)
      const leftFill = shade(base, invert ? -leftDarkMag : +leftLightMag)
      const bottomFill = shade(base, invert ? +bottomLightMag : -bottomDarkMag)
      const rightFill = shade(base, invert ? +rightLightMag : -rightDarkMag)
      const strokeWidth = Number(p?.stroke?.width) || 0
      const strokeColor = p?.stroke?.color || '#000'

      return {
        key: idx,
        topRect: { x: TL.x, y: TL.y, w, h, fill: base },
        walls: (() => {
          const hasXWalls = wallWidthX > 0
          const hasYWalls = wallWidthY > 0
          const w = []
          if (hasYWalls) {
            w.push({ // top
              points: [TL2, TR2, TR, TL],
              fill: topFill
            })
          }
          if (hasXWalls) {
            w.push({ // left
              points: [TL2, TL, BL, BL2],
              fill: leftFill
            })
          }
          if (hasYWalls) {
            w.push({ // bottom
              points: [BL, BR, BR2, BL2],
              fill: bottomFill
            })
          }
          if (hasXWalls) {
            w.push({ // right
              points: [TR, TR2, BR2, BR],
              fill: rightFill
            })
          }
          return w
        })()
        ,
        strokeWidth,
        strokeColor
      }
    })
  }, [platforms, vw, vh])

  // Provide a hit-test callback for outside consumers (e.g., Dialog backdrop logic)
  useEffect(() => {
    if (!onRegisterHitTest) return
    if (!vw || !vh || shapes.length === 0) {
      onRegisterHitTest(() => false)
      return
    }

    const isPointInRect = (px, py, r) => (
      px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h
    )

    const isPointInPoly = (px, py, points) => {
      // Ray casting algorithm for point in polygon
      let inside = false
      for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
        const xi = points[i].x, yi = points[i].y
        const xj = points[j].x, yj = points[j].y
        const intersect = ((yi > py) !== (yj > py)) &&
          (px < (xj - xi) * (py - yi) / ((yj - yi) || 1e-9) + xi)
        if (intersect) inside = !inside
      }
      return inside
    }

    const hitTest = (px, py) => {
      for (const s of shapes) {
        if (isPointInRect(px, py, s.topRect)) return true
        for (const w of s.walls) {
          if (isPointInPoly(px, py, w.points)) return true
        }
      }
      return false
    }

    onRegisterHitTest(hitTest)
  }, [onRegisterHitTest, shapes, vw, vh])

  if (!vw || !vh || shapes.length === 0) return null

  return (
    <Overlay entryAnimation={entryAnimation} entryDuration={entryDuration}>
      <svg width="100%" height="100%" viewBox={`0 0 ${vw} ${vh}`} preserveAspectRatio="xMidYMid meet" style={{ display: 'block', pointerEvents: 'none' }}>
        {shapes.map(s => (
          <g key={s.key} shapeRendering='crispEdges'>
            {/* Draw walls first so the top sits above */}
            {s.walls.map((w, i) => (
              <polygon
                key={i}
                fill={w.fill}
                stroke={s.strokeWidth > 0 ? s.strokeColor : 'none'}
                strokeWidth={s.strokeWidth > 0 ? s.strokeWidth : undefined}
                strokeLinejoin={s.strokeWidth > 0 ? 'bevel' : undefined}
                strokeLinecap={s.strokeWidth > 0 ? 'butt' : undefined}
                strokeMiterlimit={s.strokeWidth > 0 ? 1 : undefined}
                points={w.points.map(pt => `${pt.x},${pt.y}`).join(' ')}
                style={{ pointerEvents: 'auto' }}
              />
            ))}
            {s.foreign
              ? (
                <foreignObject
                  x={s.foreign.x}
                  y={s.foreign.y}
                  width={s.foreign.w}
                  height={s.foreign.h}
                  style={{ pointerEvents: 'auto' }}
                >
                  <div
                    xmlns="http://www.w3.org/1999/xhtml"
                    style={{
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      pointerEvents: 'auto'
                    }}
                  >
                    {s.foreign.node}
                  </div>
                </foreignObject>
              ) : (
                <rect x={s.topRect.x} y={s.topRect.y} width={s.topRect.w} height={s.topRect.h} fill={s.topRect.fill} style={{ pointerEvents: 'auto' }} />
              )}
          </g>
        ))}
      </svg>
    </Overlay>
  )
}

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 999999; /* beneath dialog content which is 1000000 */
  /* Allow shapes to receive events; the <svg> root is set to pointer-events: none
     so empty areas pass through to the dialog container above. */
  pointer-events: auto;
  background: transparent;

  ${p => {
    const duration = p.entryDuration || '0.6s'
    if (p.entryAnimation === 'fade') return `animation: platformFadeIn ${duration};`
    if (p.entryAnimation === 'fadeUp') return `animation: platformFadeInUp ${duration};`
    return ''
  }}

  @keyframes platformFadeIn {
    0% { opacity: 0; }
    100% { opacity: 1; }
  }
  @keyframes platformFadeInUp {
    0% { opacity: 0; transform: translateY(18px); }
    100% { opacity: 1; transform: translateY(0); }
  }
`


