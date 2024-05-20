import { DashInfo } from "@/components/info/DashInfo"
import { GoatStats } from "@/components/info/GoatCounter"
import { Layout } from "@/components/layout/Layout"
import { useAccounts } from "@/hooks/accounts/useAccounts"
import { useArtifacts } from "@/hooks/artifacts/useArtifacts"
import { FaUser } from "react-icons/fa"
import { GiAmphora, GiGoat } from "react-icons/gi"
import { MdDashboard } from "react-icons/md"

export default () => {
  const { artifacts } = useArtifacts({ total: true })
  const { accounts } = useAccounts({ total: true })

  return (
    <Layout title='Dashboard'>
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
        <DashInfo title={<><GiAmphora className='mr-2'/>Artifacts</>} count={artifacts} />
        <DashInfo title={<><FaUser className='text-sm mr-2'/>Accounts</>} count={accounts} />  
      </div>
    </Layout>
  )
}