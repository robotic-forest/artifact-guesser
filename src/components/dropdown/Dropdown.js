import styled from "@emotion/styled"
import React, { useState } from "react"
import useMeasure from 'react-use-measure'
import { Button } from "../buttons/Button"
import { useClickedOutside } from "@/hooks/useClickedOutside"

export const Dropdown = ({
  button,
  containerStyle,
  dropdownStyle,
  children,
  MenuIconButtons,
  closeAfterClick,
  onClose,
  onOpen,
  confirm,
  top = 8,
  dense,
  disableCloseOutside,
  childrenBelowButtons,
  hideButtonIfDisabled,
  onHover,
  onClick
}) => {
  const [boundsRef, bounds] = useMeasure()
  const [showDropDown, setShowDropdown] = useState(false)

  const openDropdown = () => {
    setShowDropdown(true)
    onOpen && onOpen()
  }

  const closeDropdown = () => {
    setShowDropdown(false)
    onClose && onClose()
  }

  const { ref } = useClickedOutside(!disableCloseOutside && closeDropdown)
  
  if (hideButtonIfDisabled && (button.props.disabled || MenuIconButtons?.every(item => item.disabled))) return null

  return (
    <div ref={ref} css={{ ...containerStyle, position: 'relative' }}>
      {React.cloneElement(button, {
        ref: boundsRef,
        onClick: onClick || openDropdown,
        disable: button.props.disable || MenuIconButtons?.every(item => item.disabled),
        disabled: button.props.disabled || MenuIconButtons?.every(item => item.disabled),
        onMouseEnter: () => onHover && openDropdown(),
        onMouseLeave: () => onHover && closeDropdown()
      })}
      {showDropDown && (
        <DropDownUI dense={dense} css={{ ...dropdownStyle, top: bounds.height + top }}>
          {!childrenBelowButtons && children && React.cloneElement(children, { closeDropdown })}
          {MenuIconButtons && (
            <div className='menu'>
              {MenuIconButtons.map(b => (
                <SimpleButton
                  key={b.contents}
                  css={b.style}
                  disabled={b.disabled}
                  onClick={e => {
                    e.stopPropagation()
                    b.onClick && b.onClick()
                    closeAfterClick && setShowDropdown(false)
                  }}>
                    {b.contents}
                  </SimpleButton>
              ))}
            </div>
          )}
          {childrenBelowButtons && children && React.cloneElement(children, { closeDropdown })}
          {confirm && <ConfirmDropdown {...{ closeDropdown, confirm }} />}
        </DropDownUI>
      )}
    </div>
  )
}

const ConfirmDropdown = ({ closeDropdown, confirm }) => {
  return (
    <div>
      {confirm.message && (
        <div css={{ marginBottom: 16 }}>
          {confirm.message}
        </div>
      )}
      <div css={{ float: 'right' }}>
        <Button
          css={{ marginRight: 8, padding: '3px 10px' }}
          variant='outlined'
          onClick={closeDropdown}
        >
          {confirm.cancelButtonText || 'Cancel'}
        </Button>
        <Button
          onClick={() => {
            confirm.onConfirm()
            closeDropdown()
          }}
          color='#ff9999'
        >
          {confirm.confirmButtonText || 'Confirm'}
        </Button>
      </div>
    </div>
  )
}

export const SimpleButton = styled.button`
  width: 100%;
  padding: 3px 7px;
  border-radius: 4px;
  cursor: ${p => p.disabled ? 'default' : 'pointer'};
  background: var(--backgroundColor);
  border: none;
  font-size: 1em;
  text-align: start;
  color:  ${p => p.disabled ? 'var(--textLowOpacity)' : 'var(--textColor)'};
  transition: background 0.2s ease;

  &:hover {
    background: ${p => p.disabled ? 'none' : 'var(--textSuperLowOpacity)'};
  }
`

const DropDownUI = styled.div`
  position: absolute;
  right: 0;
  z-index: 100;
  background: var(--backgroundColor);
  border: 1px solid var(--textVeryLowOpacity);
  box-shadow: 0 5px 25px -5px var(--textVeryLowOpacity);
  border-radius: 8px;
  width: 240px;
  padding: ${p => p.dense ? '2px 8px' : '5px'};

  & > .info {
    border-bottom: 1px solid var(--textSuperLowOpacity);
    padding: 12px;

    & > h3 {
      margin: 0 0 2px 0;
    }

    & > .email {
      font-size: 0.9em;
    }
  }
`