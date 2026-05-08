import axios from 'axios'

/**
 * Client-side analytics tracker.
 *
 * Generates a persistent anonymous ID and a per-session ID.
 * Captures UTM params from the URL on first load.
 * Provides a simple `track(type, data)` function for recording events.
 */

let anonymousId = null
let sessionId = null
let utmParams = {}

const initIds = () => {
  if (typeof window === 'undefined') return

  // Persistent anonymous ID
  if (!anonymousId) {
    anonymousId = localStorage.getItem('ag_anon_id')
    if (!anonymousId) {
      anonymousId = crypto.randomUUID()
      localStorage.setItem('ag_anon_id', anonymousId)
    }
  }

  // Per-session ID
  if (!sessionId) {
    sessionId = sessionStorage.getItem('ag_session_id')
    if (!sessionId) {
      sessionId = crypto.randomUUID()
      sessionStorage.setItem('ag_session_id', sessionId)
    }
  }

  // Capture UTM params once per session
  if (!utmParams.captured) {
    const params = new URLSearchParams(window.location.search)
    utmParams = {
      captured: true,
      utmSource: params.get('utm_source') || null,
      utmMedium: params.get('utm_medium') || null,
      utmCampaign: params.get('utm_campaign') || null
    }
  }
}

/**
 * Track an analytics event.
 *
 * @param {string} type - Event type (e.g. 'pageview', 'game_started', 'daily_run_completed')
 * @param {object} data - Additional event data (gameId, score, round, etc.)
 */
export const track = (type, data = {}) => {
  if (typeof window === 'undefined') return
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') return

  initIds()

  const event = {
    type,
    path: window.location.pathname,
    referrer: document.referrer || null,
    anonymousId,
    sessionId,
    ...utmParams,
    ...data
  }

  // Delete internal flag
  delete event.captured

  // Fire and forget — don't block UI
  axios.post('/api/analytics/event', event).catch(err => {
    console.warn('[analytics] Failed to track event:', err.message)
  })
}

// Per-session pageview dedup: don't double-record the same path within a session
// or refire within 5 minutes. Matches GoatCounter's once-per-load semantics.
const PAGEVIEW_DEDUP_WINDOW_MS = 5 * 60 * 1000
const lastPageviewByPath = new Map()

/**
 * Track a pageview. Call this on route changes.
 */
export const trackPageview = () => {
  if (typeof window === 'undefined') return
  const path = window.location.pathname
  const now = Date.now()
  const last = lastPageviewByPath.get(path)
  if (last && now - last < PAGEVIEW_DEDUP_WINDOW_MS) return
  lastPageviewByPath.set(path, now)
  track('pageview')
}
