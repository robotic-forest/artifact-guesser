import axios from "axios"

// Met API Docs: https://metmuseum.github.io/
export default async function (req, res) {
  const response = await axios.get(`https://collectionapi.metmuseum.org/public/collection/v1/objects/${req.query.id}`)
  res.status(200).json({ data: response.data, id: req.query.id })
}