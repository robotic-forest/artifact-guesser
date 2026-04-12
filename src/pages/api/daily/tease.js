import { initDB } from "@/lib/apiUtils/mongodb"
import { stripUnrenderableImages } from "@/lib/apiUtils/artifactImages"

/**
 * GET /api/daily/tease
 *
 * Returns a random renderable image URL from a random highlight artifact.
 * Used for the OG share card — visually enticing without revealing today's run.
 */
const tease = async (req, res) => {
  const db = await initDB()

  for (let i = 0; i < 5; i++) {
    const [artifact] = await db.collection('artifacts').aggregate([
      { $match: { isHighlight: true, problematic: { $ne: true } } },
      { $sample: { size: 1 } }
    ]).toArray()

    if (!artifact) continue
    stripUnrenderableImages(artifact)
    const imgs = artifact?.images?.external || []
    if (imgs.length > 0) {
      return res.json({ image: imgs[Math.floor(Math.random() * imgs.length)] })
    }
  }

  res.json({ image: null })
}

export default tease
