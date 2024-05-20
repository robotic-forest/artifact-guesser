// Met API Docs: https://metmuseum.github.io/

import axios from 'axios'
import mdb from "../lib/apiUtils/mongodb.js"
const { initDB } = mdb

const getMet = async () => {
  const db = await initDB()

  const artifactsNubmer = await db.collection('artifacts').countDocuments()
  return console.log(artifactsNubmer)

  const response = await axios.get(`https://collectionapi.metmuseum.org/public/collection/v1/search?hasImages=true&q=a`)

  console.log(response.data)

  const ids = response.data.objectIDs
  const res = await axios.get(`https://collectionapi.metmuseum.org/public/collection/v1/objects/${ids[3]}`)
  console.log(res.data)
}

getMet()