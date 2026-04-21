import { MdChat } from 'react-icons/md'

export const MultiplayerGameView = ({ game }) => {
  const nameFor = uid => game.usernames?.[uid] || uid?.slice(0, 6) || '?'
  const sortedScores = [...(game.finalScores || [])].sort((a, b) => (b.totalScore || 0) - (a.totalScore || 0))

  return (
    <div className='grid grid-cols-1 lg:grid-cols-3 gap-3 p-3'>
      <div className='lg:col-span-2'>
        <Summary game={game} nameFor={nameFor} sortedScores={sortedScores} />
        <Rounds game={game} nameFor={nameFor} />
      </div>
      <div>
        <ChatPanel chat={game.chat} hasLobbyId={!!game.lobbyId} />
      </div>
    </div>
  )
}

const Summary = ({ game, nameFor, sortedScores }) => (
  <div className='mb-3 p-3' css={{
    background: 'var(--backgroundColorBarelyLight)',
    border: '1px outset',
    borderColor: '#ffffff77 #00000077 #00000077 #ffffff77',
  }}>
    <div className='grid grid-cols-2 gap-2 text-xs mb-3'>
      <InfoCell label='Mode' value={game.mode} />
      <InfoCell label='Rounds' value={game.rounds} />
      <InfoCell label='Timer' value={game.timer ? `${game.timer}s` : '—'} />
      <InfoCell label='Host' value={game.hostUsername || nameFor(game.hostId)} />
      <InfoCell label='Started' value={game.startedAt ? new Date(game.startedAt).toLocaleString() : '—'} />
      <InfoCell label='Ended' value={game.endedAt ? new Date(game.endedAt).toLocaleString() : '—'} />
    </div>
    <div className='text-[10px] uppercase tracking-wider mb-1' css={{ color: 'var(--textLowOpacity)' }}>
      Final Scoreboard
    </div>
    <div className='text-xs'>
      {sortedScores.map((s, i) => (
        <div key={s.userId} className='flex items-center p-1 px-2 mb-0.5' css={{
          background: i === 0 ? 'rgba(255,200,0,0.15)' : 'var(--backgroundColorLight)',
        }}>
          <div className='w-6' css={{ opacity: 0.6 }}>#{i + 1}</div>
          <div className='flex-1'>
            <b>{nameFor(s.userId)}</b>
            {s.userId === game.winnerId && <span className='ml-2 text-[10px]'>👑</span>}
          </div>
          <div className='font-bold'>{s.totalScore}</div>
        </div>
      ))}
    </div>
  </div>
)

const InfoCell = ({ label, value }) => (
  <div>
    <div className='text-[10px] uppercase tracking-wider' css={{ color: 'var(--textLowOpacity)' }}>{label}</div>
    <div className='font-bold'>{value ?? '—'}</div>
  </div>
)

const Rounds = ({ game, nameFor }) => (
  <div>
    <div className='text-[10px] uppercase tracking-wider mb-2' css={{ color: 'var(--textLowOpacity)' }}>
      Round by Round
    </div>
    {(game.roundData || []).map(r => {
      const artifact = r.artifact
      return (
        <div key={r.round} className='mb-2 p-2' css={{
          background: 'var(--backgroundColorBarelyLight)',
          border: '1px outset',
          borderColor: '#ffffff77 #00000077 #00000077 #ffffff77',
        }}>
          <div className='flex items-center mb-2'>
            <div className='w-8 text-center font-bold' css={{ opacity: 0.8 }}>R{r.round}</div>
            <div className='flex-1 text-xs ml-2 truncate'>
              <b>{artifact?.name || r.artifactId}</b>
              {artifact && (
                <span className='ml-2' css={{ color: 'var(--textLowOpacity)' }}>
                  · {artifact.location?.country || '?'}
                  {artifact.dates?.year && ` · ${artifact.dates.year}`}
                </span>
              )}
            </div>
          </div>
          <div className='text-[11px]'>
            <table css={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr css={{ color: 'var(--textLowOpacity)' }}>
                  <th className='text-left p-1'>Player</th>
                  <th className='text-left p-1'>Guess: Date</th>
                  <th className='text-left p-1'>Guess: Country</th>
                  <th className='text-right p-1'>Date pts</th>
                  <th className='text-right p-1'>Country pts</th>
                  <th className='text-right p-1'>Total</th>
                </tr>
              </thead>
              <tbody>
                {(r.playerGuesses || []).map(g => (
                  <tr key={g.userId} css={{ borderTop: '1px solid var(--backgroundColorLight)' }}>
                    <td className='p-1'><b>{nameFor(g.userId)}</b></td>
                    <td className='p-1'>{g.selectedDate ?? <span css={{ opacity: 0.4 }}>—</span>}</td>
                    <td className='p-1'>{g.selectedCountry ?? <span css={{ opacity: 0.4 }}>—</span>}</td>
                    <td className='p-1 text-right'>{g.datePoints ?? 0}</td>
                    <td className='p-1 text-right'>{g.countryPoints ?? 0}</td>
                    <td className='p-1 text-right font-bold'>{g.points ?? 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )
    })}
  </div>
)

const ChatPanel = ({ chat, hasLobbyId }) => (
  <div className='p-3' css={{
    background: 'var(--backgroundColorBarelyLight)',
    border: '1px outset',
    borderColor: '#ffffff77 #00000077 #00000077 #ffffff77',
    position: 'sticky',
    top: 8,
    maxHeight: 'calc(100vh - 32px)',
    overflowY: 'auto',
  }}>
    <div className='text-[10px] uppercase tracking-wider mb-2 flex items-center' css={{ color: 'var(--textLowOpacity)' }}>
      <MdChat className='mr-1' />
      Lobby Chat {chat != null && `(${chat.length})`}
    </div>
    {chat === null && (
      <div className='text-xs' css={{ color: 'var(--textLowOpacity)' }}>
        {hasLobbyId
          ? 'Log in as a game participant to view chat.'
          : 'Game played before lobbyId was persisted — chat cannot be linked.'}
      </div>
    )}
    {chat?.length === 0 && (
      <div className='text-xs' css={{ color: 'var(--textLowOpacity)' }}>No chat messages.</div>
    )}
    <div className='text-xs'>
      {chat?.map(m => (
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
)
