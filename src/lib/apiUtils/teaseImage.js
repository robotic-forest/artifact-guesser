import axios from "axios"
import { stripUnrenderableImages } from "./artifactImages"

// CDNs that block server HEADs but serve images fine to browsers / @vercel/og.
const TRUSTED_DOMAINS = [
  'media.britishmuseum.org',
  'art.thewalters.org',
]

export const isImageOk = async (url) => {
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
 * Sample a random highlight artifact and return a probed-OK image URL.
 * Returns '' if nothing usable was found.
 */
export const pickProbedTease = async (db, { tries = 8, perArtifact = 3 } = {}) => {
  for (let i = 0; i < tries; i++) {
    const [artifact] = await db.collection('artifacts').aggregate([
      { $match: { isHighlight: true, problematic: { $ne: true } } },
      { $sample: { size: 1 } },
    ]).toArray()
    if (!artifact) continue
    stripUnrenderableImages(artifact)
    const imgs = (artifact?.images?.external || []).sort(() => Math.random() - 0.5)
    for (const img of imgs.slice(0, perArtifact)) {
      if (await isImageOk(img)) return img
    }
  }
  return ''
}
