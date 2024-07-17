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
import { dashbaordTheme } from "@/pages/dashboard"
import { SignupDialog } from "@/components/dialogs/SignupDialog"
import { LoginDialog } from "@/components/dialogs/LoginDialog"
import { PiRedditLogoFill } from "react-icons/pi"
import { TbPigMoney } from "react-icons/tb"

export const MobileNav = ({ user, isAdmin, logout }) => {
  const [open, setOpen] = useState(false)
  const [loginOpen, setLoginOpen] = useState(false)
  const [signupOpen, setSignupOpen] = useState(false)

  const game = process.browser && localStorage.getItem('game')

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

      {user && !user?.isLoggedIn && !open && !loginOpen && !signupOpen && (
        <div className='fixed bottom-1 right-1 p-2' css={{ zIndex: 99 }}>
          <Link href='/' css={{ '&:hover': { color: 'var(--textColor)'}, width: '100%', maxWidth: 400 }}>
            <Button tooltip='Resume Game' css={{
              background: '#000000',
              color: '#ffffff',
              '&:hover': {
                background: '#ffffff',
                color: '#000000',
              }
            }}>
              <GiGreekSphinx className='mr-2' />
              {game ? 'Resume' : 'Play'} Game
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
                    <MenuButton theme={theme} url='/'>
                      <GiGreekSphinx className='mr-2' />
                      {game ? 'Resume' : 'Play'} Game
                    </MenuButton>
                    {isAdmin && (
                      <MenuButton theme={dashbaordTheme} url='/dashboard'>
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
                      url='/support'
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
                    <MenuButton theme={artifactsTheme} url='/artifacts?imageMode=true'>
                      <GiAmphora className='mr-2' />
                      Artifacts DB
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
                      url='/support'
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
                  <MenuButtonUI variant='outlined' onClick={() => { setOpen(false); setLoginOpen(true)}}>
                    Log in
                  </MenuButtonUI>
                  <MenuButtonUI
                    onClick={() => { setOpen(false); setSignupOpen(true) }}
                    css={{
                      background: '#E4C1F4',
                      color: '#000000',
                      ':hover': { background: '#CCA5DE' }
                    }}
                  >
                    <b>Sign Up</b>
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

export const MenuButton = p => (
  <Link href={p.url} target={p.target} css={{ width: '100%', ...(p.style || {}) }}>
    <MenuButtonUI {...p} />
  </Link>
)

const MenuButtonUI = ({ theme, children, ...props }) => {
  const styles = theme && css`
    ${themeCSS(theme)}
    background-color: var(--backgroundColor);
    color: var(--textColor);
    min-width: 100%;
  `

  return (
    <Button {...props} color={theme?.backgroundColor} css={{
      ...styles,
      ...props.css,
      minWidth: '100%'
    }}>
      {children}
    </Button>
  )
}

const ResponsiveMenu = ({ children, onClose, style }) => {
  return (
    <DropDownContainer css={style}>
      <div className='bg' onClick={onClose} />
      <div className='menu'>
        {children}
      </div>
    </DropDownContainer>
  )
}

const DropDownContainer = styled.div`
  position: fixed;
  top: 0;
  opacity: 1;
  animation: fadeIn 0.2s;
  z-index: 1098;
  color: var(--textColor);

  @media (min-width: 600px) {
    right: 336px;
  }

  @keyframes fadeIn {
    0%   { opacity: 0 }
    100% { opacity: 1 }
  }

  @keyframes slideUp {
    0%   { top: 12px; }
    100% { top: 0px; }
  }

  & > .bg {
    height: 100vh;
    width: 100vw !important;
    z-index: 1099;
    top: 0;
    left: 0;
    position: fixed;
    background: var(--backgroundLowOpacity);
  }

  & > .menu {
    width: 320px;

    @media (max-width: 600px) {
      width: calc(100vw - 16px)
    }

    border: 1px solid var(--textVeryLowOpacity);
    background: var(--backgroundColor);
    border-radius: 5px;
    position: absolute;
    z-index: 1100;
    top: 0px;
    margin: 8px;
    padding: 8px;

    box-shadow: 0 10px 20px -5px var(--textSuperLowOpacity);

    animation: slideUp 0.1s;
  }
`