import { AccountInfo } from '@/components/info/AccountInfo'
import { AccountActions } from '@/components/accounts/AccountActions'
import { useAccount } from '@/hooks/accounts/useAccount'
import { InfoBox } from '@/components/info/InfoBox'
import useUser from '@/hooks/useUser'
import { Layout } from '@/components/layout/Layout'
import { accountTheme } from '..'

export default function Account() {
  const { account } = useAccount()
  const { loading } = useUser({ redirectTo: '/' })

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
        </div>
      </div>
    </Layout>
  )
}