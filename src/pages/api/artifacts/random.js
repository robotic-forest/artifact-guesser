import { getRandomArtifact } from "@/lib/apiUtils/artifacts"

const randomArtifact = async (req, res) => {
  const artifact = await getRandomArtifact(req.query.mode)
  res.send(artifact)
}

export default randomArtifact