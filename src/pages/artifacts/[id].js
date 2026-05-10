import { Artifact } from "@/components/artifacts/Artifact"
import { Layout } from "@/components/layout/Layout"
import { useArtifact } from "@/hooks/artifacts/useArtifact"
import { artifactsTheme } from "."
import { initDB } from "@/lib/apiUtils/mongodb"
import { ObjectId } from "mongodb"
import { stripUnrenderableImages } from "@/lib/apiUtils/artifactImages"
import { isImageOk } from "@/lib/apiUtils/teaseImage"
import Head from "next/head"

export default function ArtifactPage({ og, previousRoute }) {
  const artifact = useArtifact()

  return (
    <>
      {og && (
        <Head>
          <title>{og.title}</title>
          <meta key="description" name="description" content={og.description} />
          <meta key="ogTitle" property="og:title" content={og.title} />
          <meta key="ogDescription" property="og:description" content={og.description} />
          <meta key="ogUrl" property="og:url" content={og.url} />
          <meta key="ogType" property="og:type" content="website" />
          <meta key="ogImage" property="og:image" content={og.image} />
          <meta key="ogImageWidth" property="og:image:width" content="1200" />
          <meta key="ogImageHeight" property="og:image:height" content="630" />
          <meta key="twCard" name="twitter:card" content="summary_large_image" />
          <meta key="twTitle" name="twitter:title" content={og.title} />
          <meta key="twDescription" name="twitter:description" content={og.description} />
          <meta key="twImage" name="twitter:image" content={og.image} />
        </Head>
      )}
      <Layout title={artifact?.name} theme={artifactsTheme} contentCSS={{ fontFamily: 'monospace', padding: 0 }}>
        {artifact.artifact && <Artifact {...artifact} previousRoute={previousRoute} />}
      </Layout>
    </>
  )
}

export const getServerSideProps = async (ctx) => {
  const { id } = ctx.params
  const proto = ctx.req.headers['x-forwarded-proto'] || 'http'
  const host = ctx.req.headers['x-forwarded-host'] || ctx.req.headers.host
  const baseUrl = `${proto}://${host}`

  let og = null
  try {
    const db = await initDB()
    const artifact = await db.collection('artifacts').findOne({ _id: new ObjectId(id) })
    if (artifact) {
      stripUnrenderableImages(artifact)
      const candidates = artifact?.images?.external || []
      let img = ''
      for (const c of candidates.slice(0, 3)) {
        if (await isImageOk(c)) { img = c; break }
      }

      const name = artifact.name || 'Unknown Artifact'
      const country = artifact?.location?.country || ''
      const year = artifact?.dates?.year != null ? String(artifact.dates.year) : ''
      const source = artifact?.source?.name || ''

      const params = new URLSearchParams()
      params.set('name', name)
      if (country) params.set('country', country)
      if (year) params.set('year', year)
      if (source) params.set('source', source)
      if (img) params.set('img', img)

      const yearLabel = year ? (Number(year) < 0 ? `${Math.abs(Number(year))} BCE` : `${year} CE`) : ''
      const subtitle = [country, yearLabel].filter(Boolean).join(' · ')

      og = {
        title: subtitle ? `${name} — ${subtitle}` : name,
        description: subtitle
          ? `${name} (${subtitle}). Explore the artifact and play Artifact Guesser.`
          : `${name}. Explore the artifact and play Artifact Guesser.`,
        url: `${baseUrl}/artifacts/${id}`,
        image: `${baseUrl}/api/og/artifact?${params.toString()}`,
      }
    }
  } catch {}

  return { props: { og } }
}
