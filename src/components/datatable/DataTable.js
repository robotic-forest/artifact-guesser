import ReactDataTable, { createTheme } from 'react-data-table-component'
import { CustomPagination } from './CustomPagination'
import { Loading } from '../loading/Loading'

// Docs
// https://react-data-table-component.netlify.app/?path=/docs/getting-started-intro--docs

// Column docs
// https://react-data-table-component.netlify.app/?path=/docs/api-columns--page

// createTheme creates a new theme named solarized that overrides the build in dark theme
createTheme('default', {
  text: {
    primary: 'var(--textColor)',
    secondary: 'var(--textLowOpacity)',
  },
  background: {
    default: 'transparent',
  },
  context: {
    background: 'var(--backgroundColor)',
    text: 'var(--textColor)',
  },
  divider: {
    default: 'var(--backgroundColorSlightlyDark)',
  },
}, 'dark')


export const DataTable = ({ noDataComponent, customStyles, info, scrollOverflow, ...props }) => {

  // reference:: https://github.com/jbetancur/react-data-table-component/blob/master/src/DataTable/styles.ts
  const defaultStyles = {
    expanderButton: {
      style: {
        borderRadius: '3px',
        marginLeft: 6,
        height: '60%',
        width: '40%',
        color: 'var(--textLowOpacity)',
        svg: {
          margin: '-6px',
        },
      },
    },
    headRow: {
      style: {
        backgroundColor: 'var(--backgroundColor)',
        minHeight: '52px',
        borderBottomWidth: '1px',
        borderBottomColor: 'transparent',
        borderBottomStyle: 'solid',
      }
    },
    headCells: {
      style: {
          paddingLeft: '8px', // override the cell padding for head cells
          paddingRight: '8px',
      },
    },
    cells: {
      style: {
          paddingLeft: '8px', // override the cell padding for data cells
          paddingRight: '8px',
      },
    },
    rows: {
      style: {
        background: 'var(--backgroundColorBarelyDark)',
        '&:first-of-type': {
          borderTopLeftRadius: '6px',
          borderTopRightRadius: '6px',
        },
        '&:last-of-type': {
          borderBottomLeftRadius: '6px',
          borderBottomRightRadius: '6px',
        },
      },
      highlightOnHoverStyle: {
        color: 'var(--textColor)',
        backgroundColor: 'var(--backgroundColorSliightlyDark)',
        borderBottomColor: 'var(--backgroundColorSlightlyDark)',
        transition: 'all 0.3s ease',
        cursor: 'pointer',
        outline: 'none',
      }
    },
    pagination: {
      style: {
        minHeight: '36px',
      },
      pageButtonsStyle: {
        borderRadius: '6px',
        height: '25px',
        width: '25px',
        padding: '1px',
        margin: '0px 2px',
      },
    },
    responsiveWrapper: {
      style: {
        overflowX: scrollOverflow ? 'auto' : 'unset',
        overflowY: 'unset',
      },
    },
  }

  return (
    <ReactDataTable
      dense
      theme='default'
      customStyles={{
        ...defaultStyles,
        ...customStyles
      }}
      progressComponent={
        <Loading inline center>
          Loading...
        </Loading>
      }
      noDataComponent={(
        <div css={{
          borderRadius: 6,
          padding: 16,
          width: '100%',
          textAlign: 'center',
          background: 'var(--backgroundColorBarelyDark)',
        }}>
          {noDataComponent}
        </div>
      )}
      paginationComponent={p => <CustomPagination {...p} info={info} />}
      {...props}
    />
  )
}