import { Controller, useFormContext } from 'react-hook-form'
import { forwardRef, useEffect, useState } from 'react'
import { FaCheck } from 'react-icons/fa'
import { resolveRequired } from './Form'
import { get } from 'lodash'

export const FormRadio = ({
  name,
  label,
  size = 16,
  options,
  style,
  radioStyle,
  noCheckmark,
  innerStyle,
  disabled,
  required,
  defaultValue
}) => {
  const { control, formState: { errors }, setValue, watch } = useFormContext()

  useEffect(() => {
    if (defaultValue) {
      const value = watch(name)
      if (!value) {
        setValue(name, defaultValue)
      }
    }
  }, [defaultValue])

  return (
    <div css={{
      display: 'flex',
      flexFlow: 'row wrap',
      alignItems: 'center',
      ...style
    }}>
      <div css={{
        marginRight: 24,
        marginBottom: 8,
      }}>
        {label}
      </div>
      <div css={{
        display: 'flex',
        flexFlow: 'row wrap',
      }}>
        <Controller
          control={control}
          name={name}
          rules={resolveRequired(required)}
          render={({
            field: { onChange, value, ref, ...controlProps },
          }) => {
            
            return options.map(option => (
              <RadioItem {...{
                size,
                option,
                style: radioStyle,
                innerStyle,
                noCheckmark,
                onChange,
                value,
                disabled,
                ref,
                controlProps,
                error: errors && get(errors, name)
              }} />
            ))
          }}
        />
      </div>
    </div>
  )
}

export const Radio = ({
  label,
  size = 16,
  options,
  style,
  radioStyle,
  noCheckmark,
  innerStyle,
  disabled,
  value,
  onChange
}) => {

  return (
    <div css={{
      display: 'flex',
      flexFlow: 'row wrap',
      alignItems: 'center',
      ...style
    }}>
      <div css={{
        marginRight: 24,
        marginBottom: 8,
      }}>
        {label}
      </div>
      <div css={{
        display: 'flex',
        flexFlow: 'row wrap',
      }}>
        {options.map((option, index) => (
          <RadioItem {...{
            index,
            size,
            option,
            style: radioStyle,
            innerStyle,
            noCheckmark,
            onChange,
            value,
            disabled,
            onChange
          }} />
        ))}
      </div>
    </div>
  )
}

const RadioItem = forwardRef(({
  size = 16,
  option,
  style,
  innerStyle,
  noCheckmark,
  value,
  onChange,
  disabled,
  controlProps,
  error,
  index
}, ref) => {
  const [hover, setHover] = useState(false)

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      !disabled && onChange(option)
    }
  }

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        color: disabled ? 'var(--textLowOpacity)' : 'var(--textColor)',
        marginRight: 16,
        cursor: disabled ? 'default' : 'pointer',
        marginBottom: 8,
        ...style
      }}
      onClick={() => onChange(option)}
      onKeyDown={handleKeyDown}
      key={index}
    >
      <div
        onMouseEnter={() => !disabled && setHover(true)}
        onMouseLeave={() => setHover(false)}
        tabIndex='0'
        style={{
          width: size,
          height: size,
          minWidth: size,
          minHeighT: size,
          cursor: 'pointer',
          border: `${error && hover ? 2 : 1}px solid ${disabled ? 'var(--textLowOpacity)' : error ? 'red' : 'var(--textColor)'}`,
          borderRadius: 3,
          display: 'grid',
          placeItems: 'center',
          position: 'relative',
          boxShadow: `0 0 0 ${error ? 3 : 1}px ${error ? '#ffe1e1' : hover ? 'var(--textColor)' : 'transparent'}`,
          marginRight: 8,
          background: 'var(--backgroundColor)',
          ...innerStyle
        }}
      >
        {value === option && (!noCheckmark ? (
          <FaCheck size={Math.round(size - (size / 2.5))} />
        ) : (
          <div
            style={{
              position: 'absolute',
              width: Math.round(size - (size / 2)),
              height: Math.round(size - (size / 2)),
              borderRadius: 2,
              background: 'var(--primaryColor)'
            }}
          />
        ))}
      </div>
      <div>
        {option}
      </div>

      <input
        value={value}
        disabled={disabled}
        type='text'
        hidden
        ref={ref}
        onChange={onChange}
        {...controlProps}
      />
    </div>
  )
})