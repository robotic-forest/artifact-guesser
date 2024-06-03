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

export default function Account() {
  const { account } = useAccount()
  const u = useUser({ redirectTo: '/' })
  const { user, loading } = u

  return loading ? null : (
    <Layout theme={accountTheme}>
      <div css={{
        display: 'flex',
        flexDirection: 'row',
        '@media(max-width: 1050px)': {
          flexDirection: 'column'
        }
      }}>
        <AccountInfo />
        <div style={{ width: '100%', marginBottom: 24 }}>
          {account?.status === 'Deactivated' && (
            <InfoBox closed>
              This account has been deactivated
            </InfoBox>
          )}
          <AccountActions />
          <div className='mt-8'>
            <FilterBar
              title={(
                <b className='flex items-center'>
                  <GiAbstract034 className='mr-3' />
                  Games
                </b>
              )}
              renderFilter={[]}
            >
              {user?.isLoggedIn && <GameList {...u} skip={!account?._id} baseFilter={{ userId: account?._id }} />}
            </FilterBar>
          </div>
        </div>
      </div>
    </Layout>
  )
}