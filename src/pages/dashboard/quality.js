import { useCallback, useEffect, useRef, useState } from 'react'
import axios from 'axios'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { Layout } from '@/components/layout/Layout'
import { MasonryLayout } from '@/components/layout/MasonryLayout'
import { ArtifactImage } from '@/components/artifacts/list/components.js/ArtifactImage'
import { Spinner } from '@/components/loading/Spinner'
import { dashboardTheme } from '@/pages/dashboard'
import { MdArrowBack, MdShuffle } from 'react-icons/md'
import { GiAmphora } from 'react-icons/gi'

// Score → colour, so the eye can map buckets to badges instantly.
const scoreColor = s =>
  s <= 1 ? '#c0392b' :   // trash (excluded)
  s <= 3 ? '#e67e22' :   // borderline
  s <= 5 ? '#27ae60' :   // good
           '#2980b9'     // great (6+)

const BUCKETS = [
  { label: 'Trash (0-1)',      scores: [0, 1] },
  { label: 'Borderline (2-3)', scores: [2, 3] },
  { label: 'Good (4-5)',       scores: [4, 5] },
  { label: 'Great (6+)',       scores: [6, 7, 8, 9, 10] },
]

const SOURCES = [
  'Art Institute of Chicago',
  'Cleveland Museum of Art',
  'J. Paul Getty Museum',
  'Metropolitan Museum of Art, New York, NY',
  'Museo Chileno de Arte Precolombino',
  'Museo Larco',
  'Oriental Institute (ISAC)',
  'Smithsonian',
  'The British Museum',
  'The Walters Art Museum',
]

const BATCH = 48

const QualityBrowser = () => {
  // Selected exact scores (a Set of 0..10). Default: trash bucket — that's
  // the bucket worth eyeballing, the stuff we exclude from play.
  const [scores, setScores] = useState(() => new Set([0, 1]))
  const [source, setSource] = useState('')

  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const seen = useRef(new Set())
  const reqId = useRef(0)

  const buildQuery = () => {
    const p = new URLSearchParams()
    if (scores.size && scores.size < 11) p.set('scores', [...scores].join(','))
    if (source) p.set('source', source)
    p.set('size', String(BATCH))
    return p.toString()
  }

  const fetchMore = useCallback(async () => {
    if (loading || done) return
    setLoading(true)
    const myReq = reqId.current
    try {
      const { data } = await axios.get(`/api/admin/artifacts/browse?${buildQuery()}`)
      if (myReq !== reqId.current) return // a reset happened mid-flight, drop it
      const fresh = (data.artifacts || []).filter(a => {
        const id = a._id?.toString()
        if (!id || seen.current.has(id)) return false
        seen.current.add(id)
        return true
      })
      setItems(prev => [...prev, ...fresh])
      // $sample keeps returning from the same pool; once we stop seeing
      // anything new for a batch, the bucket is effectively exhausted.
      if (fresh.length === 0) setDone(true)
    } catch (err) {
      console.error(err)
    } finally {
      if (myReq === reqId.current) setLoading(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, done, scores, source])

  // Reset + reload whenever the filters change (this is also the "shuffle").
  const reset = useCallback(() => {
    reqId.current += 1
    seen.current = new Set()
    setItems([])
    setDone(false)
    setLoading(false)
  }, [])

  useEffect(() => {
    reset()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scores, source])

  // Kick off the first fetch after a reset clears the list.
  useEffect(() => {
    if (items.length === 0 && !done && !loading) fetchMore()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length, done])

  // Infinite scroll sentinel.
  const sentinel = useRef(null)
  useEffect(() => {
    const el = sentinel.current
    if (!el) return
    const io = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) fetchMore()
    }, { rootMargin: '600px' })
    io.observe(el)
    return () => io.disconnect()
  }, [fetchMore])

  const toggleScore = s => setScores(prev => {
    const next = new Set(prev)
    next.has(s) ? next.delete(s) : next.add(s)
    return next
  })

  const setBucket = bucketScores => setScores(new Set(bucketScores))

  return (
    <Layout title='Quality Browser' theme={dashboardTheme} contentCSS={{
      fontFamily: 'monospace',
      background: 'linear-gradient(180deg, var(--backgroundColor), var(--backgroundColorDark))',
      minHeight: '100vh',
    }}>
      <Link href='/dashboard' css={{ textDecoration: 'none', color: 'inherit' }}>
        <div className='flex items-center mb-3 cursor-pointer' css={{ '&:hover': { opacity: 0.7 } }}>
          <MdArrowBack className='mr-2' />
          <GiAmphora className='mr-2' />
          Quality Browser
        </div>
      </Link>

      {/* Controls */}
      <div className='mb-3 p-3' css={{
        background: 'var(--backgroundColorBarelyLight)',
        border: '1px outset',
        borderColor: '#ffffff77 #00000077 #00000077 #ffffff77',
      }}>
        {/* Bucket presets */}
        <div className='flex flex-wrap items-center gap-2 mb-2'>
          {BUCKETS.map(b => (
            <Chip
              key={b.label}
              active={b.scores.every(s => scores.has(s)) && scores.size === b.scores.length}
              color={scoreColor(b.scores[0])}
              onClick={() => setBucket(b.scores)}
            >
              {b.label}
            </Chip>
          ))}
        </div>

        {/* Individual score toggles */}
        <div className='flex flex-wrap items-center gap-1 mb-2'>
          <span className='text-xs mr-1 opacity-70'>scores:</span>
          {Array.from({ length: 11 }, (_, s) => (
            <Chip key={s} small active={scores.has(s)} color={scoreColor(s)} onClick={() => toggleScore(s)}>
              {s}
            </Chip>
          ))}
        </div>

        {/* Source filter + shuffle */}
        <div className='flex flex-wrap items-center gap-2'>
          <select
            value={source}
            onChange={e => setSource(e.target.value)}
            className='text-xs p-1'
            css={{ background: 'var(--backgroundColorDark)', color: 'inherit', border: '1px inset #00000055' }}
          >
            <option value=''>all museums</option>
            {SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>

          <button
            onClick={reset}
            className='flex items-center text-xs px-2 py-1 cursor-pointer'
            css={{
              background: 'var(--backgroundColorDark)',
              border: '1px outset', borderColor: '#ffffff77 #00000077 #00000077 #ffffff77',
              '&:hover': { background: 'var(--backgroundColorBarelyLight)' },
            }}
          >
            <MdShuffle className='mr-1' /> shuffle
          </button>

          <span className='text-xs opacity-70'>
            {items.length} loaded{scores.size === 0 ? ' — pick a score' : ''}
          </span>
        </div>
      </div>

      {/* Grid */}
      {items.length > 0 && (
        <MasonryLayout gutter={8} max={4} breaks={{ default: 4, 1400: 3, 1000: 2, 600: 1 }} noCalc>
          {items.map(a => (
            <div key={a._id} className='mb-2' css={{ position: 'relative' }}>
              <ScoreBadge score={a.quality_score} />
              <ArtifactImage artifact={a} newTab />
            </div>
          ))}
        </MasonryLayout>
      )}

      <div ref={sentinel} />

      {loading && <div className='flex justify-center my-4'><Spinner /></div>}
      {done && items.length > 0 && (
        <div className='text-center text-xs opacity-60 my-4'>— that's the whole bucket —</div>
      )}
      {done && items.length === 0 && (
        <div className='text-center text-xs opacity-60 my-8'>nothing matches these filters</div>
      )}
    </Layout>
  )
}

const ScoreBadge = ({ score }) => (
  <div css={{
    position: 'absolute',
    top: 6,
    left: 6,
    zIndex: 2,
    background: scoreColor(score),
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    padding: '1px 7px',
    borderRadius: 3,
    boxShadow: '0 1px 3px rgba(0,0,0,0.5)',
    pointerEvents: 'none',
  }}>
    {score}
  </div>
)

const Chip = ({ children, active, color, small, onClick }) => (
  <button
    onClick={onClick}
    css={{
      cursor: 'pointer',
      fontSize: small ? 12 : 13,
      lineHeight: 1,
      padding: small ? '4px 8px' : '5px 10px',
      borderRadius: 3,
      border: '1px solid',
      borderColor: active ? color : '#00000033',
      background: active ? color : 'var(--backgroundColorDark)',
      color: active ? 'white' : 'inherit',
      fontWeight: active ? 'bold' : 'normal',
      transition: 'all 0.1s ease',
      '&:hover': { borderColor: color },
    }}
  >
    {children}
  </button>
)

// Client-only: ArtifactImage + masonry rely on the browser, and this is an
// admin tool with no SEO value.
export default dynamic(() => Promise.resolve(QualityBrowser), { ssr: false })
