import Link from 'next/link'
import useUser from '@/hooks/useUser'
import { Layout } from '@/components/layout/Layout'
import FilterBar, { useFilter } from '@/components/datatable/FilterBar'
import { DataTable } from '@/components/datatable/DataTable'
import { GiAbstract034 } from 'react-icons/gi'
import { useGames } from '@/hooks/games/useGames'
import moment from 'moment'
import { useMediaQuery } from 'react-responsive'
import { IconGenerator } from '@/components/art/IconGenerator'
import { IconButton } from '@/components/buttons/IconButton'
import { IoMdEye } from 'react-icons/io'
import { Tag } from '@/components/tag/Tag'

export const gamesTheme =  {
  backgroundColor: '#abb4f5',
  primaryColor: '#ffc160',
  textColor: '#000000',
}

export default () => {
  const u = useUser()
  
  return (
    <Layout title='Games' theme={gamesTheme}>
      <FilterBar
        title={(
          <b className='flex items-center'>
            <GiAbstract034 className='mr-3 text-lg relative top-[-1px]' css={{
              '@media (max-width: 600px)': { marginLeft: 32 }
            }} />
            Games
          </b>
        )}
        renderFilter={[]}
      >
        {u?.user?.isLoggedIn && (
          <GameList {...u} excludeColumns={!u?.isAdmin ? ['Player'] : []}/>
        )}
      </FilterBar>
    </Layout>
  )
}

export const GameList = ({ user, isAdmin, baseFilter = {}, excludeColumns, skip }) => {
  const { mdbFilter } = useFilter()

  const filter = { ...(mdbFilter || {}), ...baseFilter }
  if (!isAdmin) { filter.userId = user._id }

  const { games, pagination, sort } = useGames({
    filter,
    sort: true,
    paginate: true,
    skip
  })

  return (
    <GamesDataTable {...{ games, sort, pagination, excludeColumns, isAdmin }} />
  )
}

export const GamesDataTable = ({ games, sort, pagination, excludeColumns = [], isAdmin }) => {
  const isMobile = useMediaQuery({ maxWidth: 800 })
  return (
    <>
      {isMobile && games && (
        <div css={{ background: 'var(--backgroundColorBarelyDark)', borderRadius: 5 }}>
          {games.map((g, i) => {

            return (
              <div href={`/games/${g._id}`} key={g.id} className='flex justify-between p-2' css={{
                borderBottom: i === games?.length - 1 ? 'none' : '1px solid var(--backgroundColorSlightlyDark)',
                fontSize: '0.8rem',
              }}>
                <div css={{ display: 'flex', flexFlow: 'row wrap', marginRight: 8 }}>
                  {isAdmin && (
                    <Tag noBorder big className='mr-2 mb-1'>
                      <Link href={`/accounts/${g._id}`} className='flex items-center'>
                        <IconGenerator className='mr-2 relative top-[-1px]' />
                        {g.username}
                      </Link>
                    </Tag>
                  )}
                  <div className='mr-4 mb-1'>
                    <span className='opacity-70 mr-1'>Score</span> <b>{g.score}</b> / 1000
                  </div>
                  <div className='mr-4 mb-1'>
                    <span className='opacity-70 mr-1'>Status</span> {g.round === g.rounds ? 'Completed' : `${g.round}/${g.rounds}`}
                  </div>
                  <div className='mr-4 mb-1'>
                    <span className='opacity-70 mr-1'>Mode</span> {g.mode}
                  </div>
                  <div className='mr-4 mb-1'>
                    <span className='opacity-70 mr-1'>Started At</span> {g.startedAt ? moment(g.startedAt).format('MMM D, YYYY hh:mma') : 'N/A'}
                  </div>
                </div>
                <div>
                  <Link href={`/games/${g._id}`}>
                    <IconButton>
                      <IoMdEye />
                    </IconButton>
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      )}
      <DataTable
        columns={gameColumns.filter(r => !excludeColumns.includes(r.name))}
        data={games}
        pagination
        noDataComponent='No Games found.'
        {...sort}
        {...pagination}
        highlightOnHover
        scrollOverflow
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
        customStyles={isMobile ? {
          tableWrapper: {
            style: {
              display: 'none'
            }
          },
          tableBody: {
            style: {
              display: 'none'
            }
          }
        } : {
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
    </>
  )
}

const gameColumns = [
  {
    name: 'Player',
    selector: row => {
      return (
        <Link href={`/accounts/${row.userId}`}>
          <Tag noBorder big>
            <div className='flex items-center'>
              <IconGenerator className='mr-2 relative top-[-1px]' />
              {row?.username}
            </div>
           </Tag>
        </Link>
      )
    }
  },
  {
    name: 'Score',
    selector: row => <><b>{row.score}</b> / 1000</>,
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