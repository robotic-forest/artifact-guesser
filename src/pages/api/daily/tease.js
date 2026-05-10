import { initDB } from "@/lib/apiUtils/mongodb"
import { stripUnrenderableImages } from "@/lib/apiUtils/artifactImages"
import axios from "axios"

// Domains that block server-side HEAD probes but serve images fine to
// browsers and to @vercel/og's edge fetcher.
const TRUSTED_DOMAINS = [
  'media.britishmuseum.org',
  'art.thewalters.org',
]

// HEAD-probe an image URL. Return true iff we get a 2xx with an image/*
// content-type. Met / Cleveland occasionally return HTML error pages with
// 200 status — those are ORB-blocked in the browser and render as a
// black panel in the OG card, so we filter them out here.
const isImageOk = async (url) => {
  try {
    const hostname = new URL(url).hostname
    if (TRUSTED_DOMAINS.some(d => hostname.includes(d))) return true
    const res = await axios.head(url, {
      timeout: 4000,
      validateStatus: () => true,
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; ArtifactGuesser/1.0)' },
    })
    if (res.status < 200 || res.status >= 400) return false
    const ct = String(res.headers['content-type'] || '').toLowerCase()
    return ct.startsWith('image/')
  } catch {
    return false
  }
}

/**
 * GET /api/daily/tease
 *
 * Returns a random renderable image URL from a random highlight artifact.
 * Used for the OG share card — visually enticing without revealing today's run.
 * HEAD-probes the URL so we never return one the browser/edge will fail on.
 */
const tease = async (req, res) => {
  const db = await initDB()

  for (let i = 0; i < 8; i++) {
    const [artifact] = await db.collection('artifacts').aggregate([
      { $match: { isHighlight: true, problematic: { $ne: true } } },
      { $sample: { size: 1 } }
    ]).toArray()

    if (!artifact) continue
    stripUnrenderableImages(artifact)
    const imgs = artifact?.images?.external || []
    if (imgs.length === 0) continue

    // Shuffle + probe; first OK image wins.
    const shuffled = [...imgs].sort(() => Math.random() - 0.5)
    for (const img of shuffled.slice(0, 3)) {
      if (await isImageOk(img)) return res.json({ image: img })
    }
  }

  res.json({ image: null })
}

export default tease
