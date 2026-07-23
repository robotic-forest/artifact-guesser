import { badWords } from './badWords'

// --- Full-list, word-boundary match (mirrors the mainframe chat sanitizer) ---
// Catches standalone bad words and multi-word entries when they appear as whole
// words. Longest-first so multi-word entries win.
const buildRegex = () => {
  const patterns = badWords
    .filter((w) => typeof w === 'string' && w.trim().length > 0)
    .map((w) => w.trim())
    .sort((a, b) => b.length - a.length)
    .map((w) => {
      const escaped = w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      const startWord = /\w/.test(w[0])
      const endWord = /\w/.test(w[w.length - 1])
      return `${startWord ? '\\b' : ''}${escaped}${endWord ? '\\b' : ''}`
    })
  return patterns.length ? new RegExp(`(?:${patterns.join('|')})`, 'gi') : null
}

const BAD_WORDS_REGEX = buildRegex()

// --- Slur-root substring match (usernames only) ---
// Word boundaries let trolls evade by appending characters ("niqqa123daddy") or using
// leetspeak ("n1gg3r", "ni99er"). For usernames we additionally normalize (lowercase,
// undo common leet substitutions, strip everything but letters) and substring-match a
// curated set of n-word roots. Kept tight to avoid false positives — e.g. "Nigeria",
// "Niger", "assassin", "classic", "bassist" all pass.
const LEET_MAP = { '0': 'o', '1': 'i', '3': 'e', '4': 'a', '5': 's', '7': 't', '8': 'b', '9': 'g', '@': 'a', '$': 's', '!': 'i', '|': 'i' }

const normalizeForSlurs = (str) =>
  str
    .toLowerCase()
    .replace(/[013457890@$!|]/g, (c) => LEET_MAP[c] || '')
    .replace(/[^a-z]/g, '')

// Roots chosen so real names/words don't collide: double-g spellings only ("nigg",
// not "niga"/"nigar"), "niqq"/"nicca" (no real words), "kneeg"/"neeg"/"knigg".
const SLUR_ROOTS = ['nigg', 'niqq', 'nikka', 'nicca', 'kneeg', 'neeg', 'knigg']

// True if the string contains a filtered word / evaded slur. Used to reject usernames
// at account creation and edit.
export const containsBadWord = (str) => {
  if (!str || typeof str !== 'string') return false
  if (BAD_WORDS_REGEX) {
    BAD_WORDS_REGEX.lastIndex = 0
    if (BAD_WORDS_REGEX.test(str)) return true
  }
  const normalized = normalizeForSlurs(str)
  return SLUR_ROOTS.some((root) => normalized.includes(root))
}
