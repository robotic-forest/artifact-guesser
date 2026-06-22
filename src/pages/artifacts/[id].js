import { Artifact } from "@/components/artifacts/Artifact"
import { Layout } from "@/components/layout/Layout"
import { useArtifact } from "@/hooks/artifacts/useArtifact"
import { artifactsTheme } from "."
import { initDB } from "@/lib/apiUtils/mongodb"
import { ObjectId } from "mongodb"
import { stripUnrenderableImages } from "@/lib/apiUtils/artifactImages"
import { buildArtifactSeo } from "@/lib/apiUtils/artifactSeo"
import Head from "next/head"

export default function ArtifactPage({ og, previousRoute }) {
  const artifact = useArtifact()

  return (
    <>
      {og && (
        <Head>
          {/* Title is set via the Layout below so it wins next/head's dedupe
              (Layout renders its <title> after this Head). */}
          <meta key="description" name="description" content={og.description} />
          <link key="canonical" rel="canonical" href={og.url} />
          <meta key="ogTitle" property="og:title" content={og.title} />
          <meta key="ogDescription" property="og:description" content={og.description} />
          <meta key="ogUrl" property="og:url" content={og.url} />
          <meta key="ogType" property="og:type" content="website" />
          {og.image && <meta key="ogImage" property="og:image" content={og.image} />}
          <meta key="twCard" name="twitter:card" content="summary_large_image" />
          <meta key="twTitle" name="twitter:title" content={og.title} />
          <meta key="twDescription" name="twitter:description" content={og.description} />
          {og.image && <meta key="twImage" name="twitter:image" content={og.image} />}
          {og.jsonLd && (
            <script
              key="ld-artwork"
              type="application/ld+json"
              dangerouslySetInnerHTML={{ __html: JSON.stringify(og.jsonLd).replace(/</g, '\\u003c') }}
            />
          )}
        </Head>
      )}
      <Layout title={og?.title || artifact?.name} theme={artifactsTheme} contentCSS={{ fontFamily: 'monospace', padding: 0 }}>
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
      og = buildArtifactSeo(artifact, baseUrl, id)
    }
  } catch {}

  return { props: { og } }
}
