import { useRouter } from 'next/router'
import useSWR from 'swr'
import Link from 'next/link'
import { Layout } from '@/components/layout/Layout'
import { Spinner } from '@/components/loading/Spinner'
import { dashboardTheme } from '@/pages/dashboard'
import { MdArrowBack, MdChat } from 'react-icons/md'

export default function ChatLobbyPage() {
  const router = useRouter()
  const { lobbyId } = router.query
  const { data, error } = useSWR(lobbyId ? `/api/admin/chat/${lobbyId}` : null)

  return (
    <Layout title='Lobby Chat' theme={dashboardTheme} contentCSS={{
      fontFamily: 'monospace',
      background: 'linear-gradient(180deg, var(--backgroundColor), var(--backgroundColorDark))',
      minHeight: '100vh',
    }}>
      <Link href='/dashboard' css={{ textDecoration: 'none', color: 'inherit' }}>
        <div className='flex items-center mb-3 cursor-pointer' css={{ '&:hover': { opacity: 0.7 } }}>
          <MdArrowBack className='mr-2' />
          <MdChat className='mr-2' />
          Lobby Chat
          <span className='ml-3 text-xs font-mono' css={{ opacity: 0.6 }}>{lobbyId}</span>
        </div>
      </Link>

      {error && <div className='text-red-400'>Failed to load chat</div>}
      {!data && !error && <Spinner />}
      {data && (
        <div className='p-3 max-w-[800px]' css={{
          background: 'var(--backgroundColorBarelyLight)',
          border: '1px outset',
          borderColor: '#ffffff77 #00000077 #00000077 #ffffff77',
        }}>
          <div className='text-[10px] uppercase tracking-wider mb-2' css={{ color: 'var(--textLowOpacity)' }}>
            {data.messages.length} messages
          </div>
          {data.messages.length === 0 && (
            <div className='text-xs' css={{ color: 'var(--textLowOpacity)' }}>No messages.</div>
          )}
          <div className='text-xs'>
            {data.messages.map(m => (
              <div key={m.id || m._id} className='mb-1.5'>
                <div className='text-[9px]' css={{ color: 'var(--textLowOpacity)' }}>
                  {new Date(m.timestamp).toLocaleString()}
                </div>
                {m.username
                  ? <div><b>{m.username}</b>: {m.message}</div>
                  : <div css={{ fontStyle: 'italic', opacity: 0.6 }}>{m.message}</div>
                }
              </div>
            ))}
          </div>
        </div>
      )}
    </Layout>
  )
}
