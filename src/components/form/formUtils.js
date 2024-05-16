export const labelize = value => {
  let newValue = Array.isArray(value) ? [] : undefined

  if (Array.isArray(value)) {
    // If array, labelize each item
    for (const v of value) {
      newValue.push(labelize(v))
    }
  } else {
    // if already labelized, or undefined
    newValue = (!value || (value?.label && value?.value))
      ? value // return original value
      : { value, label: value } // else labelize
  }

  return newValue
}