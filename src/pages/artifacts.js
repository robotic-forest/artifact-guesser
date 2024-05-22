import { Layout } from "@/components/layout/Layout"
import { ArtifactsList } from "@/components/list/ArtifactList"

export const artifactsTheme =  {
  backgroundColor: '#dfbf9e',
  primaryColor: '#91c3cb',
  textColor: '#000000',
}

export default () => {
  return (
    <Layout title='Artifacts List' theme={artifactsTheme}>
      <ArtifactsList
        minimal
        searchFields={[
          { label: 'Name', value: 'name' },
          { label: 'Country', value: 'location.country' },
        ]}
      />
    </Layout>
  )
}