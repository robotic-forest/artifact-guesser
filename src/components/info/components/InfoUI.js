import styled from "@emotion/styled"
import React, { useState } from "react"
import { useMediaQuery } from "react-responsive"
import { v4 as uuidv4 } from 'uuid'
import Tooltip from 'react-tooltip'

export const InfoItem = ({ icon, value, list, tooltip, tooltipPlace = 'top', noIcon, tooltipId }) => {
  const isMobile = useMediaQuery({ maxWidth: 600 })
  const [toolTipId] = useState(tooltipId || (tooltip?.toLowerCase().replaceAll(' ', '-') + '-' + uuidv4()))
  const iconStyle = {
    position: 'relative',
    top: 1
  }

  return (
    <>
      <div
        css={{
          display: 'flex',
          marginBottom: 16
        }}
      >
        <div css={{ minWidth: 24, marginRight: 10 }}>
          <div css={{ width: 'min-content' }} data-for={toolTipId} data-tip={tooltip}>
            {React.cloneElement(icon, { style: !noIcon && iconStyle })}
          </div>
        </div>
        <div css={{ overflow: 'hidden', textOverflow: 'ellipsis', minHeight: '1.3em' }}>
          {value || list && Object.keys(list).map(key => (
            <div key={key}>
              <div css={{ color: 'var(--textLowOpacity)', fontSize: '0.9em', marginBottom: 2 }}>
                {key}
              </div>
              <div css={{ marginBottom: 10 }}>
                {list[key]}
              </div>
            </div>
          ))}
        </div>
      </div>
      {toolTipId && tooltip && !isMobile && (
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

export const InfoUI = styled.div`
  width: 100%;
  min-width: 260px;
  margin-bottom: 24px;
  padding: 0 10px;

  .item-container {
    display: flex;
    flex-flow: row wrap;
    

    & > div {
      width: 50%
    }
  }

  @media (min-width: 1050px) {
    padding: 0;
    position: sticky;
    top: 105px;
    align-self: flex-start;
    width: 340px;
    margin-right: 60px;

    height: fit-content;

    .item-container {
      display: block;

      & > div {
        width: auto
      }
    }
  }

  @media (max-width: 400px) {
    .item-container {
      display: block;

      & > div {
        width: 100%
      }
    }
  }
`