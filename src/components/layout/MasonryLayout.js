import styled from '@emotion/styled'
import Masonry from 'react-masonry-css'

export const MasonryLayout = ({ children, gutter = 8, breaks, max, isMobile, style, noCalc, align }) => {
  // Make sure we don't have more columns than items
  const calc = n => noCalc ? n : children.length < n ? children.length : n

  const customBreakpoints = breaks && Object.keys(breaks)
    .reduce((acc, key) => ({ ...acc, [key]: calc(breaks[key]) }), {})


  const breakpoints = customBreakpoints || {
    default: calc(max || 3),
    1000: calc(max || 2),
    600: calc(1),
  }

  const mobileBreaks = {
    default: 1
  }

  return (
    <div style={style}>
      <MasonryContainer gutter={gutter} isMobile={isMobile} align={align}>
        <Masonry
          breakpointCols={isMobile ? mobileBreaks : breakpoints}
          className="my-masonry-grid"
          columnClassName="my-masonry-grid_column"
        >
          {children}
        </Masonry>
      </MasonryContainer>
    </div>
  )
}

const MasonryContainer = styled.div`
  width: calc(100% + ${p => p.gutter}px);

  ${p => p.isMobile && 'width: 100%;'}

  .my-masonry-grid {
    display: flex;
    align-items: ${p => p.align === 'end' ? 'flex-end' : 'flex-start'};
    margin-left: -${p => p.isMobile ? 0 : p.gutter}px; /* gutter size offset */
    width: 100%;
  }
  .my-masonry-grid_column {
    padding-left: ${p => p.isMobile ? 0 : p.gutter}px; /* gutter size */
    background-clip: padding-box;
  }
`