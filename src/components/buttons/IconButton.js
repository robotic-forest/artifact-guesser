import styled from '@emotion/styled'
import { v4 as uuidv4 } from 'uuid'
import React, { forwardRef, useState } from 'react'
import { useMediaQuery } from 'react-responsive'
import { Tooltip } from "react-tooltip"
import { createPortal } from 'react-dom'
import dynamic from 'next/dynamic'

export const IconButton = dynamic(() => Promise.resolve(IconButtonComponent), { ssr: false })

const IconButtonComponent = forwardRef(({
  children,
  style,
  tooltip,
  tooltipId,
  tooltipPlace = 'top',
  disabled,
  onClick,
  size = 24,
  iconSize,
  hc, // hover color
  ri, // rotate icon
  ...props
}, ref) => {
  const isMobile = useMediaQuery({ maxWidth: 600 })
  const [hover, setHover] = useState(false)
  const [toolTipId] = useState(tooltipId || (tooltip?.toLowerCase().replaceAll(' ', '-') + '-' + uuidv4()))

  const innerSize = iconSize || size / 2

  return (
    <>
      <IconButtonUI
        onClick={!disabled ? onClick : () => {}}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        data-tooltip-id={toolTipId}
        data-tooltip-content={tooltip}
        data-tooltip-place={tooltipPlace}
        {...{ ref, disabled, size, innerSize, hc, ri }}
        {...props}
      >
        {React.cloneElement(children, { hover: hover ? String(hover) : 'undefined' })}
      </IconButtonUI>
      {tooltip && !disabled && process.browser && !isMobile && createPortal(
        <Tooltip
          id={toolTipId}
          style={{
            backgroundColor: "#333",
            color: "white",
            padding: '2px 6px',
            zIndex: 1000
          }}
        />,
        document.getElementById('__next')
      )}
    </>
  )
})

const IconButtonUI = styled.a`
  height: ${p => p.size || 22}px;
  min-width: ${p => p.size || 22}px;
  border-radius: 5px;
  cursor: ${p => p.disabled ? 'initial' : 'pointer'};
  background: var(--backgroundColor);
  border: none;
  font-size: ${p => (p.innerSize) + 2}px;
  display: grid;
  place-items: center;
  opacity: ${p => p.disabled ? 0.4 : 1};
  color: var(--t);
  position: relative;
  user-select: none;
  transition: background 0.2s ease;

  & > * { transform: ${p => p.ri ? `rotate(${p.ri}deg)` : 'none'} }

  &:hover {
    background: ${p => p.disabled ? 'transparent' : 'var(--backgroundColorSlightlyDark)'};
    color: ${p => p.hc || 'var(--textColor)'};
  }
`