import { Layout } from "@/components/layout/Layout"
import { ArtifactsList } from "@/components/artifacts/list/ArtifactList"
import useUser from "@/hooks/useUser"
import { GiAmphora } from "react-icons/gi"

export const artifactsTheme =  {
  backgroundColor: '#dfbf9e',
  primaryColor: '#91c3cb',
  textColor: '#000000',
}

export default () => {
  const { user, isAdmin } = useUser()

  return (
    <Layout title='Artifacts List' theme={artifactsTheme} contentCSS={{ marginBottom: 32 }}>
      <ArtifactsList
        title={(
          <div className='flex items-center font-bold'>
            <GiAmphora css={{
              marginRight: 8,
              '@media (max-width: 600px)': { marginLeft: 32 },
              marginLeft: user?.isLoggedIn ? 0 : 32
            }} />
            Artifacts
          </div>
        )}
        minimal
        searchFields={[
          { label: 'Name', value: 'name' },
          { label: 'Country', value: 'location.country' },
          { label: 'Medium', value: 'medium' },
        ]}
        excludeFilters={isAdmin ? [] : ['problematic']}
      />
    </Layout>
  )
}