// Artifact-page SEO meta generation.
//
// Ported verbatim from the approved SEO preview reference (ptcx.is/ag-seo) — the
// visually sanity-checked logic for standalone artifact catalog-entry titles and
// descriptions. If either side changes, keep them in sync.
//
// No game branding here: an artifact page reads like a museum/collection result
// (title, origin, date, real image, real description). No em-dashes, ever.

export const SHORT_SOURCE = {
  'Metropolitan Museum of Art, New York, NY': 'The Met',
  'The British Museum': 'British Museum',
  'Cleveland Museum of Art': 'Cleveland Museum of Art',
  'Art Institute of Chicago': 'Art Institute of Chicago',
  'The Walters Art Museum': 'The Walters',
  'Smithsonian': 'Smithsonian',
  'J. Paul Getty Museum': 'The Getty',
  'Oriental Institute (ISAC)': 'ISAC',
  'Museo Larco': 'Museo Larco',
  'Museo Chileno de Arte Precolombino': 'Museo Chileno',
}

// Strip HTML, decode common entities, normalize en/em dashes to '-', collapse ws.
export const cleanText = (s) => {
  if (!s) return ''
  s = s.replace(/<[^>]*>/g, ' ')
  const ents = { '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'", '&apos;': "'", '&nbsp;': ' ', '&ndash;': '-', '&mdash;': '-' }
  s = s.replace(/&[a-z#0-9]+;/gi, (m) => ents[m.toLowerCase()] || ' ')
  s = s.replace(/[—–]/g, '-').replace(/\s+/g, ' ').trim()
  return s
}

const eraNorm = (s) =>
  s.replace(/\bB\.?\s?C\.?\s?E\.?\b/g, 'BCE')
    .replace(/\bB\.?\s?C\.?\b/g, 'BCE')
    .replace(/\bA\.?\s?D\.?\b/g, 'CE')

export const dateLabel = (t) => {
  if (!t) return ''
  if (t.description) return eraNorm(cleanText(t.description)).split(';')[0].trim()
  const f = (y) => (y < 0 ? (-y) + ' BCE' : y + ' CE')
  if (t.start == null) return ''
  if (t.end == null || t.end === t.start) return f(t.start)
  if (t.start < 0 && t.end < 0) return (-t.start) + '-' + (-t.end) + ' BCE'
  if (t.start >= 0 && t.end >= 0) return t.start + '-' + t.end + ' CE'
  return (-t.start) + ' BCE - ' + t.end + ' CE'
}

// Fallback description for items with no description (~20% of items): a clause
// built from structured fields (classification, culture), de-duped against the
// title's name/country so it doesn't echo the title.
const buildFallback = (a) => {
  const name = (cleanText(a.name) || '').toLowerCase()
  const country = (a.country || '').toLowerCase()
  const bits = []
  const cls = cleanText(a.classification)
  if (cls && !name.includes(cls.toLowerCase())) bits.push(cls.charAt(0).toUpperCase() + cls.slice(1))
  let cul = cleanText(a.culture)
  if (cul) {
    const segs = cul.split(',').map((s) => s.trim()).filter((s) => s && s.toLowerCase() !== country)
    cul = segs.join(', ')
    if (cul && cul.toLowerCase() !== country && !name.includes(cul.toLowerCase())) bits.push(cul)
  }
  return bits.join('. ')
}

export const genTitle = (a) =>
  [cleanText(a.name), a.country, dateLabel(a.time)].filter(Boolean).join(', ')

export const genDescription = (a) => {
  const parts = []
  const medium = cleanText(a.medium); if (medium) parts.push(medium)
  const src = SHORT_SOURCE[a.source] || a.source || ''; if (src) parts.push(src)
  const base = parts.join('. ')
  const desc = cleanText(a.description) || buildFallback(a)
  let full = base ? (desc ? base + '. ' + desc : base + '.') : desc
  const LIMIT = 160
  if (full.length > LIMIT) full = full.slice(0, LIMIT - 1).replace(/\s+\S*$/, '').trim() + '…'
  return full
}

// Flatten an artifact document into the flat shape the generators expect.
const flatten = (artifact) => ({
  name: artifact.name,
  country: artifact?.location?.country || '',
  time: artifact.time,
  medium: artifact.medium,
  classification: artifact.classification,
  culture: artifact.culture,
  source: artifact?.source?.name || '',
  description: artifact.description,
})

// Build the full SEO payload (meta + VisualArtwork JSON-LD) for an artifact page.
// Empty JSON-LD fields are dropped (undefined) rather than emitted blank.
export const buildArtifactSeo = (artifact, baseUrl, id) => {
  const a = flatten(artifact)
  const country = a.country
  const shortSource = SHORT_SOURCE[a.source] || a.source || ''
  const thumb = artifact?.images?.thumbnail || artifact?.images?.external?.[0] || ''
  const url = `${baseUrl}/artifacts/${id}`

  // Crawler-facing image goes through our own /api/img passthrough (some museum
  // CDNs block server-side fetches, blanking the card). In-browser display still
  // hotlinks the CDN directly elsewhere.
  const image = thumb ? `${baseUrl}/api/img?url=${encodeURIComponent(thumb)}` : ''

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'VisualArtwork',
    name: cleanText(artifact.name),
    image: image || undefined,
    description: cleanText(artifact.description) || undefined,
    dateCreated: dateLabel(artifact.time) || undefined,
    artMedium: cleanText(artifact.medium) || undefined,
    artform: cleanText(artifact.classification) || undefined,
    locationCreated: country ? { '@type': 'Place', name: country } : undefined,
    isPartOf: shortSource ? { '@type': 'Collection', name: shortSource } : undefined,
    url,
  }

  return {
    title: genTitle(a),
    description: genDescription(a),
    url,
    image,
    // Round-trip drops the `undefined` (empty) fields — getServerSideProps props
    // must be JSON-serializable, and it gives us the "omit empty" behavior too.
    jsonLd: JSON.parse(JSON.stringify(jsonLd)),
  }
}
