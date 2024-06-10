import { Artifact } from "@/components/artifacts/Artifact"
import { Layout } from "@/components/layout/Layout"
import { useArtifact } from "@/hooks/artifacts/useArtifact"
import { artifactsTheme } from "."

export default () => {
  const artifact = useArtifact()

  return (
    <Layout title={artifact?.name} theme={artifactsTheme} contentCSS={{ fontFamily: 'monospace', padding: 0 }}>
      {artifact.artifact && <Artifact {...artifact} />}
    </Layout>
  )
}
      