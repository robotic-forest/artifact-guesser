import Link from 'next/link'
import useUser from '@/hooks/useUser'
import { Layout } from '@/components/layout/Layout'
import FilterBar, { useFilter } from '@/components/datatable/FilterBar'
import { DataTable } from '@/components/datatable/DataTable'
import { GiAbstract042 } from 'react-icons/gi'
import { useGames } from '@/hooks/games/useGames'
import { useAccount } from '@/hooks/accounts/useAccount'

export default () => {
  const { user, loading } = useUser()
  
  return !loading && (
    <Layout>
      <FilterBar
        title={(
          <b className='flex items-center'>
            <GiAbstract042 className='mr-3 text-lg relative top-[-1px]' />
            Games
          </b>
        )}
        noLayoutShift
        // searchFields={[
        //   { label: 'Last Name', value: 'lastName' },
        //   { label: 'First Name', value: 'firstName' },
        //   { label: 'Email', value: 'email' }
        // ]}
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

  const { games, pagination, sort } = useGames({ filter, sort: true, paginate: true })

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
      const { account } = useAccount({ id: row.userId })

      return (
        <Link href={`/accounts/${row.userId}`}>
          <a>{account.username}</a>
        </Link>
      )
    }
  },
  {
    name: 'Score',
    selector: row => row.score,
  },
  {
    name: 'Progress',
    selector: row => row.round === row.rounds ? 'Completed' : `${row.round}/${row.rounds}`,
  },
  {
    name: 'Mode',
    selector: row => row.mode,
  }
]