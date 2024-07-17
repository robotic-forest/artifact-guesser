import { dashbaordTheme } from "@/pages/dashboard"
import { themeCSS } from "../GlobalStyles"
import { Title } from "./Title"
import { gamesTheme } from "@/pages/games"
import { PulseLoader } from "react-spinners"
import { Tag } from "../tag/Tag"
import { modes } from "../gameui/ModeButton"
import { MasonryLayout } from "../layout/MasonryLayout"
import { useLobbies } from "./hooks/useLobbies"

export const LobbyChoice = () => {
  const { lobbies, createLobby, joinLobby } = useLobbies()

  const lobbiesSchema = [
    {
      time: '1:00',
      players: 4,
      goal: 10,
      type: 'public',
      mode: 'Africa',
      creator: 'protocodex',
      chatPreview: {
        username: 'protocodex',
        message: 'I hope someone shows up'
      }
    }
  ]

  return (
    <div className='flex flex-col items-center min-h-screen justify-center font-mono w-full' css={{
      '& *': { transition: 'all 0.2s ease-in-out, width 0s, max-width 0s' }
    }}>
      <div className='p-6 w-screen flex flex-col max-w-[1200px]' css={{
      }}>
        <Title />
        <div className='mt-4 w-[fit-content]'>
          <div className='' css={{
            color: 'var(--textLowOpacity)'
          }}>
            Create a new Lobby
          </div>
          <div className='mt-2 p-0 pb-2 pr-2 flex flex-wrap'>
            <LobbyTypeButton theme={dashbaordTheme} onClick={() => createLobby()}>
              <div><b>Create Private Lobby</b></div>
              <div>
                Only players with a link can join
              </div>
            </LobbyTypeButton>
            <LobbyTypeButton theme={gamesTheme} onClick={() => createLobby(true)}>
              <div><b>Create Public Lobby</b></div>
              <div>
                Anyone can join
              </div>
            </LobbyTypeButton>
          </div>
        </div>

        <div className='mt-4 w-full'>
          <div className='' css={{
            color: 'var(--textLowOpacity)'
          }}>
            Join an existing Lobby
          </div>
          <div className='mt-2 p-2 pb-0' css={{
            background: `var(--backgroundColorBarelyDark)`,
            borderRadius: 3
          }}>
            {!lobbies && <div className='flex justify-center items-center pt-2 pb-4' css={{ color: 'var(--textLowOpacity)' }}>
              <PulseLoader color='var(--textLowOpacity)' size={5} className='mr-4' />
              Loading...
            </div>}
            {lobbies?.length === 0 && <div className='text-center pt-2 pb-4' css={{ color: 'var(--textLowOpacity)' }}>
              No Lobbies available. Create one!
            </div>}
            {lobbies?.length > 0 && (
              <MasonryLayout gutter={6}>
                {lobbies?.map(lobby => {
    
                  return (
                    <div key={lobby.time} className='p-2 mb-2 rounded-[6px]' css={{
                      background: 'var(--backgroundColorBarelyLight)',
                      boxShadow: 'rgb(0 0 0 / 0%) 0px 0px 0px 0px, rgb(0 0 0 / 0%) 0px 0px 0px 0px, rgb(0 0 0 / 12%) ' +
                        '0px 0px 0px 0px, rgb(0 0 0 / 0%) 0px 0px 0px 0px, rgb(64 68 82 / 8%) 0px 2px 5px 0px',
                    }}>
                      <div className='flex items-center'>
                        <div className='pr-2'>
                          <div className='py-1 pl-2 pr-3 rounded'>
                            <b>{lobby.players} / {lobby.goal}</b> Players
                          </div>
                        </div>
                        <div className='pl-2 pr-4'>
                          <span className='opacity-70'>Time </span>
                          <b>{lobby.time}</b>
                        </div>
                        <div className='pl-2 pr-2 flex items-center'>
                          <span className='opacity-70'>Mode </span>
                          <Tag className='ml-3' bold color={modes[lobby.mode].color}>
                            {lobby.mode}
                          </Tag>
                        </div>
                      </div>
                      <div className='p-1'>
                        {lobby.creator}
                      </div>
                      <div className='p-2 py-1 mt-2 rounded w-full' css={{
                        background: 'var(--backgroundColorLight)',
                      }}>
                        <b>{lobby.chatPreview?.username}</b> {lobby.chatPreview?.message}
                      </div>
                    </div>
                  )
                })}
              </MasonryLayout>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

const LobbyTypeButton = ({ className, ...p }) => {

  return (
    <div css={themeCSS(p.theme)}>
      <button
        className={`p-3 block text-left w-[360px] max-w-[calc(100vw_-_70px)] mb-2 mr-2 ${className}`}
        css={{
          background: 'var(--backgroundColorBarelyLight)',
          border: '1px outset',
          borderColor: '#ffffff77 #00000077 #00000077 #ffffff77',
          '&:hover': {
            background: 'var(--backgroundColorLight)',
            color: 'var(--textColor)',
          }
        }}
        {...p}
      />
    </div>
  )
}