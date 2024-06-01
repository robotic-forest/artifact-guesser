import styled from '@emotion/styled'
import { get } from 'lodash'
import { Controller, useFormContext } from 'react-hook-form'
import { IoMdArrowDropdownCircle } from 'react-icons/io'
import TextareaAutosize from 'react-textarea-autosize'
import Select from 'react-select'
import { labelize } from './formUtils'
import moment from 'moment'

export const Form = styled.form`
  @media (max-width: 500px) { width: 100%; }
  display: flex;
  flex-direction: column;
  align-items: start;
  text-align: start;

  & > .mainform {
    width: 100%;

    & > div > div > textarea { height: 400px }

    @media (min-width: 1920px) {
      display: flex;

      & > div:first-of-type {
        width: 50%;
        margin-right: 15px
      }
      & > div:last-of-type {
        width: 50%;
        margin-left: 15px;
        height: calc(100% - 75px);

        & > div {
          & > textarea { height: 100% }
        }
      }
    }
  }
`

export const FormBody = styled.div`
  width: ${p => p.width ? 'fit-content' : '100%'};
  display: flex;
  flex-flow: row wrap;
  justify-content: ${p => p.small ? 'start' : 'space-between'};
  margin-bottom: ${p => p.mb ? '1em' : '0'};

  & > div { width: ${p => p.width ? `${p.width}px` : p.small ? 'auto' : 'calc(50% - 8px)'} !important }

  @media (max-width: ${p => p.break || 500}px) {
    & > div {
      width: ${p => p.width ? `${p.width}px` : p.mobilesmall ? '48%' : p.small ? '49.5%' : '100%'} !important;
    }
  }
`

export const FormTitle = ({ children, style }) => {
  return <h3 css={{ margin: '3em 0 2em', fontWeight: 600, ...style }}>{children}</h3>
}

export const resolveRequired = (required, constrainDate, type) => {
  let r = {}
  if (typeof required === 'boolean' && !!required) r = { required: 'Required' }
  if (typeof required === 'string') r = { required }
  if (typeof required === 'object') r = required

  if (constrainDate) r.validate = validateDate(type)
  
  return r
}

// Custom validation function
const validateDate = type => value => {
  if (!value) return true

  const date = moment(value, type === 'datetime-local' ? 'YYYY-MM-DD[T]HH:mm' : 'YYYY-MM-DD', true)
  if (!date.isValid()) {
    return `Please enter a valid ${type === 'datetime-local' ? 'date and time' : 'date'}.`
  }

  if (date.year() < 1900 || date.year() > 2100) {
    return 'Date must be between 1900 and 2100'
  }

  return true
}


export const FormInput = ({
  type = 'text',
  label,
  name,
  style,
  inputCSS,
  dropdown,
  naked,
  underline,
  search,
  required,
  formProps,
  unit,
  ...props
}) => {
  const { formState: { errors }, register } = useFormContext() || formProps

  const constrainDate = ['datetime-local', 'date'].includes(type)
  const registerObject = register(name, resolveRequired(required, constrainDate, type))

  if (constrainDate) {
    props.min = props.min || '1900-01-01'
    props.max = props.max || '2100-01-01'
  }

  return (
    <div css={{ width: '100%', marginBottom: (naked || underline) ? 0 : 12, ...style }}>
      {label && (
        <span css={{
          position: 'relative',
          top: '-4px',
          fontSize: '0.9em',
          color: props.disabled ? 'var(--textLowOpacity)' : 'var(--textColor)'
        }}>
          {label}
        </span>
      )}
      <span style={{ whiteSpace: 'nowrap' }}>
        <Input
          spellcheck="false"
          type={type}
          error={get(errors, name)}
          naked={naked}
          underline={underline}
          hideArrows={props.hideArrows}
          css={{
            width: unit ? 'calc(100% - 20px)' : '100%',
            ...inputCSS
          }}
          search={search}
          {...registerObject}
          {...props}
        />
        {dropdown && (
          <span style={{ position: 'relative', right: 20, cursor: 'pointer' }} onClick={dropdown}>
            <IoMdArrowDropdownCircle style={{ position: 'relative', top: 2 }} />
          </span>
        )}
        {unit && (
          <span css={{
            marginLeft: 6
          }}>
            {unit}
          </span>
        )}
      </span>
      {!underline && errors && get(errors, name) && get(errors, name).message && (
        <FormError style={{ top: 5 }}>
          {get(errors, name).message}
        </FormError>
      )}
    </div>
  )
}

export const Input = styled.input`
  width: 100%;
  min-height: ${p => (p.naked || p.underline) ? '12px' : '28px'};
  border: 1px solid ${p => (p.naked || p.underline) ? 'transparent' : p.disabled ? `var(--textVeryLowOpacity)` : p.error ? '#f58585' : 'var(--textLowOpacity)'};
  border-radius: ${p => p.underline? '0px' : p.search ? '25px' : '5px'};
  padding: ${p => p.underline ? '0 0 4px 0' : p.naked ? '0px' : p.search ? '4px 32px' : '4px 6px'};
  color: ${p => p.disabled ? `var(--textLowOpacity)` : 'var(--textColor)'};
  background: var(--backgroundColor);
  ${p => p.underline ? `border-bottom: ${p.error ? '1.5px' : '1px'} solid ${p.error ? '#f58585' : 'var(--textLowOpacity)'};` : ''}

  @media (min-width: 500px) {
    &:hover {
      border-color: ${p => (p.naked || p.underline) ? 'transparent' : p.disabled ? `var(--textVeryLowOpacity)` : p.error ? '#f58585' : 'var(--textColor)'};
      box-shadow: 0px 0px 0px 0.5px ${p => (p.disabled || p.naked || p.underline) ? 'none' : p.error ? '#f58585' : 'var(--textLowOpacity)'};
      ${p => p.underline ? `border-bottom: ${p.error ? '1.5px' : '1px'} solid ${p.error ? '#f58585' : 'var(--textLowOpacity)'};` : ''}
    }
  }

  &:focus {
    outline: 0;
    border-color: ${p => (p.naked || p.underline) ? 'transparent' : p.error ? '#f58585' : 'var(--textColor)'};
    box-shadow: 0px 0px 0px 0.5px ${p => (p.disabled || p.naked || p.underline) ? 'none' : p.error ? '#f58585' : 'var(--textLowOpacity)'};
    ${p => p.underline ? `border-bottom: ${p.error ? '1.5px' : '1px'} solid ${p.error ? '#f58585' : 'var(--textLowOpacity)'};` : ''}
  }

  @media (max-width: 500px) {
    &:focus {
      border-color: ${p => (p.naked || p.underline) ? 'transparent' : p.error ? '#f58585' : 'var(--textVolor)'};
      box-shadow: 0px 0px 0px 0.5px ${p => (p.disabled || p.naked || p.underline) ? 'none' : p.error ? '#f58585' : 'var(--textLowOpacity)'};
      ${p => p.underline ? `border-bottom: ${p.error ? '1.5px' : '1px'} solid ${p.error ? '#f58585' : 'var(--textLowOpacity)'};` : ''}
    }
  }

  &::placeholder { color: ${p => p.error ? '#f58585' : `var(--textLowOpacity)`} }
  &::selection {
    color: black;
    background: var(--primaryColor)
  }

  ${p => p.hideArrows ? `&::-webkit-outer-spin-button, &::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }` : ``}
`

export const FormSelect = ({
  defaultValue,
  name,
  options,
  style,
  label,
  onChange,
  noOptionsMessage,
  required,
  ...props
}) => {
  const { control, formState: { errors } } = useFormContext() || mockFC

  const error = errors && get(errors, name)

  return (
    <div style={{ width: '100%', marginBottom: '1em', ...style }}>
      {label && (
        <div style={{
          marginBottom: 4,
          fontSize: '0.9em',
          color: props.disabled && 'var(--textLowOpacity)'
        }}>
          {label}
        </div>
      )}
      <Controller
        control={control}
        defaultstyle={{ color: 'var(--textColor)' }} Value={defaultValue}
        name={name}
        rules={resolveRequired(required)}
        render={({ field: { ref, onChange: oc, value, ...field } }) => {

          return (
            <ReactSelect
              {...field}
              error={error}
              style={{ width: '100%' }}
              inputRef={ref}
              isDisabled={props.disabled}
              value={labelize(value)}
              options={options.filter(o => typeof o === 'string').length === options.length
                ? options.map(o => ({ value: o, label: o }))
                : options
              }
              components={{
                NoOptionsMessage: () => <div style={{ padding: 12 }}>{noOptionsMessage || 'Loading...'}</div>
              }}
              onChange={e => {
                onChange && onChange(e)
                oc && oc(e)
              }}
              {...props}
            />
          )
        }}
      />
      {error && get(errors, name).message && (
        <FormError style={{ top: 6 }}>
          {get(errors, name).message}
        </FormError>
      )}
    </div>
  )
}

export const StateSelect = ({
  options,
  style,
  label,
  value,
  onChange,
  noOptionsMessage,
  error,
  ...props
}) => {

  return (
    <div style={{ width: '100%', marginBottom: '1em', ...style }}>
      <div style={{
        marginBottom: 4,
        fontSize: '0.9em',
        color: props.disabled && 'var(--textLowOpacity)'
      }}>
        {label}
      </div>
      <ReactSelect
        error={error}
        style={{ width: '100%' }}
        isDisabled={props.disabled}
        value={typeof value === 'string' ? labelize(value) : value
        }
        options={options.filter(o => typeof o === 'string').length === options.length
          ? options.map(o => ({ value: o, label: o }))
          : options
        }
        components={{
          NoOptionsMessage: () => <div style={{ padding: 12 }}>{noOptionsMessage || 'Loading...'}</div>
        }}
        onChange={onChange}
        {...props}
      />
      {error && (
        <FormError style={{ top: 6 }}>
          {error}
        </FormError>
      )}
    </div>
  )
}

export const FormError = styled.span`
  color: #eb0000;
  background: #ffe1e1;
  font-size: 0.9em;
  position: relative;
  padding: 2px 6px;
  border-radius: 5px;
  display: inline-block;
  margin-bottom: 6px;
`

export const customStyles = {
  option: (provided, state) => {
    return {
      ...provided,
      color: state.isDisabled
        ? 'var(--textLowOpacity)'
        : state.isSelected ? 'black' : 'var(--textColor)',
      backgroundColor: state.isSelected
        ? 'var(--primaryColor)'
        : 'var(--backgroundColor)',
      '&:hover': {
        backgroundColor: state.isSelected
          ? 'var(--primaryColor)'
          : state.isDisabled
            ? 'var(--backgroundColor)'
            : `var(--textSuperLowOpacity)`,
        cursor: (state.isDisabled || state.isSelected) ? 'default' : 'pointer'
      },
      cursor: 'pointer'
    }
  },
  control: (provided, state) => {
    return {
      ...provided,
      background: 'var(--backgroundColor)',
      borderColor: state.isFocused ? 'var(--textColor)' : 'var(--textLowOpacity)',
      boxShadow: `0 0 0 1px ${state.isFocused ? 'var(--textColor)' : 'transparent'}`,
      '&:hover': {
        borderColor: 'var(--textColor)',
        boxShadow: '0 0 0 1px var(--textLowOpacity)',
      },
      cursor: 'pointer',
    }
  },
  menu: provided => ({
    ...provided,
    borderRadius: 6,
    marginTop: 8,
    boxShadow:  `0 0 0 0.5px var(--textLowOpacity), 0 5px 25px -5px var(--textVeryLowOpacity)`,
    overflow: 'hidden',
    background: 'var(--backgroundColor)'
  }),
  groupHeading: provided => ({
    ...provided,
    padding: '2px 4px 3px 4px',
    border: '1px solid var(--textVeryLowOpacity)',
    color: 'var(--textColor)',
    borderRadius: 5,
    width: 'max-content',
    margin: '4px 10px 10px 10px'
  }),
  menuList: provided => ({
    ...provided,
    padding: 0,
    background: 'var(--backgroundColor)'
  }),
  placeholder: provided => ({
    ...provided,
    color: 'var(--textColor)'
  }),
  dropdownIndicator: provided => ({
    ...provided,
    color: 'var(--textLowOpacity)',
    '&:hover': { color: 'var(--textColor)' },
  }),
  indicatorSeparator: provided => ({
      ...provided,
      background: 'var(--textLowOpacity)',
      '&:hover': { background: 'var(--textColor)' },
  }),
  clearIndicator: provided => ({
    ...provided,
    color: 'var(--textLowOpacity)',
    '&:hover': { color: 'var(--textColor)' },
  }),
  valueContainer: provided => ({
    ...provided,
    padding: '5px 5px'
  }),
  multiValue: provided => ({
    ...provided,
    background: 'var(--primaryColorLight)',
    color: 'var(--textColor)'
  }),
  noOptionsMessage: provided => ({
    ...provided,
    background: 'var(--backgroundColor)',
    color: 'var(--textColor)'
  }),
  singleValue: provided => ({ ...provided, color: 'var(--textColor)' }),
  input: provided => ({
    ...provided,
    color: 'var(--textColor)'
  }),
}

export const errorStyles = {
  control: provided => {
    return {
      ...provided,
      background: 'var(--backgroundColor)',
      boxShadow: `0 0 0 1px #f58585`,
      borderColor: '#f58585',
      cursor: 'pointer',
      '&:hover': {
        borderColor: '#f58585',
      },
    }
  },
}

export const disabledStyles = {
  control: provided => {
    return {
      ...provided,
      background: 'var(--backgroundColor)',
      boxShadow: `none`,
      borderColor: 'var(--textVeryLowOpacity)',
      cursor: 'default',
      '&:hover': {
        borderColor: 'var(--textVeryLowOpacity)',
      },
    }
  },
  multiValue: provided => ({
    ...provided,
    background: 'var(--textSuperLowOpacity)',
    color: 'var(--textColor)',
    paddingRight: 3
  }),
  singleValue: provided => ({ ...provided, color: 'var(--textLowOpacity)' }),
  multiValueRemove: provided => ({
    ...provided,
    display: 'none',
  }),
  dropdownIndicator: provided => ({
    ...provided,
    display: 'none',
  }),
  indicatorSeparator: provided => ({
    ...provided,
    display: 'none',
  }),
  placeholder: provided => ({
    ...provided,
    color: 'var(--textLowOpacity)'
  }),
}

export const minimalistStyles = {
  control: provided => {
    return {
      ...provided,
      background: 'var(--backgroundColor)',
      borderColor: 'transparent',
      boxShadow: 'none',
      cursor: 'pointer',
      '&:hover': {
        borderColor: 'transparent',
        boxShadow: 'none',
      },
    }
  },
  indicatorSeparator: provided => ({
    ...provided,
    display: 'none',
  }),
  clearIndicator: provided => ({
    ...provided,
    display: 'none',
  }),
  valueContainer: provided => ({
    ...provided,
    padding: 0
  }),
  placeholder: provided => ({
    ...provided,
    color: 'var(--textLowOpacity)'
  }),
}

export const superMinimalistStyles = {
  control: (provided) => {
    return {
      ...provided,
      background: 'transparent',
      borderColor: 'transparent',
      boxShadow: 'none',
      cursor: 'pointer',
      '&:hover': {
        borderColor: 'transparent',
        boxShadow: 'none',
      },
      minHeight: undefined,
    }
  },
  indicatorSeparator: (provided) => { 
    return {
      ...provided,
      display: 'none',
    }
  },
  clearIndicator: (provided) => { 
    return {
      ...provided,
      display: 'none',
    }
  },
  valueContainer: (provided) => { 
    return {
      ...provided,
      padding: 0
    }
  },
  placeholder: (provided) => {
    return {
      ...provided,
      fontWeight: 600,
      color: 'var(--textLowOpacity)'
    }
  },
  dropdownIndicator: (provided) => { 
    return {
      ...provided,
      padding: 0,
      marginLeft: 4,
      color: 'var(--textLowOpacity)',
      '&:hover': { color: 'var(--textColor)' },
    }
  },
  input: (provided) => { 
    return {
      ...provided,
      paddingTop: 0,
      paddingBottom: 0,
      margin: 0
    }
  },
}

export const ReactSelect = props => {
  const selectStyles = {
    ...customStyles,
    ...(props.error ? errorStyles : {}),
    ...(props.disabled ? disabledStyles : {}),
    ...(props.minimalist ? minimalistStyles : {}),
    ...(props.superMinimalist ? superMinimalistStyles : {}),
  }

  return (
    <Select
      styles={selectStyles}
      {...props}
    />
  )
}

const mockFC = { formState: {}, register: () => {}, control: {} }

export const FormTextArea = ({
  type = 'text',
  height,
  label,
  name,
  style,
  textAreaStyle,
  adjust,
  autosize,
  required,
  noEnter,
  ...props
}) => {
  // I guess context doesn't always work?
  const { formState: { errors: contextErrors }, register } = useFormContext() || mockFC
  const registerObject = props.register
    ? props.register(name, resolveRequired(required))
    : register(name, resolveRequired(required))

  const errors = props.errors || contextErrors

  return (
    <div style={{ width: '100%', ...style }}>
      {label && (
        <div style={{
          position: 'relative',
          top: '-5px',
          fontSize: '0.9em',
          color: props.disabled ? 'var(--textLowOpacity)' : 'var(--textColor)',
          display: 'flex',
          justifyContent: 'space-between'
        }}>
          <div>{label}</div>
        </div>
      )}
      {autosize
        ? <AutoTextArea
            style={{ fontFamily: 'inherit', lineHeight: '1.2em', ...textAreaStyle }}
            type={type}
            error={get(errors, name)}
            onKeyPress={e => {
              if (noEnter && e.key === 'Enter')
                 e.preventDefault()
              }
            }
            { ...registerObject }
            { ...props }
          />
        : <TextArea
            height={height}
            style={{ fontFamily: 'inherit', lineHeight: '1.2em', ...textAreaStyle }}
            type={type}
            error={get(errors, name)}
            onKeyPress={e => {
              if (noEnter && e.key === 'Enter')
                 e.preventDefault()
              }
            }
            { ...registerObject }
            { ...props }
          />
      }
      {errors && get(errors, name) && (
        <FormError style={{ top: -10 }}>
          {get(errors, name).message}
        </FormError>
      )}
    </div>
  )
}

export const AutoTextArea = styled(TextareaAutosize)`
  resize: none;
  width: 100%;
  height: ${p => p.height || '50px'};
  border: 1px solid ${p => p.error ? '#f58585' : 'var(--textLowOpacity)'};
  padding: 5px;
  border-radius: 3px;
  color: var(--textColor);
  background: transparent;
  box-shadow: 0px 0px 0px 1px transparent;

  @media (min-width: 500px) {
    &:hover {
      border-color: ${p => p.disabled ? `var(--textLowOpacity)` : p.error ? '#f58585' : 'var(--textColor)'};
      box-shadow: 0px 0px 0px 0.5px ${p => p.disabled ? 'none' : p.error ? '#f58585' : 'var(--textLowOpacity)'}
    }
  }

  &:focus {
    outline: 0;
    border-color: ${p => p.error ? '#f58585' : 'var(--textColor)'};
    box-shadow: 0px 0px 0px 0.5px ${p => p.error ? '#f58585' : 'var(--textLowOpacity)'}
  }

  @media (max-width: 500px) {
    &:focus {
      border-color: ${p => p.error ? '#f58585' : 'var(--textColor)'};
      box-shadow: 0px 0px 0px 0.5px ${p => p.error ? '#f58585' : 'var(--textColor)'}
    }
  }

  &::placeholder {
    color: ${p => p.error ? '#f58585' : 'gray'}
  }
  &::selection {
    color: black;
    background: var(--primaryColor)
  }
`

export const TextArea = styled.textarea`
  resize: none;
  width: 100%;
  height: ${p => p.height || '50px'};
  border: 1px solid ${p => p.error ? '#f58585' : 'var(--textLowOpacity)'};
  padding: 5px;
  border-radius: 3px;
  color: var(--textColor);
  background: transparent;
  box-shadow: 0px 0px 0px 1px transparent;

  @media (min-width: 500px) {
    &:hover {
      border-color: ${p => p.disabled ? `var(--textLowOpacity)` : p.error ? '#f58585' : 'var(--textColor)'};
      box-shadow: 0px 0px 0px 0.5px ${p => p.disabled ? 'none' : p.error ? '#f58585' : 'var(--textColor)'}
    }
  }

  &:focus {
    outline: 0;
    border-color: ${p => p.error ? '#f58585' : 'var(--textColor)'};
    box-shadow: 0px 0px 0px 0.5px ${p => p.error ? '#f58585' : 'var(--textColor)'},
      0px 0px 0px 0.5px ${p => p.error ? '#f58585' : 'var(--textColor)'};
  }

  @media (max-width: 500px) {
    &:focus {
      border-color: ${p => p.error ? '#f58585' : 'var(--textColor)'};
      box-shadow: 0px 0px 0px 0.5px ${p => p.error ? '#f58585' : 'var(--textColor)'}
    }
  }

  &::placeholder {
    color: ${p => p.error ? '#f58585' : 'gray'}
  }
  &::selection {
    color: black;
    background: var(--primaryColor)
  }
`