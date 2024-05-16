import { ClipLoader } from "react-spinners"

export const Spinner = ({ size = 12, color = '#ffffff77', s }) => (
  <ClipLoader
    loading
    color={color}
    size={size}
    css={{
      position: 'relative',
      top: 1,
      marginRight: 7,
      ...s
    }}
  />
)