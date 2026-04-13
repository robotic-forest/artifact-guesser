import { AccountInfo } from '@/components/info/AccountInfo'
import { AccountActions } from '@/components/accounts/AccountActions'
import { useAccount } from '@/hooks/accounts/useAccount'
import { InfoBox } from '@/components/info/InfoBox'
import useUser from '@/hooks/useUser'
import { Layout } from '@/components/layout/Layout'
import { accountTheme } from '..'
import { GameList } from '@/pages/games'
import { GiAbstract034 } from 'react-icons/gi'
import FilterBar from '@/components/datatable/FilterBar'
import { PlayerJourney } from '@/components/dashbaord/PlayerJourney'

export default function Account() {
  const { account } = useAccount()
  const u = useUser({ redirectTo: '/' })
  const { user, loading } = u

  return loading ? null : (
    <Layout theme={accountTheme}>
      <div>
        <AccountInfo actions={<AccountActions />} />
        <div style={{ width: '100%', minWidth: 0, overflow: 'hidden', marginBottom: 24 }}>
          {account?.status === 'Deactivated' && (
            <InfoBox closed>
              This account has been deactivated
            </InfoBox>
          )}
          {u.isAdmin && account?._id && (
            <div className='mb-2 p-3' css={{
              background: 'var(--backgroundColorBarelyLight)',
              border: '1px outset',
              borderColor: '#ffffff77 #00000077 #00000077 #ffffff77',
            }}>
              <PlayerJourney accountId={account._id} />
            </div>
          )}
          <div className='mt-4'>
            <FilterBar
              title={(
                <b className='flex items-center'>
                  <GiAbstract034 className='mr-3' />
                  Games
                </b>
              )}
              renderFilter={[]}
            >
              {user?.isLoggedIn && (
                <GameList
                  {...u}
                  skip={!account?._id}
                  baseFilter={{ userId: account?._id }}
                  excludeColumns={['Player']}
                />
              )}
            </FilterBar>
          </div>
        </div>
      </div>
    </Layout>
  )
}