import styled from "@emotion/styled"
import { useState } from "react"
import { useMediaQuery } from "react-responsive"
import { Tooltip } from 'react-tooltip'
import { v4 as uuidv4 } from 'uuid'

const colorDefaults = {
  gold: '#ffcf6d',
  lightgold: '#ffe2a7',
  red: '#ff7d7d',
  green: '#bce6bc'
}

export const Tag = ({
  children,
  bold,
  color,
  style,
  tooltip,
  tooltipPlace = 'top',
  noBg,
  noBorder,
  m, 
  big,
  ...props
}) => {
  const isMobile = useMediaQuery({ maxWidth: 600 })
  const [toolTipId] = useState(uuidv4())

  return (
    <>
      <TagUI
        data-for={toolTipId}
        data-tip={tooltip}
        css={{
          fontWeight: bold ? '600' : 'initial',
          background: noBg ? 'none' : color && colorDefaults[color] || color || '#ffffff44',
          color: !noBg ? 'black' : 'var(--textColor)',
          margin: m ? '0 4px 4px 0' : null,
          padding: big ? '4px 8px 3px' : '2px 6px',
          fontSize: big ? '0.8em' : '0.7em',
          ...style
        }}
        noBorder={noBorder}
        {...props}
      >
        {children}
      </TagUI>
      {tooltip && !isMobile && (
        <Tooltip
          id={toolTipId}
          className='globaltooltip'
          place={tooltipPlace}
          type="dark"
          effect="solid"
          backgroundColor='#000000'
        />
      )}
    </>
  )
}

const TagUI = styled.span`
  display: inline-block;
  border-radius: 5px;
  border: ${p => p.noBorder ? 'none' : '1px solid var(--textSuperLowOpacity)'};
  background: var(--primaryColorVeryLight);
  text-transform: uppercase;
  position: relative;
  white-space: nowrap;
  height: fit-content;
  letter-spacing: 0.8px;
`
