// Small seeded PRNG so world generation is reproducible from a seed string.
//
// The world endpoint hands protocodex a ziggurat for a given seed. Two visits
// to the same seed should agree on structure (which wings, which axes, in what
// order) even though the artifacts themselves come from $sample and aren't
// reproducible without caching the result.

// xmur3 string hash -> 32-bit seed
const xmur3 = (str) => {
  let h = 1779033703 ^ str.length
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353)
    h = (h << 13) | (h >>> 19)
  }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507)
    h = Math.imul(h ^ (h >>> 13), 3266489909)
    return (h ^= h >>> 16) >>> 0
  }
}

// mulberry32 PRNG
const mulberry32 = (a) => () => {
  a |= 0; a = (a + 0x6D2B79F5) | 0
  let t = Math.imul(a ^ (a >>> 15), 1 | a)
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}

/**
 * Returns a random() -> [0,1) function. With no seed, falls back to
 * Math.random so existing callers keep their current behaviour.
 */
export const makeRandom = (seed) => {
  if (seed === undefined || seed === null || seed === '') return Math.random
  return mulberry32(xmur3(String(seed))())
}

/** Pick one item, weighted by weightFn. */
export const pickWeightedWith = (random, items, weightFn) => {
  if (!items.length) return undefined
  const total = items.reduce((s, i) => s + weightFn(i), 0)
  if (total <= 0) return items[Math.floor(random() * items.length)]
  let roll = random() * total
  for (const item of items) {
    roll -= weightFn(item)
    if (roll <= 0) return item
  }
  return items[items.length - 1]
}

/** Fisher-Yates using the supplied random source. Returns a new array. */
export const shuffleWith = (random, arr) => {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}
