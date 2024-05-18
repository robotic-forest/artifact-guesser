import ReactTooltip from "react-tooltip"

const Tooltip = p => {

  return (
    <ReactTooltip
      className='globaltooltip'
      place={p.place || 'top'}
      type="dark"
      effect="solid"
      backgroundColor='#000000'
      {...p}
    />
  )
}

export default Tooltip