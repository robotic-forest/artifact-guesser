import { DashInfo } from "@/components/info/DashInfo"
import { GoatStats } from "@/components/info/GoatCounter"
import { Layout } from "@/components/layout/Layout"
import { useAccounts } from "@/hooks/accounts/useAccounts"
import { useArtifacts } from "@/hooks/artifacts/useArtifacts"
import { useGames } from "@/hooks/games/useGames"
import { FaUser } from "react-icons/fa"
import { GiAbstract034, GiAmphora, GiGoat } from "react-icons/gi"
import { MdDashboard } from "react-icons/md"
import { artifactsTheme } from "./artifacts"
import { accountTheme } from "./accounts"
import { gamesTheme } from "./games"
import { AllAccountActions } from "@/components/dashbaord/AllAcountActions"
import { MasonryLayout } from "@/components/layout/MasonryLayout"
import useSWR from "swr"

export const dashbaordTheme = {
  backgroundColor: '#78c9ab',
  primaryColor: '#96a1f7',
  textColor: '#000000',
}

export default () => {
  const { artifacts } = useArtifacts({ total: true })
  const { accounts } = useAccounts({ total: true })
  const { games } = useGames({ total: true })
  const { data: stats } = useSWR('/api/platform/stats')

  return (
    <Layout title='Dashboard' theme={dashbaordTheme}>
      <div className='mb-3 flex items-center'>
        <MdDashboard className='mr-2'/>
        Dashbaord
      </div>
      <div className='flex items-center text-sm' css={{
        marginBottom: 8
      }}>
        <GiGoat style={{ marginRight: 6 }} />
        Goatcounter Views
      </div>
      <MasonryLayout breaks={{ 600: 1, default: 2 }}>
        <GoatStats /> 
        <DashInfo
          title={<><GiAmphora className='mr-2'/>Artifacts</>}
          count={artifacts}
          url='/artifacts'
          theme={artifactsTheme}
        />
        <DashInfo
          title={<><GiAbstract034 className='text-sm mr-2'/>Games played</>}
          count={games}
          extraInfo={(
            <div className='mt-2 text-sm'>
              Unauthenticated games: {stats?.noauthGames}
            </div>
          )}
          url='/games?__sortfield=startedAt&__sortdirection=-1'
          theme={gamesTheme}
        />
        <DashInfo
          title={<><FaUser className='text-sm mr-2'/>Accounts</>}
          count={accounts}
          url='/accounts'
          theme={accountTheme}
          actions={<AllAccountActions />}
        />
      </MasonryLayout>
    </Layout>
  )
}