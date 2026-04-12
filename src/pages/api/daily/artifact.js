import { initDB } from "@/lib/apiUtils/mongodb"
import { ObjectId } from "mongodb"
import { stripUnrenderableImages } from "@/lib/apiUtils/artifactImages"

/**
 * GET /api/daily/artifact?id=<artifactId>
 *
 * Fetches a specific artifact by ID. Used by the daily challenge frontend
 * to load artifacts for rounds 2 and 3 (the daily challenge definition
 * stores all 3 artifact IDs, and the client requests them one at a time
 * as the player advances).
 */
const dailyArtifact = async (req, res) => {
  const { id } = req.query
  if (!id) return res.status(400).json({ error: 'Missing artifact id' })

  const db = await initDB()

  try {
    const artifact = await db.collection('artifacts').findOne({ _id: new ObjectId(id) })
    if (!artifact) return res.status(404).json({ error: 'Artifact not found' })
    res.json(stripUnrenderableImages(artifact))
  } catch (e) {
    res.status(400).json({ error: 'Invalid artifact id' })
  }
}

export default dailyArtifact
