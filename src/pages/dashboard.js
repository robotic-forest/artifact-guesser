import { DashInfo } from "@/components/info/DashInfo"
import { GoatStats } from "@/components/info/GoatCounter"
import { Layout } from "@/components/layout/Layout"
import { useAccounts } from "@/hooks/accounts/useAccounts"
import { useArtifacts } from "@/hooks/artifacts/useArtifacts"
import { useGames } from "@/hooks/games/useGames"
import { FaUser } from "react-icons/fa"
import { GiAbstract042, GiAmphora, GiGoat } from "react-icons/gi"
import { MdDashboard } from "react-icons/md"
import { artifactsTheme } from "./artifacts"
import { accountTheme } from "./accounts"
import { gamesTheme } from "./games"

export const dashbaordTheme = {
  backgroundColor: '#78c9ab',
  primaryColor: '#96a1f7',
  textColor: '#000000',
}

export default () => {
  const { artifacts } = useArtifacts({ total: true })
  const { accounts } = useAccounts({ total: true })
  const { games } = useGames({ total: true })

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
      <div className='flex flex-wrap'>
        <GoatStats /> 
        <DashInfo title={<><GiAmphora className='mr-2'/>Artifacts</>} count={artifacts} url='/artifacts' theme={artifactsTheme} />
        <DashInfo title={<><GiAbstract042 className='text-sm mr-2'/>Games played</>} count={games} url='/games' theme={gamesTheme} />
        <DashInfo title={<><FaUser className='text-sm mr-2'/>Accounts</>} count={accounts} url='/accounts' theme={accountTheme} />
      </div>
    </Layout>
  )
}