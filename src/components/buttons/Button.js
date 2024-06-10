import styled from '@emotion/styled'
import { forwardRef } from 'react'
import { darken } from 'polished'

const OutlinedButton = styled.button`
  cursor: ${p => p.disable ? 'default' : 'pointer'};
  appearance: none;
  padding: 2px 10px 1px 10px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 2px;
  font-size: ${p => p.small ? '0.9em' : '1em'};
  font-family: inherit;
  border: none;
  font-weight: 600;
  color: ${p => p.disable ? 'var(--textLowOpacity)' : 'var(--textColor)'};
  user-select: none;
  background: none;
  white-space: nowrap;
  transition: box-shadow 0.2s;
  background: var(--backgroundColor);
  transition: box-shadow 0.2s, background 0.1s;

  box-shadow: ${p => p.disable
    ? '0 0 0 1px var(--textSuperLowOpacity)'
    : 'transparent 0px 0px 0px 0px, transparent 0px 0px 0px 0px, var(--textSuperLowOpacity) ' +
      '0px 1px 1px 0px, var(--textVeryLowOpacity27) 0px 0px 0px 1px, transparent ' +
      '0px 0px 0px 0px, transparent 0px 0px 0px 0px, var(--textSuperLowOpacity) 0px 2px 5px 0px'
  };

  &:hover {
    box-shadow: ${p => p.disable
      ? '0 0 0 1px var(--textSuperLowOpacity)'
      : 'transparent 0px 0px 0px 0px, transparent 0px 0px 0px 0px, var(--textSuperLowOpacity) ' +
        '0px 1px 1px 0px, var(--textVeryLowOpacity27) 0px 0px 0px 1px, transparent ' +
        '0px 0px 0px 0px, var(--textSuperLowOpacity) 0px 3px 9px 0px, var(--textSuperLowOpacity) 0px 2px 5px 0px'
    };
    color: ${p => p.disable ? 'var(--textLowOpacity)' : 'var(--textColor)'};
    background: ${p => p.disable ? 'var(--backgroundColor)' : 'var(--backgroundColorSlightlyDark)'}
  }

  &:active {
    outline: 0;
    box-shadow: ${p => p.disable
      ? '0 0 0 1px var(--textSuperLowOpacity)'
      : 'transparent 0px 0px 0px 0px, transparent 0px 0px 0px 0px, var(--textSuperLowOpacity) ' +
        '0px 1px 1px 0px, var(--textVeryLowOpacity27) 0px 0px 0px 1px, transparent ' +
        '0px 0px 0px 0px, var(--textSuperLowOpacity) 0px 3px 9px 0px, var(--textSuperLowOpacity) 0px 2px 5px 0px'
    };
    color: ${p => p.disable ? 'var(--textLowOpacity)' : 'var(--textColor)'};
  }
`

export const TextButton = styled.button`
  cursor: ${p => p.disable ? 'default' : 'pointer'};
  padding: 2px 10px 1px 10px;
  font-family: inherit;
  font-size: 0.9em;
  border-radius: 2px;
  font-weight: 600;
  border: none;
  color: ${p => p.disable ? `var(--textLowOpacity)` : p.textColor ? p.textColor : 'var(--textColor)'};
  user-select: none;
  background: none;
  white-space: nowrap;

  &:hover {
    color: ${p => p.disable ? `var(--textLowOpacity)` : p.textColor ? `${p.textColor}88` : 'var(--textColor)'};
  }

  &:active {
    outline: 0;
  }
`

export const ReliefButton = styled.button`
  padding: 2px 10px 1px 10px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  position: relative;
  border-radius: 2px;
  font-size: 0.9em;
  font-family: inherit;
  font-weight: 600;
  color: ${p => p.disable ? `var(--textLowOpacity)` : p.textColor ? p.textColor : 'var(--textColor)'};
  background: ${p => p.disable ? 'var(--backgroundColor)' : p.color || 'var(--primaryColor)'};
  border: 1px solid var(--textSuperLowOpacity);
  cursor: ${p => p.disable ? 'default' : 'pointer'};
  user-select: none;
  white-space: nowrap;
  transition: box-shadow 0.2s, background 0.2s;
  box-shadow: ${p => p.disable
    ? '0 0 0 1px transparent'
    : 'rgb(0 0 0 / 0%) 0px 0px 0px 0px, rgb(0 0 0 / 0%) 0px 0px 0px 0px, rgb(0 0 0 / 12%) ' +
      '0px 1px 1px 0px, rgb(64 68 82 / 16%) 0px 0px 0px 1px, rgb(0 0 0 / 0%) ' +
      '0px 0px 0px 0px, rgb(0 0 0 / 0%) 0px 0px 0px 0px, rgb(64 68 82 / 8%) 0px 2px 5px 0px'
  };

  &:hover {
    background: ${p => p.disable ? 'none' : p.color ? darken(0.3, p.color) : 'var(--primaryShadow)'};
    box-shadow: ${p => p.disable
      ? '0 0 0 1px transparent'
      : 'rgb(0 0 0 / 0%) 0px 0px 0px 0px, rgb(0 0 0 / 0%) 0px 0px 0px 0px, rgb(0 0 0 / 12%) ' +
        '0px 1px 1px 0px, rgb(64 68 82 / 16%) 0px 0px 0px 1px, rgb(0 0 0 / 0%) ' +
        '0px 0px 0px 0px, rgb(64 68 82 / 8%) 0px 3px 9px 0px, rgb(64 68 82 / 8%) 0px 2px 5px 0px'
    };
    color: ${p => p.disable ? `var(--textLowOpacity)` : p.textColor ? p.textColor : 'var(--textColor)'};
  }

  &:active {
    outline: 0;
    background: ${p => p.disable ? 'none' : p.color ? darken(0.1, p.color) : 'var(--primaryColorSlightlyDark)'};
    box-shadow: ${p => p.disable
      ? '0 0 0 1px transparent'
      : 'rgb(0 0 0 / 0%) 0px 0px 0px 0px, rgb(0 0 0 / 0%) 0px 0px 0px 0px, rgb(0 0 0 / 12%) ' +
        '0px 1px 1px 0px, rgb(64 68 82 / 16%) 0px 0px 0px 1px, rgb(0 0 0 / 0%) ' +
        '0px 0px 0px 0px, rgb(64 68 82 / 8%) 0px 3px 9px 0px, rgb(64 68 82 / 8%) 0px 2px 5px 0px'
    };
    color: ${p => p.disable ? `var(--textLowOpacity)` : p.textColor ? p.textColor : 'var(--textColor)'};
  }
`

const Button = forwardRef(({ variant = 'relief', ...props }, ref) => {

  return variant === 'relief'
    ? <ReliefButton ref={ref} {...props} />
    : variant === 'text'
      ? <TextButton ref={ref} {...props} />
      : <OutlinedButton ref={ref} {...props} />
})

Button.defaultProps = { type: 'button' }

export { Button }