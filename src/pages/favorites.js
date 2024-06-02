import { Layout } from "@/components/layout/Layout"
import { ArtifactsList } from "@/components/list/ArtifactList"
import { FaHeart } from "react-icons/fa"
import { artifactsTheme } from "./artifacts"

export default () => {

  return (
    <Layout title='Artifacts List' theme={artifactsTheme}>
      <ArtifactsList
        title={(
          <div className='flex items-center font-bold'>
            <FaHeart color='#ff4f4f' css={{
              marginRight: 8,
              '@media (max-width: 600px)': { marginLeft: 32 },
            }} />
            Favorite Artifacts
          </div>
        )}
        minimal
        searchFields={[
          { label: 'Name', value: 'name' },
          { label: 'Country', value: 'location.country' },
        ]}
        isFavorites
      />
    </Layout>
  )
}