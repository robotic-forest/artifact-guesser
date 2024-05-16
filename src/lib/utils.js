import axios from "axios"

// Don't put server-side code here

export const browser = () => typeof window !== 'undefined'

export const email = async args => axios.post('/api/sendEmail', args)

export const getUser = async req => {
  const user = req.session.user ? {
    ...req.session.user,
    isLoggedIn: true,
  } : {
    isLoggedIn: false
  }

  return user
}

const googleGeoCoding = async addressLine => {
  try {
    const r = await axios.get(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURI(addressLine)}&key=${
        process.env.NEXT_PUBLIC_GOOGLE_API_KEY
      }`
    )
    console.log('Called Google geocoding API', r)
    return r.data.results[0]?.geometry?.location
  } catch (e) {
    console.log(e)
    return null
  }
}

const radarGeocoding = async addressLine => {
  try {
    console.log('Called Radar geocoding API')
    const r = await axios.get(`https://api.radar.io/v1/geocode/forward?query=${encodeURI(addressLine)}`, {
      headers: {
        'Authorization': process.env.NEXT_PUBLIC_RADAR_API_KEY
      }
    }) 

    const { latitude: lat, longitude: lng }  =  r.data.addresses[0]
    return { lat, lng }
  } catch (e) {
    console.log(e)
    return null
  }
}

// Get Geo Coordinates
export const getGeoCode = async addressLine => {
  const coords = await googleGeoCoding(addressLine)
  // const coords = await radarGeocoding(addressLine)
  return coords
}

// Sanitize ReactSelect Inputs
export const delabelize = obj => {
  if (!obj) return obj
  if (obj instanceof Array) return obj.map(o => delabelize(o))
  if (obj.value) {
    return obj.value
  }
  if (['string', 'number'].includes(typeof obj)) {
    return obj
  }

  const newObj = {}
  for (const key of Object.keys(obj)) {
    if (!obj[key]) {
      newObj[key] = obj[key]
    } else if (obj[key].value) {
      newObj[key] = obj[key].value
    } else if (obj[key] instanceof Array || obj[key] instanceof Object) {
      newObj[key] = delabelize(obj[key])
    } else {
      newObj[key] = obj[key]
    }
  }

  return newObj
}

export const isNumeric = s => /^\d+$/.test(s)