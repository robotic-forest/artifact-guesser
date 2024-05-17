import styled from "@emotion/styled"
import { forwardRef } from "react"
import { Controller } from "react-hook-form"

export const FormRange = ({
  name,
  defaultValue,
  style,
  inputStyle,
  control,
  width = '100%',
  min,
  max
}) => {

  return (
    <Controller
      control={control}
      defaultstyle={{ color: 'var(--textColor)' }} Value={defaultValue}
      name={name}
      render={({ field }) => {

        return (
          <Range
            width={width}
            style={style}
            inputStyle={inputStyle}
            {...field}
            {...{ min, max }}
          />
        )
      }}
    />
  )
}

export const Range = forwardRef(({ width, style, inputStyle, ...props }, ref) => {
  return (
    <InputStyles ref={ref} width={width} style={style}>
      <input
        type='range'
        style={{ width: '100%', ...inputStyle }}
        {...props}
      />
    </InputStyles>
  )
})

const InputStyles = styled.div`
  width: ${p => p.width};

  input[type=range] {
    -webkit-appearance: none; /* Hides the slider so that custom slider can be made */
    width: ${p => p.width}; /* Specific width is required for Firefox. */
    background: transparent; /* Otherwise white in Chrome */
    position: relative;
    top: -5px;

    &::after, &::before {
      content: "";
      position: absolute;
      top: 3px;
      height: 14px;
      width: 1px;
      background: var(--textColor);
    }

    &::before { left: ${p => p.width} }
  }

  input[type=range]::-webkit-slider-thumb {
    -webkit-appearance: none;
    height: 15px;
    width: 15px;
    border-radius: 50px;
    background: var(--backgroundColor);
    border: 1px solid var(--textColor);
    cursor: pointer;
    box-shadow: 0 0 0 1px transparent;
    margin: 0 0px 0 1px;
    position: relative;
    left: -1px;
    top: 2px;

    &:hover {
      background: #424242;
    }
  }

  input[type=range]::-webkit-slider-runnable-track {
    width: 100%;
    height: 10px;
    border-bottom: 1px solid var(--textColor);
  }

  input[type=range]:focus {
    outline: none; /* Removes the blue border. You should probably do some kind of focus styling for accessibility reasons though. */
  }

  input[type=range]::-ms-track {
    width: 100%;
    cursor: pointer;

    /* Hides the slider so custom styles can be added */
    background: transparent;
    border-color: transparent;
    color: transparent;
  }
`
