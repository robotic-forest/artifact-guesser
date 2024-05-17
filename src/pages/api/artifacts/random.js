import axios from "axios"

// Met API Docs: https://metmuseum.github.io/

export default async function (req, res) {
  // as of 2024-05-15, there are 912642 objects
  const id = Math.floor(Math.random() * 912642) + 1
  const payload = await recursiveFetch(id)
  
  res.status(200).json(payload)
}

const recursiveFetch = async (id) => {
  const newId = Math.floor(Math.random() * 912642) + 1

  let data
  try {
    const response = await axios.get(`https://collectionapi.metmuseum.org/public/collection/v1/objects/${id}`)

    // skip if no image
    if (!response.data.primaryImage || !response.data?.country) {
      return recursiveFetch(newId)
    }

    data = response.data
  } catch (e) { 
    // console.log(e)
    // skip 404
    return recursiveFetch(newId)
  }

  return { data, id }
}

const hasArea = o => o.city || o.river || o.state || o.subregion || o.region || o.country