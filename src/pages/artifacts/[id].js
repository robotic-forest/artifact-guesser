import { Artifact } from "@/components/artifacts/Artifacts"
import { Layout } from "@/components/layout/Layout"
import { useArtifact } from "@/hooks/artifacts/useArtifact"
import { artifactsTheme } from "."

export default () => {
  const artifact = useArtifact()

  return (
    <Layout title={artifact?.name} theme={artifactsTheme} contentCSS={{ fontFamily: 'monospace' }}>
      <Artifact {...artifact} />
    </Layout>
  )
}
      