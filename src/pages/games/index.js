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
import { Tag } from '@/components/tag/Tag';

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
              <div key={g._id} className='flex justify-between p-2' css={{
                borderBottom: i === games?.length - 1 ? 'none' : '1px solid var(--backgroundColorSlightlyDark)',
                fontSize: '0.8rem',
              }}>
                <div css={{ display: 'flex', flexFlow: 'column wrap', marginRight: 8, gap: '4px' }}>
                  <div className='flex flex-wrap gap-x-4 gap-y-1'>
                    <div className='mr-4'>
                      <span className='opacity-70 mr-1'>Type</span> {g.gameType === 'multiplayer' ? 'Multiplayer' : 'Single'}
                    </div>
                    {isAdmin && g.gameType === 'single' && (
                      <div className='mr-4'>
                        <span className='opacity-70 mr-1'>Player</span>
                        <Link href={`/accounts/${g.userId}`} className='font-bold'>
                          {g.username}
                        </Link>
                      </div>
                    )}
                    {g.gameType === 'multiplayer' && (
                       <div className='mr-4'>
                         <span className='opacity-70 mr-1'>Players</span>
                         <span className='font-bold'>{g.players?.join(', ')}</span>
                       </div>
                    )}
                     {g.gameType === 'multiplayer' && g.winnerUsername && (
                       <div className='mr-4'>
                         <span className='opacity-70 mr-1'>Winner</span>
                         <span className='font-bold'>{g.winnerUsername}</span>
                       </div>
                    )}
                  </div>
                  <div className='flex flex-wrap gap-x-4 gap-y-1'>
                    <div className='mr-4'>
                      <span className='opacity-70 mr-1'>Score</span>
                      {g.gameType === 'multiplayer' ? (
                        <span title={g.allScoresTooltip || ''}>
                          <small className='opacity-80'>Top</small> {g.topScore ?? 'N/A'} <small className='opacity-80'>Avg</small> {g.averageScore ?? 'N/A'}
                        </span>
                      ) : (
                        <b>{g.score ?? 'N/A'}</b>
                      )}
                       {g.gameType === 'single' && ' / 1000'}
                    </div>
                    <div className='mr-4'>
                      <span className='opacity-70 mr-1'>Status</span> {g.ongoing === false ? 'Completed' : `${g.round || '?'}/${g.rounds || '?'}`}
                    </div>
                    <div className='mr-4'>
                      <span className='opacity-70 mr-1'>Mode</span> {g.mode}
                    </div>
                    <div className='mr-4'>
                      <span className='opacity-70 mr-1'>Started</span> {g.startedAt ? moment(g.startedAt).format('MMM D, YYYY hh:mma') : 'N/A'}
                    </div>
                  </div>
                </div>
                <div className='flex items-center'>
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
    name: 'Type',
    selector: row => row.gameType === 'multiplayer' ? 'Multiplayer' : 'Single',
    sortable: true,
    sortField: 'gameType',
    minWidth: '120px',
    maxWidth: '120px',
  },
  {
    name: 'Player(s)',
    selector: row => {
      if (row.gameType === 'multiplayer') {
        return (
          <span title={row.players?.join(', ')} css={{ 
            whiteSpace: 'nowrap', 
            overflow: 'hidden', 
            textOverflow: 'ellipsis',
            maxWidth: '200px', // Adjust as needed
            display: 'inline-block'
          }}>
            {`${row.players?.length} player${row.players?.length === 1 ? '' : 's'}`}
          </span>
        );
      } else {
        // Single player
        return (
          <Link href={`/accounts/${row.userId}`}>
            <Tag noBorder big>
              <div className='flex items-center'>
                <IconGenerator className='mr-2 relative top-[-1px]' />
                {row?.username}
              </div>
            </Tag>
          </Link>
        );
      }
    },
    minWidth: '150px',
  },
  {
    name: 'Winner',
    selector: row => row.gameType === 'multiplayer' ? row.winnerUsername || 'N/A' : 'N/A',
    minWidth: '120px',
  },
  {
    name: 'Score',
    selector: row => {
      if (row.gameType === 'multiplayer') {
        return (
          <span title={row.allScoresTooltip || ''}>
            <small className='opacity-80'>Top</small> {row.topScore ?? 'N/A'} <small className='opacity-80'>Avg</small> {row.averageScore ?? 'N/A'}
          </span>
        );
      } else {
        // Single player
        return <><b>{row.score ?? 'N/A'}</b> / 1000</>;
      }
    },
    sortable: true,
    sortField: 'topScore', // Use topScore for sorting both types
    minWidth: '150px',
  },
  {
    name: 'Progress',
    selector: row => row.ongoing === false ? 'Completed' : `${row.round || '?'}/${row.rounds || '?'}`,
    minWidth: '120px',
  },
  {
    name: 'Mode',
    selector: row => row.mode,
    minWidth: '100px',
  },
  {
    id: 'startedAt',
    name: 'Started',
    selector: row => row.startedAt ? moment(row.startedAt).format('MMM D, YYYY hh:mma') : 'N/A',
    sortable: true,
    sortField: 'startedAt',
    minWidth: '180px',
  }
];
