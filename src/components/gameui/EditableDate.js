import { useEffect, useState } from "react";
import { Dropdown } from "../dropdown/Dropdown";

export const EditableDate = ({ value, onChange, className, dropDownPlace = 'top', autoFocus, disabled }) => { // Added disabled prop
  const [editing, setEditing] = useState(false);
  const [notation, setNotation] = useState(value >= 0 ? 'AD' : 'BC');

  useEffect(() => { setNotation(value >= 0 ? 'AD' : 'BC') }, [value]);

  return (
    // Add disabled styles to the container
    <div className={`min-w-[75px] max-w-[75px]
      p-[4px_8px_4px] text-sm h-[24px] flex justify-between items-center ${className} ${disabled ? 'opacity-70 cursor-not-allowed' : ''}`}>
      <input
        type='number'
        disabled={disabled} // Pass disabled prop to input
        className={`bg-transparent border-none text-black text-center w-full h-full ${disabled ? 'cursor-not-allowed' : ''}`}
        value={(value !== undefined && value !== null && (value !== 0 || !editing)) ? Math.abs(value) : ''} // Adjusted value check slightly
        onChange={e => {
          if (disabled) return; // Prevent change if disabled
          const v = Math.abs(e.target.value);
          // Allow clearing the input, handle potential NaN
          const numericValue = v === '' ? 0 : Number(v);
          if (isNaN(numericValue)) return; // Ignore non-numeric input
          if (String(numericValue).length >= 5 && String(value).length === 4) return; // Prevent excessive length (adjust if needed)
          onChange(notation === 'AD' ? numericValue : -numericValue);
        }}
        onFocus={() => !disabled && setEditing(true)} // Prevent focus if disabled
        onBlur={() => setEditing(false)} // Keep blur handler
        autoFocus={autoFocus && !disabled} // Prevent autoFocus if disabled
        css={{
          ':focus': { outline: 'none' },
          // Ensure text color is visible when disabled (might need adjustment based on theme)
          color: disabled ? '#555' : 'black',
          width: 40,
          textAlign: 'start',
          position: 'relative',
          top: -1,
        }}
      />
      <Dropdown
        disabled={disabled} // Pass disabled prop to Dropdown
        top={dropDownPlace === 'top' ? -85 : 12}
        button={<span css={{ cursor: disabled ? 'not-allowed' : 'pointer', '&:hover': { opacity: disabled ? 1 : 0.7 } }}>{notation}</span>} // Adjust cursor and hover
        MenuIconButtons={[
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
