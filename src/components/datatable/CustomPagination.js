import { MdFirstPage, MdKeyboardArrowLeft, MdKeyboardArrowRight, MdLastPage } from 'react-icons/md'
import { IconButton } from '../buttons/IconButton'
import { ReactSelect } from '../form/Form'
import { labelize } from '../form/formUtils'

export const CustomPagination = props => {
  const {
    rowsPerPage,
    rowCount,
    onChangePage,
    onChangeRowsPerPage,
    currentPage,
    paginationRowsPerPageOptions,
    info
  } = props
  
  return (
    <div css={{
      display: 'flex',
      flexFlow: 'row wrap',
      justifyContent: 'space-between',
      alignItems: 'center',
      fontSize: '0.9em',
      marginTop: 8
    }}>
      <div>
        {info}
      </div>
      <div css={{
        display: 'flex',
        flexFlow: 'row wrap',
        color: 'var(--textLowOpacity)',
        alignItems: 'center'
      }}>
        <span css={{
          marginRight: 16
        }}>
          Rows per page
        </span>
        <div css={{

          marginRight: 8
        }}>
          <ReactSelect
            superMinimalist
            menuPlacement='top'
            value={labelize(rowsPerPage)}
            options={labelize(paginationRowsPerPageOptions)}
            onChange={v => onChangeRowsPerPage(v.value)}
          />
        </div>
        <span css={{ marginRight: 16 }}>
          {`${(currentPage - 1) * rowsPerPage + 1}-${Math.min(currentPage * rowsPerPage, rowCount)} of ${rowCount}`}
        </span>
        <TablePaginationActions
          count={rowCount}
          page={currentPage - 1}
          rowsPerPage={rowsPerPage}
          onChangePage={onChangePage}
        />
      </div>
    </div>
  )
}

const TablePaginationActions = ({ count, page, rowsPerPage, onChangePage }) => {

  return (
    <>
      <IconButton
        iconSize={18}
        onClick={() => onChangePage(1)}
        disabled={page === 0}
        aria-label="first page"
        tooltip="First page"
        css={{
          marginRight: 8
        }}
      >
        <MdFirstPage />
      </IconButton>
      <IconButton
        iconSize={18}
        onClick={() => onChangePage(page)}
        disabled={page === 0}
        aria-label="previous page"
        tooltip='Previous page'
        css={{
          marginRight: 8
        }}
      >
        <MdKeyboardArrowLeft />
      </IconButton>
      <IconButton
        onClick={() => onChangePage(page + 2)}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label="next page"
        tooltip='Next page'
        css={{
          marginRight: 8
        }}
        iconSize={18}
      >
          <MdKeyboardArrowRight />
      </IconButton>
      <IconButton
        onClick={() => onChangePage(Math.ceil(count / rowsPerPage))}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label="last page"
        tooltip='Last page'
        iconSize={18}
      >
        <MdLastPage />
      </IconButton>
    </>
  )
}