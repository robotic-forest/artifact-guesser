import ClipLoader from "react-spinners/ClipLoader"

export const Loading = ({ inline, style, children, color, center }) => {

  let css = inline ? {
    display: 'inline-flex',
    position: 'relative',
  } : {
    height: '100vh',
    width: '100vw',
    display: 'grid',
    placeItems: 'center'
  }

  if (center) {
    css = {
      ...css,
      height: 52,
      width: '100%',
      borderRadius: 'var(--br)',
      border: '1px solid var(--textSuperLowOpacity)',
      display: 'grid',
      placeItems: 'center',
    }
  }

  return (
    <div css={{ ...css, ...style }}>
      <div css={{ display: 'inline-flex', alignItems: 'center' }}>
        <ClipLoader
          color={color || 'var(--textLowOpacity)'}
          loading
          cssOverride={{
            marginRight: 10,
            position: 'relative',
            top: 1
          }}
          size={12}
        />
        {children}
      </div>
    </div>
  )
}