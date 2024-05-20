import { getRandomArtifact } from "@/lib/apiUtils/artifacts"

const randomArtifact = async (req, res) => {
  const artifact = await getRandomArtifact()
  res.send(artifact)
}

export default randomArtifact