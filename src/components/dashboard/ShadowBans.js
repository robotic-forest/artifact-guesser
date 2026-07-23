import { useCallback, useEffect, useState } from 'react'
import axios from 'axios'
import { MdClose, MdPersonOff } from 'react-icons/md'
import useUser from '@/hooks/useUser'

// Admin panel for managing shadow-banned users. A shadow-banned user is never told:
// their chat is echoed only back to themselves (and flagged 👻 to admins), lobbies are
// hidden, and multiplayer shows a "renovation" screen. Keyed by lowercased username.
export const ShadowBans = ({ backgroundColor = 'var(--backgroundColorDark)' }) => {
  const { isAdmin } = useUser()
  const [bans, setBans] = useState([])
  const [loading, setLoading] = useState(false)
  const [username, setUsername] = useState('')
  const [reason, setReason] = useState('')
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await axios.get('/api/admin/shadow-bans')
      if (data?.success) setBans(data.bans || [])
    } catch (e) {
      setError('Failed to load bans.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { if (isAdmin) load() }, [isAdmin, load])

  const add = async (e) => {
    e?.preventDefault()
    const u = username.trim()
    if (!u) return
    setError(null)
    try {
      const { data } = await axios.post('/api/admin/shadow-bans', { username: u, reason: reason.trim() || null })
      if (data?.success) {
        setUsername('')
        setReason('')
        await load()
      } else {
        setError(data?.message || 'Failed to add ban.')
      }
    } catch (e) {
      setError('Failed to add ban.')
    }
  }

  const remove = async (u) => {
    try {
      await axios.delete('/api/admin/shadow-bans', { data: { username: u } })
      await load()
    } catch (e) {
      setError('Failed to remove ban.')
    }
  }

  if (!isAdmin) return null

  return (
    <div css={{
      background: backgroundColor,
      border: '1px solid rgba(0,0,0,0.15)',
      borderRadius: 8,
      padding: 12,
      fontFamily: 'monospace',
      width: 320,
      maxWidth: '90vw',
    }}>
      <div className='flex items-center mb-2' css={{ fontWeight: 'bold' }}>
        <MdPersonOff className='mr-1' /> Shadow Bans
      </div>

      <form onSubmit={add} className='flex flex-col gap-1 mb-2'>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder='username'
          css={{ padding: '4px 6px', borderRadius: 4, border: '1px solid rgba(0,0,0,0.25)', background: 'rgba(255,255,255,0.6)' }}
        />
        <input
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder='reason (optional)'
          css={{ padding: '4px 6px', borderRadius: 4, border: '1px solid rgba(0,0,0,0.25)', background: 'rgba(255,255,255,0.6)' }}
        />
        <button
          type='submit'
          css={{
            padding: '4px 8px', borderRadius: 4, border: '2px solid #dc3545', background: '#dc3545',
            color: 'white', fontWeight: 'bold', cursor: 'pointer',
            '&:hover': { filter: 'brightness(1.1)' },
          }}
        >
          Shadow ban
        </button>
      </form>

      {error && <div css={{ color: '#dc3545', fontSize: 12, marginBottom: 6 }}>{error}</div>}

      {loading ? (
        <div css={{ fontSize: 12, opacity: 0.7 }}>Loading…</div>
      ) : bans.length === 0 ? (
        <div css={{ fontSize: 12, opacity: 0.7 }}>No shadow-banned users.</div>
      ) : (
        <div className='flex flex-col gap-1'>
          {bans.map((b) => (
            <div key={b.usernameLower} className='flex items-center justify-between' css={{
              background: 'rgba(220,53,69,0.10)', borderLeft: '3px solid #dc3545',
              borderRadius: 3, padding: '3px 6px', fontSize: 13,
            }}>
              <div className='flex flex-col'>
                <span css={{ fontWeight: 'bold' }}>{b.username}</span>
                {b.reason && <span css={{ fontSize: 11, opacity: 0.7 }}>{b.reason}</span>}
              </div>
              <button
                title='Remove ban'
                onClick={() => remove(b.username)}
                css={{ cursor: 'pointer', display: 'flex', alignItems: 'center', opacity: 0.7, '&:hover': { opacity: 1 } }}
              >
                <MdClose />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
