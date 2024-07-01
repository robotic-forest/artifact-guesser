import { initDB } from "@/lib/apiUtils/mongodb"
import { paginationAggregation } from "@/lib/apiUtils/paginationAggregation"
import { ObjectId } from "mongodb"

const artifacts = async (req, res) => {
  const db = await initDB()
  const data = await paginationAggregation({
    db, collection: 'artifacts', query: req.query,
    buildCriteria: buildArtifactCriteria
  })
  res.send(data)
}

export const buildArtifactCriteria = {
  // Time stuff!
  'startDateAfter': item => ({ 'time.start': { $gte: Number(item) } }),
  'startDateBefore': item => ({ 'time.start': { $lte: Number(item) } }),
  'endDateAfter': item => ({ 'time.end': { $gte: Number(item) } }),
  'endDateBefore': item => ({ 'time.end': { $lte: Number(item) } }),
   // Exclude self from relatedArtifacts in Artifact View
  'excludeId': item => ({ '_id': { $ne: new ObjectId(item) } }),
}

export default artifacts