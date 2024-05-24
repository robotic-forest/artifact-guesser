import { useEffect, useState } from "react"
import { Dropdown } from "../dropdown/Dropdown"

export const EditableDate = ({ value, onChange, className, dropDownPlace = 'top' }) => {
  const [editing, setEditing] = useState(false)
  const [notation, setNotation] = useState(value >= 0 ? 'AD' : 'BC')

  useEffect(() => { setNotation(value >= 0 ? 'AD' : 'BC') }, [value])

  return (
    <div className={`min-w-[75px] max-w-[75px]
      p-[4px_8px_4px] text-sm h-[24px] flex justify-between items-center ${className}`}>
      <input
        type='number'
        className='bg-transparent border-none text-black text-center w-full h-full'
        value={(value || !editing) ? Math.abs(value) : ''}
        onChange={e => {
          const v = Math.abs(e.target.value)
          if (String(v).length === 5 && value.length === 4) return
          onChange(notation === 'AD' ? v : -v)
        }}
        onFocus={() => setEditing(true)}
        onBlur={() => setEditing(false)}
        // autoFocus
        css={{
          ':focus': { outline: 'none' },
          width: 40,
          textAlign: 'start',
          position: 'relative',
          top: -1
        }}
      />
      <Dropdown
        top={dropDownPlace === 'top' ? -100 : 12}
        button={<span css={{ cursor: 'pointer', '&:hover': { opacity: 0.7 } }}>{notation}</span>}
        menuButtons={[
          {
            contents: 'AD',
            onClick: () => {
              setNotation('AD')
              if (value < 0) onChange(Math.abs(value))
            }
          },
          {
            contents: 'BC',
            onClick: () => {
              setNotation('BC')
              if (value >= 0) onChange(-Math.abs(value))
            }
          }
        ]}
        closeAfterClick
        dropdownStyle={{
          width: 42,
          left: -10
        }}
      />
    </div>
  )
}