import Link from 'next/link'
import useUser from '@/hooks/useUser'
import { Layout } from '@/components/layout/Layout'
import FilterBar, { useFilter } from '@/components/datatable/FilterBar'
import { DataTable } from '@/components/datatable/DataTable'
import { GiAbstract034 } from 'react-icons/gi'
import { useGames } from '@/hooks/games/useGames'
import moment from 'moment'

export const gamesTheme =  {
  backgroundColor: '#abb4f5',
  primaryColor: '#ffc160',
  textColor: '#000000',
}

export default () => {
  const { user } = useUser()
  
  return (
    <Layout title='Games' theme={gamesTheme}>
      <FilterBar
        title={(
          <b className='flex items-center'>
            <GiAbstract034 className='mr-3 text-lg relative top-[-1px]' />
            Games
          </b>
        )}
        renderFilter={[]}
      >
        {user?.isLoggedIn && <GameList user={user} />}
      </FilterBar>
    </Layout>
  )
}

export const GameList = ({ user, baseFilter = {}, excludeColumns, skip }) => {
  const { mdbFilter } = useFilter()

  const filter = { ...(mdbFilter || {}), ...baseFilter }
  if (user.role !== 'Admin') {
    filter.userId = user._id
  }

  const { games, pagination, sort } = useGames({
    filter,
    sort: true,
    paginate: true,
    skip
  })

  return (
    <GamesDataTable {...{ games, sort, pagination, excludeColumns }} />
  )
}

export const GamesDataTable = ({ games, sort, pagination, excludeColumns = [] }) => {

  return (
    <DataTable
      columns={gameColumns.filter(r => !excludeColumns.includes(r.name))}
      data={games}
      pagination
      noDataComponent='No Games found.'
      {...sort}
      {...pagination}
      highlightOnHover
      renderRow={(row, rowContent) => (
        <Link
          key={row.id}
          href={`/games/${row._id}`}
          css={{
            textDecoration: 'none',
            '&:first-of-type': {
              borderTopLeftRadius: '6px',
              borderTopRightRadius: '6px',
            },
            '&:last-of-type': {
              borderBottomLeftRadius: '6px',
              borderBottomRightRadius: '6px',
              borderBottom: 'none'
            },
            overflow: 'hidden',
            borderBottom: '1px solid var(--backgroundColorSlightlyDark)'
          }}
        >
          {rowContent}
        </Link>
      )}
      customStyles={{
        rows: {
          style: {
            background: 'var(--backgroundColorBarelyDark)',
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
      }}
    />
  )
}

const gameColumns = [
  {
    name: 'Player',
    selector: row => {
      return (
        <Link href={`/accounts/${row.userId}`}>
          {row?.username}
        </Link>
      )
    }
  },
  {
    name: 'Score',
    selector: row => `${row.score} / 1000`,
    sortable: true,
    sortField: 'score'
  },
  {
    name: 'Progress',
    selector: row => row.round === row.rounds ? 'Completed' : `${row.round}/${row.rounds}`,
  },
  {
    name: 'Mode',
    selector: row => row.mode,
  },
  {
    id: 'startedAt',
    name: 'Started',
    selector: row => row.startedAt ? moment(row.startedAt).format('MMM D, YYYY hh:mma') : 'N/A',
    sortable: true,
    sortField: 'startedAt'
  }
]