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
      <div id='track' />
      <input
        type='range'
        style={{ width: '100%', ...inputStyle }}
        {...props}
      />
    </InputStyles>
  )
})

const InputStyles = styled.div`
  position: relative;
  top: 5px;
  width: ${p => p.width};
  // Add styles for disabled state
  opacity: ${p => p.disabled ? 0.7 : 1};
  cursor: ${p => p.disabled ? 'not-allowed' : 'default'};

  input[type=range] {
    cursor: ${p => p.disabled ? 'not-allowed' : 'pointer'}; // Cursor for the input itself
    -webkit-appearance: none; /* Hides the slider so that custom slider can be made */
    width: ${p => p.width}; /* Specific width is required for Firefox. */
    background: transparent; /* Otherwise white in Chrome */
    position: relative;
    /* Adjust height and vertical position to cover the visual track */
    height: 20px; 
    top: -8px; 
    margin: 0; /* Reset margin */
    padding: 0; /* Reset padding */
  }

  div#track {
    width: ${p => p.width}; /* Specific width is required for Firefox. */
    background: transparent; /* Otherwise white in Chrome */
    position: absolute;
    top: -2px;
    z-index: 0;
    height: 10px;
    border-bottom: 1px solid white;

    &::after, &::before {
      content: "";
      position: absolute;
      top: 6px;
      left: 4px;
      height: 7px;
      width: 7px;
      border-radius: 50%;
      background: white;
    }

    &::before {
      left: calc(${p => p.width} - 12px);
      box-shadow: 4px 0px 0px 3px black;
    }

    &::after {
      box-shadow: -4px 0px 0px 3px black;
    }
  }

  input[type=range]::-webkit-slider-thumb {
    -webkit-appearance: none;
    height: 15px;
    width: 15px;
    border-radius: 50px;
    background: black;
    border: 1px solid white;
    cursor: pointer;
    box-shadow: 0 0 0 1px transparent;
    margin: 0 0px 0 1px;
    position: relative;
    left: -1px;
    top: 3px;

    &:hover {
      // Prevent hover effect when disabled
      background: ${p => p.disabled ? 'var(--backgroundColor)' : '#424242'};
    }
  }

  // Style thumb when disabled
  input[type=range]:disabled::-webkit-slider-thumb {
    background: #aaa; // Grey out thumb
    border-color: #888;
    cursor: not-allowed;
  }

  input[type=range]::-webkit-slider-runnable-track {
    width: 100%;
    height: 10px;
    border-bottom: 1px solid transparent;
    z-index: 1
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

  // Style track when disabled (optional, might just rely on overall opacity)
  // div#track {
  //   opacity: ${p => p.disabled ? 0.5 : 1};
  // }
`
