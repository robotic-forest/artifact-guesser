import { Layout } from "@/components/layout/Layout"
import { ArtifactsList } from "@/components/list/ArtifactList"

export default () => {

  return (
    <Layout title='Artifacts List'>
      <ArtifactsList
        searchFields={[
          { label: 'Name', value: 'name' },
          { label: 'Country', value: 'location.country' },
        ]}
      />
    </Layout>
  )
}