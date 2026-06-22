import { initDB } from "@/lib/apiUtils/mongodb"

const BASE = 'https://artifactguesser.com'
const STATIC = [
  { loc: '/', changefreq: 'daily', priority: '1.0' },
  { loc: '/daily', changefreq: 'daily', priority: '0.9' },
  { loc: '/artifacts', changefreq: 'weekly', priority: '0.7' },
  { loc: '/multiplayer', changefreq: 'weekly', priority: '0.6' },
  { loc: '/about', changefreq: 'monthly', priority: '0.5' },
]

export const getServerSideProps = async ({ res }) => {
  const db = await initDB()
  const ids = await db.collection('artifacts')
    .find({ quality_score: { $gte: 6 } }, { projection: { _id: 1 } })
    .toArray()

  const urls = [
    ...STATIC.map((s) =>
      `<url><loc>${BASE}${s.loc}</loc><changefreq>${s.changefreq}</changefreq><priority>${s.priority}</priority></url>`),
    ...ids.map((a) =>
      `<url><loc>${BASE}/artifacts/${a._id}</loc><changefreq>monthly</changefreq><priority>0.6</priority></url>`),
  ].join('')

  const xml = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`

  // Cache hard at the edge - this is a heavy query, regen once a day
  res.setHeader('Content-Type', 'application/xml')
  res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=43200')
  res.write(xml)
  res.end()
  return { props: {} }
}

export default function Sitemap() { return null }
