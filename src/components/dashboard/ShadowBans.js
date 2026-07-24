import { useCallback, useEffect, useState } from 'react'
import axios from 'axios'
import AsyncSelect from 'react-select/async'
import { components as RSComponents } from 'react-select'
import { MdClose, MdPersonOff } from 'react-icons/md'
import useUser from '@/hooks/useUser'
import { customStyles } from '@/components/form/Form'
import { Button } from '@/components/buttons/Button'

// Admin dashboard item for managing shadow-banned users. A shadow-banned user is never
// told: their chat is echoed only back to themselves (and flagged 👻 to admins), lobbies
// are hidden, and multiplayer shows a "renovation" screen. Keyed by lowercased username.

// Dark placeholder / value text so the fields read clearly on the light card.
const selectStyles = {
  ...customStyles,
  placeholder: (p) => ({ ...p, color: 'var(--textColor)', opacity: 0.55 }),
  singleValue: (p) => ({ ...p, color: 'var(--textColor)' }),
  input: (p) => ({ ...p, color: 'var(--textColor)' }),
}

const Title = ({ children }) => (
  <div css={{ fontSize: '0.85em', fontWeight: 600, color: 'var(--textColor)', marginBottom: 3 }}>{children}</div>
)

// Stop the browser autofilling the search box (Chrome ignores autoComplete="off",
// so use an unrecognized token + a non-"username" field name).
const NoAutofillInput = (props) => (
  <RSComponents.Input {...props} autoComplete='new-password' name='sb-lookup' data-lpignore='true' data-form-type='other' />
)

export const ShadowBans = () => {
  const { isAdmin } = useUser()
  const [bans, setBans] = useState([])
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState(null)
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

  // Search real accounts by username for the dropdown.
  const loadUsers = async (input) => {
    if (!input || input.trim().length < 1) return []
    try {
      const filter = JSON.stringify({ username: { $regex: input.trim(), $options: 'i' } })
      const project = JSON.stringify({ username: 1 })
      const { data } = await axios.get('/api/accounts', { params: { filter, project, per_page: 10 } })
      return (data?.data || [])
        .filter(u => u.username)
        .map(u => ({ value: u.username, label: u.username }))
    } catch (e) {
      return []
    }
  }

  const add = async () => {
    const u = selected?.value?.trim()
    if (!u) return
    setError(null)
    try {
      const { data } = await axios.post('/api/admin/shadow-bans', { username: u, reason: reason.trim() || null })
      if (data?.success) {
        setSelected(null)
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
    <div className='mb-2' css={{
      background: 'var(--backgroundColorBarelyLight)',
      border: '1px outset',
      borderColor: '#ffffff77 #00000077 #00000077 #ffffff77',
      color: 'var(--textColor)',
    }}>
      <div className='p-3'>
        <div className='flex items-center mb-3' css={{ fontWeight: 'bold' }}>
          <MdPersonOff className='mr-2' /> Shadow Bans
          <span className='ml-2' css={{ fontSize: 12, opacity: 0.65 }}>{bans.length}</span>
        </div>

        <div className='mb-2'>
          <Title>User to shadow-ban</Title>
          <AsyncSelect
            styles={selectStyles}
            components={{ Input: NoAutofillInput }}
            value={selected}
            onChange={setSelected}
            loadOptions={loadUsers}
            placeholder='Type a username…'
            isClearable
            cacheOptions
            noOptionsMessage={({ inputValue }) => inputValue ? 'No matching users' : 'Type to search users'}
          />
        </div>

        <div className='mb-3'>
          <Title>Reason (optional)</Title>
          <input
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder='e.g. slur in chat'
            css={{
              width: '100%',
              padding: '6px 8px',
              borderRadius: 4,
              border: '1px solid var(--textLowOpacity)',
              background: 'var(--backgroundColor)',
              color: 'var(--textColor)',
              fontFamily: 'inherit',
              fontSize: '0.9em',
              '&::placeholder': { color: 'var(--textColor)', opacity: 0.55 },
              '&:focus': { outline: 'none', borderColor: 'var(--textColor)' },
            }}
          />
        </div>

        <div className='flex justify-end'>
          <Button variant='relief' color='#dc5b68' textColor='#ffffff' onClick={add} disable={!selected} css={{ cursor: selected ? 'pointer' : 'default' }}>
            <MdPersonOff className='mr-1' /> Shadow ban
          </Button>
        </div>

        {error && <div css={{ color: '#a71d2a', fontSize: 12, marginTop: 8, fontWeight: 'bold' }}>{error}</div>}

        <div css={{ borderTop: '1px solid var(--textVeryLowOpacity)', margin: '12px 0 10px' }} />

        {loading ? (
          <div css={{ fontSize: 13, opacity: 0.7 }}>Loading…</div>
        ) : bans.length === 0 ? (
          <div css={{ fontSize: 13, opacity: 0.7 }}>No shadow-banned users.</div>
        ) : (
          <div className='flex flex-col gap-1'>
            {bans.map((b) => (
              <div key={b.usernameLower} className='flex items-center justify-between' css={{
                background: 'var(--backgroundColor)',
                borderRadius: 3, padding: '4px 8px', fontSize: 13,
              }}>
                <div className='flex flex-col'>
                  <span css={{ fontWeight: 'bold' }}>{b.username}</span>
                  {b.reason && <span css={{ fontSize: 11, opacity: 0.7 }}>{b.reason}</span>}
                </div>
                <button
                  title='Remove ban'
                  onClick={() => remove(b.username)}
                  css={{ cursor: 'pointer', display: 'flex', alignItems: 'center', color: 'var(--textColor)', opacity: 0.6, '&:hover': { opacity: 1 } }}
                >
                  <MdClose />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
