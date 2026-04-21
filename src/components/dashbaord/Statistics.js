import { DashInfo } from "@/components/info/DashInfo"
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
import { Analytics } from "./Analytics"
import { AccountInsights } from "./AccountInsights"
import { ArtifactInsights } from "./ArtifactInsights"
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
        <Analytics />
        <Games />
        {/* <Behistun /> */}
        {/* <Notes /> */}
      </div>
      <div>
        <DashInfo
          title={<><FaUser className='text-xs mr-3'/>Accounts</>}
          count={accounts}
          url='/accounts'
          theme={accountTheme}
          actions={<AllAccountActions />}
          extraInfo={<AccountInsights />}
        />

        {/* Artifacts DashInfo remains */}
        <DashInfo
          title={<><GiAmphora className='mr-3'/>Artifacts</>}
          count={artifacts?.total}
          url='/artifacts?imageMode=true'
          theme={artifactsTheme}
          extraInfo={(
            <div className='text-xs'>
              <ArtifactCountMap className='m-1 mt-0' artifacts={artifacts?.byCountry} />
              <ArtifactInsights stats={artifacts} />
            </div>
          )}
        />
        {/* <Collosi className='flex justify-end mb-2' /> */}

      </div>
    </div>
  )
}
