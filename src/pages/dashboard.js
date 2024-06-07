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
import { ArtefactMap } from "@/components/gameui/Map"
import { useState } from "react"
import { Button } from "@/components/buttons/Button"
import Link from "next/link"
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
    <Layout title='Dashboard' theme={dashbaordTheme} contentCSS={{ fontFamily: 'monospace' }}>
      <div className='mb-3 flex items-center' css={{
         '@media (max-width: 600px)': { marginLeft: 32 },
      }}>
        <MdDashboard className='mr-2'/>
        Dashbaord
      </div>
      <MasonryLayout breaks={{ 600: 1, default: 2 }}>
        <GoatStats /> 
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
          title={<><FaUser className='text-xs mr-3'/>Accounts</>}
          count={accounts}
          url='/accounts'
          theme={accountTheme}
          actions={<AllAccountActions />}
        />
        <DashInfo
          title={<><GiAmphora className='mr-3'/>Artifacts</>}
          count={artifacts?.total}
          url='/artifacts'
          theme={artifactsTheme}
          extraInfo={(
            <div className='mt-1 text-sm'>
              <div className='mb-1 p-3 px-2'>
                <Link href='/artifacts?problematic=true'>
                  <Button variant='outlined'>
                    <span className='opacity-60 mr-2'>Problem</span> {artifacts?.problematic}
                  </Button>
                </Link>
              </div>
              <ArtifactCountMap className='m-1' artifacts={artifacts?.byCountry} />
            </div>
          )}
        />
      </MasonryLayout>
    </Layout>
  )
}

export const ArtifactCountMap = ({ artifacts, className }) => {
  const [hover, setHover] = useState(null)

  // TODO: resolve artifact country names,
  // these numbers arent quite right

  return (
    <div className={className} css={{
      border: '1.5px inset',
      borderColor: '#00000055 #ffffff77 #ffffff77 #00000055',
      height: 'min-content'
    }}>
      <div className='h-full w-full overflow-hidden bg-[#8bb9f1] relative'>
        <ArtefactMap artifacts={artifacts} setHover={setHover} onClick={(name) => {
          window.open(`/artifacts?location.country=${name}`, '_blank')
        }} />
        {hover && (
          <div className='absolute p-[0px_4px] bg-[#000000dd] text-white' css={{
            bottom: 2,
            right: 2,
            // transform: 'translate(-50%, -100%)',
            zIndex: 1,
            whiteSpace: 'nowrap',
            fontSize: '0.8em'
          }}>
            {hover.name}: {hover.count}
          </div>
        )}
      </div>
    </div>
  )
}