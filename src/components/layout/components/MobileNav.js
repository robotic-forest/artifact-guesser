import { IconButton } from "@/components/buttons/IconButton"
import { BiMenu, BiQuestionMark } from "react-icons/bi"
import { ResumeGameButton } from "./ResumeGameButton"
import { useState } from "react"
import styled from "@emotion/styled"
import { GiAbstract034, GiAmphora, GiGreekSphinx } from "react-icons/gi"
import { MdClose, MdDashboard } from "react-icons/md"
import { FaHeart, FaUser } from "react-icons/fa"
import { GrLogout } from "react-icons/gr"
import { Button } from "@/components/buttons/Button"
import { theme } from "@/pages/_app"
import { css } from "@emotion/react"
import { themeCSS } from "@/components/GlobalStyles"
import { artifactsTheme } from "@/pages/artifacts"
import { gamesTheme } from "@/pages/games"
import { BsDiscord } from "react-icons/bs"
import Link from "next/link"
import { accountTheme } from "@/pages/accounts"
import { dashboardTheme } from "@/pages/dashboard"
import { SignupDialog } from "@/components/dialogs/SignupDialog"
import { LoginDialog } from "@/components/dialogs/LoginDialog"
import { useActiveRun } from "@/hooks/useActiveRun"
import { PiRedditLogoFill } from "react-icons/pi"
import { TbPigMoney } from "react-icons/tb"
import { MdArticle } from "react-icons/md"

export const MobileNav = ({ user, isAdmin, logout }) => {
  const [open, setOpen] = useState(false)
  const [loginOpen, setLoginOpen] = useState(false)
  const [signupOpen, setSignupOpen] = useState(false)

  const game = process.browser && localStorage.getItem('game')
  const { kind: activeKind, url: activeUrl } = useActiveRun()
  const resumeLabel = activeKind === 'daily'
    ? 'Resume Daily Run'
    : (activeKind === 'personal' || game) ? 'Resume Game' : 'Play Game'

  return (
    <>
      <SignupDialog open={signupOpen} onClose={() => setSignupOpen(false)} />
      <LoginDialog open={loginOpen} onClose={() => setLoginOpen(false)} />

      <div className='absolute top-1 left-1 m-2' css={{
        display: user?.isLoggedIn ? 'none' : 'block',
        '@media (max-width: 600px)': {
          display: 'block'
        },
        zIndex: 99
      }}>
        <ResumeGameButton />
      </div>

      <div className='absolute top-1 right-1 m-2' css={{
        display: user?.isLoggedIn ? 'none' : 'block',
        '@media (max-width: 600px)': {
          display: 'block'
        },
        zIndex: 99,
      }}>
        <IconButton bg onClick={() => setOpen(o => !o)} css={{
          '@media (min-width: 700px)': {
            top: user?.isLoggedIn ? 0 : 3
          }
        }}>
          <BiMenu />
        </IconButton>
      </div>

      {user && !open && !loginOpen && !signupOpen && (
        <div className='fixed bottom-1 right-1 p-2' css={{ zIndex: 99 }}>
          <Link href={activeUrl} css={{ '&:hover': { color: 'var(--textColor)'}, width: '100%', maxWidth: 400 }}>
            <Button tooltip={resumeLabel} css={{
              background: '#000000',
              color: '#ffffff',
              '&:hover': {
                background: '#ffffff',
                color: '#000000',
              }
            }}>
              <GiGreekSphinx className='mr-2' />
              {resumeLabel}
            </Button>
          </Link>
        </div>
      )}

      {open && (
        <ResponsiveMenu onClose={() => setOpen(false)} style={{
          display: user?.isLoggedIn ? 'none' : 'block',
          '@media (max-width: 600px)': {
            display: 'block'
          },
        }}>
          <div className='flex items-center justify-between'>
            <div className='flex items-center ml-1'>
              <GiGreekSphinx className='mr-2' />
              Artifact Guesser
            </div>
            <IconButton onClick={() => setOpen(false)}>
              <MdClose />
            </IconButton>
          </div>
          <div>
            {user.isLoggedIn ? (
              <>
                <div className='my-2 p-2 rounded-lg' css={{
                  background: 'var(--backgroundColorBarelyDark)'
                }}>
                  <div className='grid grid-cols-2 gap-2'>
                    <MenuButton theme={theme} url={activeUrl}>
                      <GiGreekSphinx className='mr-2' />
                      {resumeLabel}
                    </MenuButton>
                    <MenuButton theme={dashboardTheme} url='/multiplayer'>
                      <GiGreekSphinx className='mr-2' />
                      Multiplayer
                    </MenuButton>
                    {isAdmin && (
                      <MenuButton theme={dashboardTheme} url='/dashboard'>
                        <MdDashboard className='mr-2' />
                        Dashboard
                      </MenuButton>
                    )}
                    <MenuButton theme={artifactsTheme} url='/favorites'>
                      <FaHeart color='#ff4f4f' className='mr-2' />
                      Favorites
                    </MenuButton>
                    <MenuButton theme={gamesTheme} url='/games?__sortfield=startedAt&__sortdirection=-1'>
                      <GiAbstract034 className='mr-2' />
                      {isAdmin ? 'Games' : 'Played Games'}
                    </MenuButton>
                    <MenuButton theme={artifactsTheme} url='/artifacts?imageMode=true'>
                      <GiAmphora className='mr-2' />
                      Artifacts DB
                    </MenuButton>
                    <MenuButton url='/blog'>
                      <MdArticle className='mr-2' />
                      Blog
                    </MenuButton>
                    <MenuButton url='/about'>
                      <BiQuestionMark className='mr-2' />
                      About
                    </MenuButton>
                    {isAdmin ? (
                      <MenuButton theme={accountTheme} url='/accounts'>
                        <FaUser className='mr-2 text-xs' />
                        Accounts
                      </MenuButton>
                    ) : (
                      <MenuButton
                        theme={{ backgroundColor: '#5562ea', primaryColor: '#5562ea', textColor: 'white' }}
                        url='https://discord.gg/MvkqPTdcwm'
                        target='_blank'
                      >
                        <BsDiscord className='mr-2' />
                        Join Discord
                      </MenuButton>
                    )}
                    <MenuButton
                      theme={{ backgroundColor: '#ff4500', primaryColor: '#ff4500', textColor: 'white' }}
                      url='https://reddit.com/r/artifactguesser'
                      target='_blank'
                    >
                      <PiRedditLogoFill className='mr-2' />
                      Subreddit
                    </MenuButton>
                    <MenuButton
                      theme={{
                        backgroundColor: '#e7ba56',
                        primaryColor: '#e7ba56',
                        textColor: 'black'
                      }} 
                      url='https://ko-fi.com/protocodex'
                    >
                      <TbPigMoney className='mr-2' />
                      Support
                    </MenuButton>
                  </div>
                </div>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center ml-1'>
                    <FaUser className='mr-2 text-xs' />
                    {user.username}
                  </div>
                  <IconButton onClick={logout}>
                    <GrLogout />
                  </IconButton>
                </div>
              </>
            ) : (
              <div>
                <div className='my-2 p-2 rounded-lg' css={{
                  background: 'var(--backgroundColorBarelyDark)'
                }}>
                   <div className='grid grid-cols-2 gap-2'>
                     <MenuButton theme={theme} url='/' css={{
                      '&:hover': {
                        color: 'black',
                        background: 'white'
                      }
                     }}>
                      <GiGreekSphinx className='mr-2' />
                      Resume Game
                    </MenuButton>
                    <MenuButton theme={dashboardTheme} url='/multiplayer'>
                      <GiGreekSphinx className='mr-2' />
                      Multiplayer
                    </MenuButton>
                    <MenuButton theme={artifactsTheme} url='/artifacts?imageMode=true'>
                      <GiAmphora className='mr-2' />
                      Artifacts DB
                    </MenuButton>
                    <MenuButton url='/blog'>
                      <MdArticle className='mr-2' />
                      Blog
                    </MenuButton>
                    <MenuButton url='/about'>
                      <BiQuestionMark className='mr-2' />
                      About
                    </MenuButton>
                    <MenuButton
                      theme={{
                        backgroundColor: '#e7ba56',
                        primaryColor: '#e7ba56',
                        textColor: 'black'
                      }} 
                      url='https://ko-fi.com/protocodex'
                    >
                      <TbPigMoney className='mr-2' />
                      Support
                    </MenuButton>
                    <MenuButton
                      theme={{ backgroundColor: '#5562ea', primaryColor: '#5562ea', textColor: 'white' }}
                      url='https://discord.gg/MvkqPTdcwm'
                      target='_blank'
                    >
                      <BsDiscord className='mr-2' />
                      Join Discord
                    </MenuButton>
                    <MenuButton
                      theme={{ backgroundColor: '#ff4500', primaryColor: '#ff4500', textColor: 'white' }}
                      url='https://reddit.com/r/artifactguesser'
                      target='_blank'
                    >
                      <PiRedditLogoFill className='mr-2' />
                      Subreddit
                    </MenuButton>
                  </div>
                </div>
                <div className='grid grid-cols-2 gap-2 mt-2'>
                  <MenuButtonUI variant='outlined' onClick={() => { setOpen(false); setSignupOpen(true) }}>
                    Sign Up
                  </MenuButtonUI>
                  <MenuButtonUI variant='outlined' onClick={() => { setOpen(false); setLoginOpen(true) }}>
                    Log In
                  </MenuButtonUI>
                </div>
              </div>
            )}
          </div>
        </ResponsiveMenu>
      )}
    </>
  )
}

export const MenuButton = ({ url, target, children, theme, style, ...props }) => {
  const styles = theme && css`
    ${themeCSS(theme)}
    background-color: var(--backgroundColor);
    color: var(--textColor);
    font-size: var(--fs);
  `

  return (
    <Link href={url} target={target}>
      <Button css={{
        width: '100%',
        justifyContent: 'flex-start',
        ...styles,
        ...props.css
      }} style={style}>
        {children}
      </Button>
    </Link>
  )
}

const MenuButtonUI = styled(Button)`
  width: 100%;
  justify-content: center;
`

const ResponsiveMenu = styled.div`
  position: fixed;
  top: 0;
  right: 0;
  width: 300px;
  max-width: 100vw;
  height: 100vh;
  overflow-y: auto;
  z-index: 100;
  padding: 12px;
  background: var(--backgroundColor);
  border-left: 1px solid var(--textSuperLowOpacity);
  box-shadow: -4px 0 24px rgba(0,0,0,0.3);
`
