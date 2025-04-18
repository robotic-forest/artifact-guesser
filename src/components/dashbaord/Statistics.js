import { DashInfo } from "@/components/info/DashInfo"
import { GoatStats } from "@/components/info/GoatCounter"
import { useAccounts } from "@/hooks/accounts/useAccounts"
import { useArtifacts } from "@/hooks/artifacts/useArtifacts"
// useGames and GiAbstract034 moved to Games.js
import { FaUser } from "react-icons/fa"
import { GiAmphora } from "react-icons/gi" // GiAbstract034 removed
import { AllAccountActions } from "@/components/dashbaord/AllAcountActions"
// useSWR moved to Games.js for platform stats
// import Link from "next/link"
// import { IconButton } from "@/components/buttons/IconButton"
// import { IoMdEye } from "react-icons/io"
// gamesTheme moved to Games.js
import { accountTheme } from "@/pages/accounts"
import { artifactsTheme } from "@/pages/artifacts"
import { ArtifactCountMap } from "./ArtifactCountMap"
import { Behistun } from "./Behistun"
// import { Notes } from "./Notes" // Notes component seems unused, commenting out
import { Collosi } from "./Collosi"
// modes and Dropdown moved to Games.js
import { Games } from "./Games/Games" // Updated import path

// adjustLightness helper function moved to Games/utils.js

export const Statistics = () => {
  // Hooks for artifacts and accounts remain
  const { artifacts } = useArtifacts({ stats: true })
  const { accounts } = useAccounts({ stats: true })
  // Hooks for games and platform stats moved to Games.js

  // Mode data processing moved to Games.js

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
        {/* <Notes /> */}
      </div>
      <div>
        {/* Replace the old DashInfo with the new Games component */}
        <Games />

        {/* Artifacts DashInfo remains */}
        <DashInfo
          title={<><GiAmphora className='mr-3'/>Artifacts</>}
          count={artifacts?.total}
          url='/artifacts?imageMode=true'
          theme={artifactsTheme}
          extraInfo={(
            <div className='text-xs'>
              {/* <div className='flex items-center pt-3 pb-1 px-2'>
                <span className='opacity-60 mr-2'>Problem</span> {artifacts?.problematic}
                <Link href='/artifacts?problematic=true' className='ml-2.5'>
                  <IconButton size={20} tooltipPlace='right'>
                    <IoMdEye />
                  </IconButton>
                </Link>
              </div> */}
              <ArtifactCountMap className='m-1 mt-0' artifacts={artifacts?.byCountry} />
            </div>
          )}
        />
        {/* <Collosi className='flex justify-end mb-2' /> */}

      </div>
    </div>
  )
}
