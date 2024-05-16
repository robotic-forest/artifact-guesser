import { ObjectId } from "mongodb"
import moment from 'moment'
import { isNumeric } from "../utils"

// Utils safe to run on server side
export const serverError = (error, res) => {
  console.log(error)
  res.send({ success: false, message: error })
}

export const cleanMDB = obj => {
  if (!obj) return obj
  if (obj instanceof Array) return obj.map(o => cleanMDB(o))
  if (!(obj instanceof Object)) {
    return obj
  }

  const newObj = {}
  for (const key of Object.keys(obj)) {
    if (!obj[key]) {
      newObj[key] = obj[key]
    } else if (obj[key] instanceof Array) {
      newObj[key] = cleanMDB(obj[key])
    } else if (typeof obj[key].toString === 'function' && ObjectId.isValid(obj[key].toString())) {
      newObj[key] = obj[key].toString()
    } else if (obj[key] instanceof Date) {
      newObj[key] = moment(obj[key]).toISOString()
    } else if (obj[key] instanceof Object) {
      newObj[key] = cleanMDB(obj[key])
    } else {
      newObj[key] = obj[key]
    }
  }

  return newObj
}

const iso8601Regex = /^(\d{4}-\d{2}-\d{2}|\d{4}-\d{2}-\d{2}T\d{2}:\d{2}|\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}|\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,6})?)([+-]\d{2}:\d{2}|Z)?$/

// turn string dates into date objects
// convert id strings to Object Ids
// resolve arrays of values to $in
export const processCriteria = obj => {
  if (!obj) return obj
  if (obj instanceof Array) return obj.map(o => processCriteria(o))
  if (!(obj instanceof Object)) {
    return obj
  }

  const newObj = {}
  for (const key of Object.keys(obj)) {
    if (!obj[key]) {
      newObj[key] = obj[key]
    } else if (obj[key] instanceof Array) {
      // if any items in the array are objects, we assume and $and or $or and continue recursively
      // otherwise we assume it is an array of values to match
      if (obj[key].some(item => item instanceof Object)) {
        newObj[key] = processCriteria(obj[key])
      } else if (['$nin', '$in'].includes(key)) {
        newObj[key] = obj[key]
      } else {
        // if its just an arbitrary key holding an array, assume $in
        // but not if key is coordinates, as that is a special case
        if (key === 'coordinates') newObj[key] = obj[key]
        else newObj[key] = { $in: obj[key] }
      }
    } else if (key === '_id') {
      if (typeof obj[key] === 'string') {
        newObj[key] = ObjectId(obj[key])
      } else if (obj[key].$in) { // check if it is an array of $in
        newObj[key] = {
          $in: obj[key].$in.map(id => ObjectId(id))
        }
      } else { // assume it is an array of $nin
        newObj[key] = {
          $nin: obj[key].$nin?.map(id => ObjectId(id)) || []
        }
      }
    } else if (typeof obj[key] === 'string') {

      // Format dates nicely
      if (/^[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])$/.test(obj[key])) {
        newObj[key] = moment(obj[key], 'YYYY-MM-DD').toDate()
      }

      // check if is ISO date
      else if (iso8601Regex.test(obj[key]) && moment(obj[key], moment.ISO_8601, true).isValid()) {
        newObj[key] = moment(obj[key]).toDate()
      }

      // if it should be a number, make it a number, unless its in a regex
      else if (isNumeric(obj[key]) && key !== '$regex') {
        newObj[key] = parseFloat(obj[key])
      }

      else newObj[key] = obj[key]

    } else if (obj[key] instanceof Object && obj[key].$options && !obj[key].$regex) {
      // do nuffin
    } else if (obj[key] instanceof Object && !(obj[key].$options && !obj[key].$regex)) {
      // process objects if they are not empty search strings
      newObj[key] = processCriteria(obj[key])
    } else {
      newObj[key] = obj[key]
    }
  }

  return newObj
}
