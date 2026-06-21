import React, { useState, useEffect, useMemo } from 'react'
import { enableBabel, disableBabel, isBabelActive } from './index.js'

/**
 * BabelTrigger — a tiny clickable image positioned absolutely/fixed.
 * Triggers the Tower of Babel takeover on click.
 *
 * Visibility is entirely up to you — `show` can be a boolean or a function
 * returning a boolean (re-checked on each render). Useful for "appears only
 * after the user finishes the daily run" or "only on weekends" or whatever.
 *
 * Props:
 *   show          boolean | () => boolean (default: true)
 *   src           image src for the trigger (e.g. a tiny tower)
 *   alt           accessible alt text
 *   size          number (px) for the icon (default 48)
 *   position      'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'inline'
 *                   default 'bottom-right'. Use 'inline' to skip absolute positioning.
 *   offset        { top, right, bottom, left } in px to nudge the icon
 *   fixed         boolean — use `position: fixed` instead of `absolute` (default false)
 *   options       passed to enableBabel({ assets, message, ... })
 *   onTrigger     fired after click, before enableBabel
 *   children      render override — replaces the default <img> if provided
 */
export const BabelTrigger = ({
  show = true,
  src,
  alt = 'Tower of Babel',
  size = 48,
  position = 'bottom-right',
  offset = {},
  fixed = false,
  style,
  className,
  options,
  onTrigger,
  children,
}) => {
  const visible = typeof show === 'function' ? !!show() : !!show
  if (!visible) return null

  const handleClick = (e) => {
    e?.stopPropagation?.()
    if (onTrigger) onTrigger()
    enableBabel(options)
  }

  const positionStyles = useMemo(() => {
    if (position === 'inline') return {}
    const p = fixed ? 'fixed' : 'absolute'
    const base = { position: p, zIndex: 50 }
    const pad = 12
    const o = (k, fb) => (typeof offset[k] === 'number' ? offset[k] : fb)
    if (position === 'top-left')      return { ...base, top: o('top', pad), left: o('left', pad) }
    if (position === 'top-right')     return { ...base, top: o('top', pad), right: o('right', pad) }
    if (position === 'bottom-left')   return { ...base, bottom: o('bottom', pad), left: o('left', pad) }
    /* bottom-right */                return { ...base, bottom: o('bottom', pad), right: o('right', pad) }
  }, [position, fixed, offset.top, offset.right, offset.bottom, offset.left])

  return (
    <button
      type='button'
      onClick={handleClick}
      title={alt}
      aria-label={alt}
      data-babel-ignore
      className={className}
      style={{
        ...positionStyles,
        width: size,
        height: size,
        padding: 0,
        border: 'none',
        background: 'transparent',
        cursor: 'pointer',
        opacity: 0.55,
        transition: 'opacity 0.2s, transform 0.2s',
        ...style,
      }}
      onMouseEnter={(e) => { e.currentTarget.style.opacity = 1; e.currentTarget.style.transform = 'scale(1.06)' }}
      onMouseLeave={(e) => { e.currentTarget.style.opacity = 0.55; e.currentTarget.style.transform = 'scale(1)' }}
    >
      {children || (src ? <img src={src} alt={alt} style={{ width: '100%', height: '100%', objectFit: 'contain' }} /> : null)}
    </button>
  )
}

/**
 * useBabel — imperative hook. Returns `{ enable, disable, active }`.
 */
export const useBabel = () => {
  const [active, setActive] = useState(() => (typeof window !== 'undefined' ? isBabelActive() : false))
  useEffect(() => {
    const i = setInterval(() => setActive(isBabelActive()), 500)
    return () => clearInterval(i)
  }, [])
  return {
    active,
    enable: (opts) => { enableBabel(opts); setActive(true) },
    disable: () => { disableBabel(); setActive(false) },
  }
}
