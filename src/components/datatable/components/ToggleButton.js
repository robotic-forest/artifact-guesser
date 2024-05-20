import { RxEyeClosed, RxEyeOpen } from "react-icons/rx"

export const ToggleButton = ({ name, hiddenFields }) => {

  return (
    <div css={{
      width: '100%',
      display: 'flex',
      justifyContent: 'space-between',
    }}>
      {name}
      {hiddenFields.includes(name) ? <RxEyeClosed /> : <RxEyeOpen />}
    </div>
  )
}