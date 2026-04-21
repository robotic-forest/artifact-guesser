import useSWR from "swr"
import Link from "next/link"
import { useState } from "react"
import { Spinner } from "../loading/Spinner"
import { GiBattleAxe } from "react-icons/gi"
import { MdChat } from "react-icons/md"

export const MultiplayerHistory = () => {
  const [expanded, setExpanded] = useState(false)
  const { data, error } = useSWR(expanded ? '/api/admin/multiplayer' : null)

  return (
    <div>
      <div
        className='flex items-center cursor-pointer text-xs'
        css={{ marginBottom: expanded ? 8 : 0, color: 'var(--textLowOpacity)' }}
        onClick={() => setExpanded(e => !e)}
      >
        <GiBattleAxe className='mr-2' />
        Multiplayer History
        <span className='ml-2'>{expanded ? '▼' : '▶'}</span>
      </div>

      {expanded && (
        error
          ? <div className='text-xs text-red-400'>Failed to load multiplayer history</div>
          : !data
            ? <Spinner />
            : <Content data={data} />
      )}
    </div>
  )
}

const Content = ({ data }) => {
  const { games = [], orphanLobbies = [] } = data

  return (
    <div className='text-xs'>
      <div className='text-[10px] uppercase tracking-wider mb-1' css={{ color: 'var(--textLowOpacity)' }}>
        Past Games ({games.length})
      </div>
      {games.length === 0 && (
        <div className='mb-3' css={{ color: 'var(--textLowOpacity)' }}>No multiplayer games yet.</div>
      )}
      {games.length > 0 && (
        <div className='mb-3' css={{ maxHeight: 360, overflowY: 'auto' }}>
          {games.map(g => <GameRow key={g._id} game={g} />)}
        </div>
      )}

      {orphanLobbies.length > 0 && (
        <>
          <div className='text-[10px] uppercase tracking-wider mb-1' css={{ color: 'var(--textLowOpacity)' }}>
            Unlinked Chat Lobbies ({orphanLobbies.length})
            <span className='normal-case ml-2' css={{ opacity: 0.7 }}>
              — chat without a linked game (pre-launch or pre-linkage)
            </span>
          </div>
          <div css={{ maxHeight: 200, overflowY: 'auto' }}>
            {orphanLobbies.map(l => <OrphanRow key={l.lobbyId} lobby={l} />)}
          </div>
        </>
      )}
    </div>
  )
}

const GameRow = ({ game }) => {
  const players = game.playerUsernames || []
  const topScore = game.finalScores?.length
    ? Math.max(...game.finalScores.map(s => s.score || 0))
    : null

  return (
    <Link href={`/games/${game._id}`} css={{ textDecoration: 'none', color: 'inherit' }}>
      <div className='flex items-center gap-2 p-1 px-2 mb-0.5 cursor-pointer' css={{
        background: 'var(--backgroundColorLight)',
        '&:hover': { background: 'var(--backgroundColorLight2)' },
      }}>
        <div className='flex-1 truncate'>
          <b>{game.winnerUsername || 'no winner'}</b>
          <span css={{ opacity: 0.6 }}> · {players.join(', ')}</span>
        </div>
        <div className='text-[10px] w-[60px] text-right' css={{ opacity: 0.7 }} title='Game mode'>{game.mode}</div>
        <div className='text-[10px] w-[40px] text-right' title='Rounds'>{game.rounds}r</div>
        <div className='text-[10px] w-[50px] text-right font-bold' title='Top score'>{topScore ?? '—'}</div>
        <div
          className='text-[10px] w-[30px] text-right flex items-center justify-end gap-0.5'
          css={{ opacity: game.chatCount ? 1 : 0.3 }}
          title='Chat messages'
        >
          <MdChat size={10} />{game.chatCount}
        </div>
        <div className='text-[10px] w-[95px] text-right' css={{ opacity: 0.6 }} title='Started'>
          {game.startedAt ? new Date(game.startedAt).toLocaleDateString() : '—'}
        </div>
      </div>
    </Link>
  )
}

const OrphanRow = ({ lobby }) => (
  <Link href={`/dashboard/chat/${lobby.lobbyId}`} css={{ textDecoration: 'none', color: 'inherit' }}>
    <div className='flex items-center gap-2 p-1 px-2 mb-0.5 cursor-pointer' css={{
      background: 'var(--backgroundColorLight)',
      '&:hover': { background: 'var(--backgroundColorLight2)' },
    }}>
      <div className='flex-1 truncate font-mono text-[10px]' title='Lobby ID'>{lobby.lobbyId}</div>
      <div className='text-[10px] truncate' css={{ opacity: 0.7, maxWidth: 200 }} title='Participants'>
        {lobby.usernames.join(', ') || '(no usernames)'}
      </div>
      <div className='text-[10px] w-[30px] text-right flex items-center justify-end gap-0.5' title='Chat messages'>
        <MdChat size={10} />{lobby.messageCount}
      </div>
      <div className='text-[10px] w-[95px] text-right' css={{ opacity: 0.6 }} title='Last message'>
        {new Date(lobby.lastAt).toLocaleDateString()}
      </div>
    </div>
  </Link>
)
