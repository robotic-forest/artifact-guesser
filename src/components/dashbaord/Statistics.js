import { DashInfo } from "@/components/info/DashInfo"
import { GoatStats } from "@/components/info/GoatCounter"
import { useAccounts } from "@/hooks/accounts/useAccounts"
import { useArtifacts } from "@/hooks/artifacts/useArtifacts"
import { useGames } from "@/hooks/games/useGames"
import { FaUser } from "react-icons/fa"
import { GiAbstract034, GiAmphora } from "react-icons/gi"
import { AllAccountActions } from "@/components/dashbaord/AllAcountActions"
import { MasonryLayout } from "@/components/layout/MasonryLayout"
import useSWR from "swr"
import Link from "next/link"
import { IconButton } from "@/components/buttons/IconButton"
import { IoMdEye } from "react-icons/io"
import { gamesTheme } from "@/pages/games"
import { accountTheme } from "@/pages/accounts"
import { artifactsTheme } from "@/pages/artifacts"
import { ArtifactCountMap } from "./ArtifactCountMap"
import { Behistun } from "./Behistun"
import { Notes } from "./Notes"

export const Statistics = () => {
  const { artifacts } = useArtifacts({ total: true })
  const { accounts } = useAccounts({ total: true })
  const { games } = useGames({ stats: true })
  const { data: stats } = useSWR('/api/platform/stats')

  return (
    <div className='grid grid-cols-1 md:gap-2 md:grid-cols-2'>
      <div>
        <GoatStats />
        <DashInfo
          title={<><FaUser className='text-xs mr-3'/>Accounts</>}
          count={accounts}
          url='/accounts'
          theme={accountTheme}
          actions={<AllAccountActions />}
        />
        <Behistun />
        <Notes />
      </div>
      <div>
        <DashInfo
          title={<><GiAbstract034 className='text-sm mr-3'/>Games played</>}
          count={(stats?.noauthGames && games) && (games + stats?.noauthGames)}
          extraInfo={(
            <div className='p-3 text-sm'>
              <span className='mr-2'><span className='opacity-60 mr-1'>Auth</span> {games}</span>
              <span className='opacity-60 mr-1'>Anon</span> {stats?.noauthGames}
            </div>
          )}
          url='/games?__sortfield=startedAt&__sortdirection=-1'
          theme={gamesTheme}
        />
        <DashInfo
          title={<><GiAmphora className='mr-3'/>Artifacts</>}
          count={artifacts?.total}
          url='/artifacts?imageMode=true'
          theme={artifactsTheme}
          extraInfo={(
            <div className='mt-1 text-xs'>
              <div className='flex items-center pt-3 pb-1 px-2'>
                <span className='opacity-60 mr-2'>Problem</span> {artifacts?.problematic}
                <Link href='/artifacts?problematic=true' className='ml-2.5'>
                  <IconButton size={20} tooltipPlace='right'>
                    <IoMdEye />
                  </IconButton>
                </Link>
              </div>
              <ArtifactCountMap className='m-1' artifacts={artifacts?.byCountry} />
            </div>
          )}
        />
      </div>
    </div>
  )
}