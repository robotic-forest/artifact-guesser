import { Controller, useFormContext } from 'react-hook-form'
import { useState } from 'react'
import { FaCheck } from 'react-icons/fa'

export const FormCheckbox = ({
  name,
  size = 16,
  label,
  style,
  noCheckmark,
  disabled,
  hover: controlHover,
  labelBehind
}) => {
  const { control } = useFormContext()
  const [hover, setHover] = useState(false)

  return (
    <Controller
      control={control}
      name={name}
      render={({
        field: { onChange, onBlur, value, ref },
      }) => {

        const handleKeyDown = (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            !disabled && onChange(!value)
          }
        }

        return (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              color: disabled ? 'var(--textLowOpacity)' : 'var(--textColor)',
              flexDirection: labelBehind ? 'row-reverse' : 'row',
              ...style
            }}
            onClick={() => !disabled && onChange(!value)}
            onKeyDown={handleKeyDown}
          >
            <div
              tabIndex='0'
              onMouseEnter={() => !disabled && setHover(true)}
              onMouseLeave={() => setHover(false)}
              style={{
                width: size,
                height: size,
                minWidth: size,
                minHeight: size,
                border: `1px solid ${disabled ? 'var(--textLowOpacity)' : 'var(--textColor)'}`,
                borderRadius: 3,
                display: 'grid',
                placeItems: 'center',
                position: 'relative',
                cursor: disabled ? 'default' : 'pointer',
                boxShadow: `0 0 0 1px ${(!disabled && controlHover !== 'undefined' ? Boolean(controlHover) : hover) ? 'var(--textColor)' : 'transparent'}`,
                marginRight: 8,
                background: 'var(--backgroundColor)'
              }}
            >
              {value && (!noCheckmark ? (
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
            <div style={{ position: 'relative', top: 1.5, cursor: disabled ? 'default' : 'pointer' }}>
              {label}
            </div>

            <input
              onBlur={onBlur}
              checked={value || false}
              onChange={onChange}
              disabled={disabled}
              hidden
              ref={ref}
              type='checkbox'
            />
          </div>
        )
      }}
    />
  )
}

export const Checkbox = ({
  size = 16,
  label,
  style,
  innerStyle,
  noCheckmark,
  onChange,
  checked,
  disabled,
}) => {
  const [hover, setHover] = useState(false)

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      !disabled && onChange(!checked)
    }
  }

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        color: disabled ? 'var(--textLowOpacity)' : 'var(--textColor)',
        ...style
      }}
    >
      <div
        onMouseEnter={() => !disabled && setHover(true)}
        onMouseLeave={() => setHover(false)}
        onClick={() => !disabled && onChange(!checked)}
        onKeyDown={handleKeyDown}
        tabIndex='0'
        style={{
          width: size,
          height: size,
          minWidth: size,
          minHeighT: size,
          cursor: 'pointer',
          border: `1px solid ${disabled ? 'var(--textLowOpacity)' : 'var(--textColor)'}`,
          borderRadius: 3,
          display: 'grid',
          placeItems: 'center',
          position: 'relative',
          cursor: disabled ? 'default' : 'pointer',
          boxShadow: `0 0 0 1px ${hover ? 'var(--textColor)' : 'transparent'}`,
          marginRight: 8,
          background: 'var(--backgroundColor)',
          ...innerStyle
        }}
      >
        {checked && (!noCheckmark ? (
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
      <div
        onClick={() => !disabled && onChange(!checked)}
        style={{
          position: 'relative',
          top: 1.5,
          cursor: 'pointer'
        }}
      >
        {label}
      </div>

      <input
        checked={checked}
        disabled={disabled}
        hidden
        type='checkbox'
      />
    </div>
  )
}