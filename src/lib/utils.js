import axios from "axios"

// Don't put server-side code here

export const capitalizeFirstLetter = (string) => {
  if (!string) return string;
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export const isBrowser = () => typeof window !== 'undefined'

export const getUser = async req => {
  const user = req.session.user ? {
    ...req.session.user,
    isLoggedIn: true,
  } : {
    isLoggedIn: false
  }

  return user
}

export const uploadFiles = async (uploadProps, setProcessing) => {
  if (uploadProps.files.length > 0) {
    setProcessing && setProcessing('Uploading Files...')
    await axios.post('/api/upload', uploadProps.createFormData(), { 'content-type': 'multipart/form-data' })
  }
}

export const renderMdbFilter = (filter, filterItems) => {
  // if filter is empty Object
  if (Object.keys(filter).length === 0 && filter.constructor === Object) return {}

  const mdbFilter = {}
  for (const key of Object.keys(filter)) {
    // General keys
    if (Array.isArray(filter[key])) {
      mdbFilter[key] = { $in: filter[key] }
    }

    if (typeof filter[key] === 'string') {
      const filterItem = filterItems?.find(item => item.name === key)

      if (filterItem?.type === 'multi-select') mdbFilter[key] = filter[key].split(',')
      if (filterItem?.type === 'date') mdbFilter[key] = filter[key] // do nuthin
      if (filterItem?.type === 'year') mdbFilter[key] = filter[key] // do nuthin
      else mdbFilter[key] = { $regex: filter[key], $options: 'i' }
    }

    if (typeof filter[key] === 'boolean') {
      mdbFilter[key] = filter[key]
    }

    if (typeof filter[key] === 'object' && filter[key] !== null) {
      if (filter[key].hasOwnProperty('value')) {
        mdbFilter[key] = filter[key].value
      } else {
        mdbFilter[key] = filter[key]
      }
    }
  }

  return mdbFilter
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

export const createParams = obj => {
  const params = []
  Object.keys(obj).forEach(key => params.push(`${key}=${obj[key]}`))
  return '?' + params.join('&')
}
