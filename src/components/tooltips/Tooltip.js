import ReactTooltip from "react-tooltip"

export const Tooltip = p => <ReactTooltip
  className='globaltooltip'
  place={p.place || 'top'}
  type="dark"
  effect="solid"
  backgroundColor='#000000'
  {...p}
/>