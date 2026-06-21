/**
 * surprise-tower-of-babel
 *
 * The user clicks the wrong thing and the entire app transmogrifies into
 * Sumerian cuneiform glyphs while statues rise from below and a Bronze-Age
 * song plays. Then it fades back to normal.
 *
 * Vanilla DOM, framework-agnostic. React wrapper lives in ./react.
 */

const BABEL_CLASS = 'babel-glyphs'
const BABEL_SCRIPT_CLASSES = {
  cuneiform: 'babel-cuneiform',
  egyptian: 'babel-egyptian',
}

const CUNEIFORM_RANGES = [
  { start: 0x12000, end: 0x123ff },
  { start: 0x12400, end: 0x1247f },
  { start: 0x12480, end: 0x1254f },
]

const EGYPTIAN_RANGES = [
  { start: 0x13000, end: 0x1342f },
]

const IGNORE_TAGS = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEXTAREA'])

const buildGlyphSet = (ranges) => {
  const glyphs = []
  ranges.forEach(({ start, end }) => {
    for (let cp = start; cp <= end; cp += 1) glyphs.push(String.fromCodePoint(cp))
  })
  return glyphs
}

const GLYPH_SETS = {
  cuneiform: buildGlyphSet(CUNEIFORM_RANGES),
  egyptian: buildGlyphSet(EGYPTIAN_RANGES),
}

const state = {
  active: false,
  observer: null,
  cache: new WeakMap(),
  script: null,
  glyphs: null,
  audio: null,
  audioHandlers: null,
  overlay: null,
  overlayTimeout: null,
  overlayStyleTag: null,
  options: null,
}

const toGlyphs = (text, glyphs, script) => {
  if (!text) return text
  let count = 0
  return text.replace(/[A-Za-z0-9]/g, (ch) => {
    // Cuneiform: hide 3 chars, convert the 4th — denser glyphs are unreadable.
    const replace = script !== 'cuneiform' || count % 4 === 3
    count += 1
    if (!replace) return ''
    const idx = ch.codePointAt(0) % glyphs.length
    return glyphs[idx]
  })
}

const shouldIgnoreNode = (node) => {
  const parent = node.parentElement
  if (!parent) return false
  if (IGNORE_TAGS.has(parent.tagName)) return true
  if (parent.isContentEditable) return true
  if (parent.closest && parent.closest('[data-babel-ignore]')) return true
  return false
}

const getTextNodes = (root) => {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode: (node) => (shouldIgnoreNode(node) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT),
  })
  const nodes = []
  while (walker.nextNode()) nodes.push(walker.currentNode)
  return nodes
}

const applyToRoot = (root) => {
  getTextNodes(root).forEach((node) => {
    if (!state.cache.has(node)) state.cache.set(node, node.nodeValue)
    node.nodeValue = toGlyphs(state.cache.get(node), state.glyphs, state.script)
  })
}

const restoreRoot = (root) => {
  getTextNodes(root).forEach((node) => {
    if (state.cache.has(node)) node.nodeValue = state.cache.get(node)
  })
}

const pickScript = (preferred) => {
  if (preferred === 'cuneiform' || preferred === 'egyptian') return preferred
  if (preferred === 'random') return Math.random() < 0.5 ? 'cuneiform' : 'egyptian'
  return 'cuneiform'
}

const addBabelClasses = (script) => {
  document.body.classList.add(BABEL_CLASS)
  if (BABEL_SCRIPT_CLASSES[script]) document.body.classList.add(BABEL_SCRIPT_CLASSES[script])
}

const removeBabelClasses = () => {
  document.body.classList.remove(BABEL_CLASS)
  Object.values(BABEL_SCRIPT_CLASSES).forEach((c) => document.body.classList.remove(c))
}

const startObserver = (root) => {
  if (state.observer) state.observer.disconnect()
  state.observer = new MutationObserver((mutations) => {
    mutations.forEach((mut) => {
      mut.addedNodes.forEach((node) => {
        if (node.nodeType === Node.TEXT_NODE) {
          if (!state.cache.has(node)) state.cache.set(node, node.nodeValue)
          node.nodeValue = toGlyphs(state.cache.get(node), state.glyphs, state.script)
          return
        }
        if (node.nodeType === Node.ELEMENT_NODE) applyToRoot(node)
      })
    })
  })
  state.observer.observe(root, { childList: true, subtree: true })
}

const resolveRootNode = (root) => {
  if (root && root.nodeType) return root
  if (typeof document === 'undefined') return null
  return document.body || document.documentElement || null
}

const OVERLAY_CSS = `
.babel-overlay {
  position: fixed; inset: 0; pointer-events: none; z-index: 9999;
  overflow: hidden; opacity: 1; transition: opacity 3s ease;
}
.babel-overlay--fade { opacity: 0; }
.babel-center {
  position: absolute; inset: 0; display: grid; place-items: center; pointer-events: none;
}
.babel-center img { width: min(72vw, 720px); height: auto; display: block; }
.babel-center--bg { z-index: 0; }
.babel-center--fg { z-index: 1; }
.babel-fade-in { opacity: 0; animation: babel-fade-in 1.6s ease-out forwards; }
.babel-message {
  position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%);
  max-width: min(80vw, 640px); padding: 12px 16px; background: #000; color: #fff;
  font-size: 18px; font-family: "Courier New", Courier, monospace; line-height: 1.35;
  text-align: center; z-index: 3; box-shadow: 0 10px 24px rgba(0,0,0,0.35);
}
.babel-message__glyphs {
  display: inline-block; margin-left: 6px; letter-spacing: 0.04em;
  -webkit-mask-image: linear-gradient(90deg, #000 0%, #000 75%, transparent 100%);
  mask-image: linear-gradient(90deg, #000 0%, #000 75%, transparent 100%);
}
.babel-statue-group { position: absolute; inset: 0; pointer-events: none; }
.babel-statue {
  position: absolute; bottom: -10vh; --flip: 1; --x: 0%; z-index: 2;
  transform: translate(var(--x), 100%) scaleX(var(--flip));
  animation: babel-rise 1.4s ease-out forwards, babel-bob 1.6s ease-in-out 1.4s infinite;
  filter: drop-shadow(0 6px 12px rgba(0,0,0,0.35));
}
.babel-statue--big { width: min(26vw, 220px); left: 50%; --x: -50%; --flip: -1; bottom: -14vh; }
.babel-statue--peek { width: min(22vw, 190px); left: 32%; animation-delay: 0.2s, 1.6s; }
.babel-statue--small1 { width: min(17vw, 140px); left: 56%; animation-delay: 0.4s, 1.8s; }
.babel-statue--small2 { width: min(14vw, 115px); left: 44%; animation-delay: 0.6s, 2s; }
.babel-statue--small3 { width: min(18vw, 150px); left: 70%; animation-delay: 0.8s, 2.2s; }
.babel-statue--small4 { width: min(13vw, 105px); left: 14%; animation-delay: 0.3s, 1.7s; }
.babel-statue--small5 { width: min(16vw, 135px); left: 26%; animation-delay: 0.5s, 1.9s; }
.babel-statue--small6 { width: min(12vw, 100px); left: 6%; animation-delay: 0.7s, 2.1s; }
.babel-statue--small7 { width: min(17vw, 145px); left: 80%; animation-delay: 0.45s, 1.85s; }
.babel-statue--small8 { width: min(13vw, 110px); left: 90%; animation-delay: 0.65s, 2.05s; }
.babel-statue--flip { --flip: -1; }
@keyframes babel-rise {
  from { transform: translate(var(--x), 100%) scaleX(var(--flip)); opacity: 1; }
  to { transform: translate(var(--x), 0%) scaleX(var(--flip)); opacity: 1; }
}
@keyframes babel-bob {
  0% { transform: translate(var(--x), 0%) scaleX(var(--flip)); }
  50% { transform: translate(var(--x), -6%) scaleX(var(--flip)); }
  100% { transform: translate(var(--x), 0%) scaleX(var(--flip)); }
}
@keyframes babel-fade-in {
  from { opacity: 0; } to { opacity: 1; }
}
`

const ensureOverlayStyles = () => {
  if (state.overlayStyleTag) return
  const style = document.createElement('style')
  style.setAttribute('data-babel-overlay', 'true')
  style.textContent = OVERLAY_CSS
  document.head.appendChild(style)
  state.overlayStyleTag = style
}

const createOverlay = (opts) => {
  if (state.overlay) return
  ensureOverlayStyles()
  const overlay = document.createElement('div')
  overlay.className = 'babel-overlay'

  const assets = opts?.assets || {}
  const bgSrc = assets.background
  const fgSrc = assets.foreground
  const statueSrcs = Array.isArray(assets.statueImages) && assets.statueImages.length
    ? assets.statueImages
    : []

  const makeCenterImage = (className, src) => {
    if (!src) return null
    const wrap = document.createElement('div')
    wrap.className = className
    const img = document.createElement('img')
    img.src = src
    img.alt = ''
    wrap.appendChild(img)
    return wrap
  }

  const statueClasses = [
    'babel-statue--big',
    'babel-statue--peek',
    'babel-statue--small1',
    'babel-statue--small2 babel-statue--flip',
    'babel-statue--small3 babel-statue--flip',
    'babel-statue--small4',
    'babel-statue--small5 babel-statue--flip',
    'babel-statue--small6',
    'babel-statue--small7',
    'babel-statue--small8 babel-statue--flip',
  ]

  const createStatueGroup = () => {
    if (statueSrcs.length === 0) return null
    const group = document.createElement('div')
    group.className = 'babel-statue-group'
    statueClasses.forEach((cls, idx) => {
      const img = document.createElement('img')
      img.src = statueSrcs[idx % statueSrcs.length]
      img.alt = ''
      img.className = `babel-statue ${cls}`
      group.appendChild(img)
    })
    return group
  }

  const messageEl = document.createElement('div')
  messageEl.className = 'babel-message'
  messageEl.setAttribute('data-babel-ignore', 'true')
  const glyphs = GLYPH_SETS.cuneiform.slice(0, 24).sort(() => 0.5 - Math.random()).slice(0, 12).join('')
  const messageText = opts?.message || 'Fool! You have summoned the Tower of Babel!'
  messageEl.innerHTML = `${messageText}<br/>This app will now <span class="babel-message__glyphs">${glyphs}</span>`

  const bgEl = makeCenterImage('babel-center babel-center--bg babel-fade-in', bgSrc)
  const fgEl = makeCenterImage('babel-center babel-center--fg babel-fade-in', fgSrc)
  if (bgEl) overlay.appendChild(bgEl)
  if (fgEl) overlay.appendChild(fgEl)
  overlay.appendChild(messageEl)
  const statues = createStatueGroup()
  if (statues) overlay.appendChild(statues)

  document.body.appendChild(overlay)
  state.overlay = overlay
}

const beginOverlayFade = (durationSeconds) => {
  if (!state.overlay || state.overlay.classList.contains('babel-overlay--fade')) return
  state.overlay.classList.add('babel-overlay--fade')
  if (state.overlayTimeout) clearTimeout(state.overlayTimeout)
  state.overlayTimeout = setTimeout(removeOverlay, Math.max(0, durationSeconds * 1000))
}

const removeOverlay = () => {
  if (state.overlayTimeout) { clearTimeout(state.overlayTimeout); state.overlayTimeout = null }
  if (state.overlay && state.overlay.parentNode) state.overlay.parentNode.removeChild(state.overlay)
  state.overlay = null
}

export const enableBabel = (opts = {}) => {
  if (typeof document === 'undefined') return null
  const root = resolveRootNode(opts.root)
  if (!root) return null
  if (state.active) {
    disableBabel()
    return null
  }

  state.active = true
  state.options = opts
  state.cache = new WeakMap()
  state.script = pickScript(opts.script)
  state.glyphs = GLYPH_SETS[state.script]

  const audioUrl = opts?.assets?.audio
  if (audioUrl) {
    const audio = new Audio(audioUrl)
    audio.loop = false
    audio.volume = typeof opts.volume === 'number' ? opts.volume : 1
    const fadeOutSeconds = 3
    const onTimeUpdate = () => {
      if (!audio.duration || Number.isNaN(audio.duration)) return
      const remaining = audio.duration - audio.currentTime
      if (remaining <= fadeOutSeconds) {
        audio.volume = Math.max(0, remaining / fadeOutSeconds)
        beginOverlayFade(fadeOutSeconds)
      }
    }
    const onEnded = () => { audio.volume = 0; disableBabel() }
    audio.addEventListener('timeupdate', onTimeUpdate)
    audio.addEventListener('ended', onEnded)
    state.audio = audio
    state.audioHandlers = { onTimeUpdate, onEnded }
    audio.play().catch(() => {})
  } else if (typeof opts.durationMs === 'number' && opts.durationMs > 0) {
    // No audio — auto-disable after a fixed duration.
    setTimeout(() => {
      beginOverlayFade(3)
      setTimeout(disableBabel, 3000)
    }, opts.durationMs)
  }

  createOverlay(opts)
  addBabelClasses(state.script)
  applyToRoot(root)
  startObserver(root)
  return state.script
}

export const disableBabel = () => {
  if (typeof document === 'undefined') return
  const root = resolveRootNode(state.options?.root)
  if (root) restoreRoot(root)
  removeBabelClasses()
  if (state.observer) { state.observer.disconnect(); state.observer = null }
  if (state.audio) {
    if (state.audioHandlers) {
      state.audio.removeEventListener('timeupdate', state.audioHandlers.onTimeUpdate)
      state.audio.removeEventListener('ended', state.audioHandlers.onEnded)
      state.audioHandlers = null
    }
    state.audio.pause()
    state.audio.currentTime = 0
    state.audio = null
  }
  removeOverlay()
  state.active = false
  state.script = null
  state.glyphs = null
  state.cache = new WeakMap()
  state.options = null
}

export const isBabelActive = () => state.active

export const getBabelScriptLabel = (script) => {
  if (script === 'cuneiform') return 'Cuneiform'
  if (script === 'egyptian') return 'Egyptian'
  return ''
}
