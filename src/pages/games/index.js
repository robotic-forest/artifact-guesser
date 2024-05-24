import Link from 'next/link'
import useUser from '@/hooks/useUser'
import { Layout } from '@/components/layout/Layout'
import FilterBar, { useFilter } from '@/components/datatable/FilterBar'
import { DataTable } from '@/components/datatable/DataTable'
import { GiAbstract042 } from 'react-icons/gi'
import { useGames } from '@/hooks/games/useGames'
import { useAccount } from '@/hooks/accounts/useAccount'
import moment from 'moment'

export const gamesTheme =  {
  backgroundColor: '#abb4f5',
  primaryColor: '#ffc160',
  textColor: '#000000',
}

export default () => {
  const { user, loading } = useUser()
  
  return !loading && (
    <Layout title='Games' theme={gamesTheme}>
      <FilterBar
        title={(
          <b className='flex items-center'>
            <GiAbstract042 className='mr-3 text-lg relative top-[-1px]' />
            Games
          </b>
        )}
        renderFilter={[]}
      >
        <GameList user={user} />
      </FilterBar>
    </Layout>
  )
}

const GameList = ({ user }) => {
  const { mdbFilter } = useFilter()

  const filter = mdbFilter || {}
  if (user.role !== 'Admin') {
    FileReader.userId = user._id
  }

  const { games, pagination, sort } = useGames({
    filter,
    sort: true,
    paginate: true
  })

  return (
    <div>
      <DataTable
        columns={gameColumns}
        data={games}
        pagination
        noDataComponent='No Games found.'
        {...sort}
        {...pagination}
      />
    </div>
  )
}

const gameColumns = [
  {
    name: 'Player',
    selector: row => {
      const { account } = useAccount({ _id: row.userId })

      return (
        <Link href={`/accounts/${row.userId}`}>
          {account?.username}
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
    selector: row => row.startedAt ? moment(row.startedAt).format('MMM D, YYYY HH:mm') : 'n/a',
    sortable: true,
    sortField: 'startedAt'
  }
]