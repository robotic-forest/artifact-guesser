// Crawler-facing artifact image passthrough.
//
// Some museum CDNs (British Museum, The Walters) block server-side / datacenter
// fetches at the Cloudflare level. So when a crawler or social unfurler (Google,
// Discord, Twitter, iMessage) fetches an og:image that hotlinks those CDNs it
// gets a 403 / refused connection, the share+search card renders blank, and the
// VisualArtwork rich result is rejected. We can't fetch those CDNs directly from
// Vercel either (same block), but images.weserv.nl (an established image proxy)
// can, so we route through it and re-serve from our own domain with a long
// immutable cache. The in-browser <img> on the artifact page still hotlinks the
// CDN directly (works in a real browser); this route is only for the crawler-
// facing meta image.

// Allowlist of the corpus's museum image hosts, so this isn't an open proxy.
const ALLOWED_HOSTS = [
  'images.metmuseum.org',
  'media.britishmuseum.org',
  'art.thewalters.org',
  'openaccess-cdn.clevelandart.org',
  'www.artic.edu',
  'ids.si.edu',
  'media.getty.edu',
  'isac-idb-static.uchicago.edu',
  'coleccion.museolarco.org',
  'colecciones.precolombino.cl',
]

const isAllowed = (hostname) =>
  ALLOWED_HOSTS.some((h) => hostname === h || hostname.endsWith('.' + h))

export default async function handler(req, res) {
  const { url } = req.query
  if (!url || typeof url !== 'string') return res.status(400).end('Missing url')

  let target
  try {
    target = new URL(url)
  } catch {
    return res.status(400).end('Bad url')
  }
  if (!/^https?:$/.test(target.protocol) || !isAllowed(target.hostname)) {
    return res.status(400).end('Host not allowed')
  }

  // weserv wants the source URL without its scheme, URL-encoded.
  const weserv = `https://images.weserv.nl/?url=${encodeURIComponent(url.replace(/^https?:\/\//, ''))}`

  try {
    const upstream = await fetch(weserv, { headers: { 'User-Agent': 'artifactguesser.com image passthrough' } })
    if (!upstream.ok) throw new Error(`weserv ${upstream.status}`)
    const buf = Buffer.from(await upstream.arrayBuffer())
    res.setHeader('Content-Type', upstream.headers.get('content-type') || 'image/jpeg')
    res.setHeader('Cache-Control', 'public, max-age=31536000, s-maxage=31536000, immutable')
    return res.status(200).send(buf)
  } catch {
    // Last resort: let the client try the original CDN directly (fine in browsers).
    return res.redirect(302, url)
  }
}
