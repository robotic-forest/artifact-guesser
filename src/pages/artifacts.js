import { Layout } from "@/components/layout/Layout"
import { ResumeGameButton } from "@/components/layout/components/ResumeGameButton"
import { ArtifactsList } from "@/components/list/ArtifactList"
import useUser from "@/hooks/useUser"
import { GiAmphora } from "react-icons/gi"

export const artifactsTheme =  {
  backgroundColor: '#dfbf9e',
  primaryColor: '#91c3cb',
  textColor: '#000000',
}

export default () => {
  const { isAdmin } = useUser()

  return (
    <Layout title='Artifacts List' theme={artifactsTheme}>
      <ArtifactsList
        title={(
          <div className='flex items-center font-bold'>
            {!isAdmin && <ResumeGameButton />}
            <GiAmphora css={{ marginRight: 8, marginLeft: !isAdmin ? 8 : 0 }} />
            Artifacts
          </div>
        )}
        minimal
        searchFields={[
          { label: 'Name', value: 'name' },
          { label: 'Country', value: 'location.country' },
        ]}
      />
    </Layout>
  )
}