import { useEffect, useState } from "react"
import { Dropdown } from "../dropdown/Dropdown"

export const EditableDate = ({ selectedDate, setSelectedDate }) => {
  const [editing, setEditing] = useState(false)
  const [notation, setNotation] = useState(selectedDate >= 0 ? 'AD' : 'BC')

  useEffect(() => { setNotation(selectedDate >= 0 ? 'AD' : 'BC') }, [selectedDate])

  return (
    <div className='mr-1 min-w-[75px] max-w-[75px] bg-[#90d6f8] text-black
      p-[2px_8px_4px] rounded-[3px] text-sm h-[24px] flex justify-between w-full'>
      <input
        type='number'
        className='bg-transparent border-none text-black text-center w-full h-full'
        value={(selectedDate || !editing) ? Math.abs(selectedDate) : ''}
        onChange={e => {
          const v = Math.abs(e.target.value)
          setSelectedDate(notation === 'AD' ? v : -v)
        }}
        onFocus={() => setEditing(true)}
        onBlur={() => setEditing(false)}
        // autoFocus
        css={{
          ':focus': { outline: 'none' },
          width: 40,
          textAlign: 'start'
        }}
      />
      <Dropdown
        top={-100}
        button={<span css={{ cursor: 'pointer', '&:hover': { color: '#00000066' } }}>{notation}</span>}
        menuButtons={[
          {
            contents: 'AD',
            onClick: () => {
              setNotation('AD')
              if (selectedDate < 0) setSelectedDate(Math.abs(selectedDate))
            }
          },
          {
            contents: 'BC',
            onClick: () => {
              setNotation('BC')
              if (selectedDate >= 0) setSelectedDate(-Math.abs(selectedDate))
            }
          }
        ]}
        closeAfterClick
        dropdownStyle={{
          width: 50,
          left: -10
        }}
      />
    </div>
  )
}