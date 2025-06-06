import Head from "next/head"
import { IconButton } from "../buttons/IconButton"
import { MdDashboard } from "react-icons/md"
import { GiAbstract034, GiAmphora, GiGreekSphinx } from "react-icons/gi"
import Link from "next/link"
import useUser from "@/hooks/useUser"
import { GrLogout } from "react-icons/gr"
import { FaHeart, FaUser } from "react-icons/fa"
import { css } from "@emotion/react"
import { createStyles, themeCSS } from "../GlobalStyles"
import { dashboardTheme } from "@/pages/dashboard"
import { artifactsTheme } from "@/pages/artifacts"
import { gamesTheme } from "@/pages/games"
import { accountTheme } from "@/pages/accounts"
import { ResumeGameButton } from "./components/ResumeGameButton"
import { useRouter } from "next/router"
import { useTheme } from "@/pages/_app"
import { MobileNav } from "./components/MobileNav"
import { BsDiscord } from "react-icons/bs"
import { BiQuestionMark } from "react-icons/bi"
import { PiRedditLogoFill } from "react-icons/pi"
import { TbPigMoney } from "react-icons/tb"

export const Layout = ({ title, theme, children, contentCSS, noNav }) => {
  const u = useUser()
  const { logout, user, isAdmin } = u
  const router = useRouter()
  useTheme(theme)

  const noauthroutes = ['/', '/artifacts', '/about', '/games/[id]', '/artifacts/[id]', '/moloch']
  if (user && !user.isLoggedIn && !noauthroutes.includes(router.pathname)) router.push('/')

  return (
    <>
      <Head>
        <title>{title || 'Artifact Guesser'}</title>
        <meta name="viewport" content="initial-scale=1.0, maximum-scale=1, width=device-width" />
      </Head>
      <div className='relative flex w-[100%] min-h-[100vh]' css={createStyles(theme)}>
        {/* Mobile Menu */}
        <MobileNav {...u} />

        {/* Desktop Menu */}
        {user?.isLoggedIn && !noNav && (
          <div className='sticky top-0 h-[100vh] min-h-[100vh] flex flex-col justify-between items-center' css={{
            background: 'var(--backgroundColorSlightlyLight)',
            '@media (max-width: 600px)': {
              display: 'none'
            }
          }}>
            <div className=' flex flex-col items-center p-2 z-50'>
              <ResumeGameButton className='mt-1.5 mb-6' />
              {isAdmin && (
                <Link href='/dashboard' css={{ '&:hover': { color: 'var(--textColor)'} }}>
                  <MenuIconButton tooltip='Dashboard' className='mb-3' theme={dashboardTheme}>
                    <MdDashboard />
                  </MenuIconButton>
                </Link>
              )}
              <Link href='/artifacts' css={{ '&:hover': { color: 'var(--textColor)'} }}>
                <MenuIconButton tooltip='Artifact Database' className='mb-3' theme={artifactsTheme}>
                  <GiAmphora />
                </MenuIconButton>
              </Link>
              <Link href='/games?__sortfield=startedAt&__sortdirection=-1' css={{ '&:hover': { color: 'var(--textColor)'} }}>
                <MenuIconButton tooltip={isAdmin ? 'Games' : 'Played Games'} className='mb-3' theme={gamesTheme}>
                  <GiAbstract034 />
                </MenuIconButton>
              </Link>
              {isAdmin && (
                <Link href='/accounts' css={{ '&:hover': { color: 'var(--textColor)'} }}>
                  <MenuIconButton tooltip='Accounts' className='mb-3' theme={accountTheme}>
                    <FaUser className='text-xs' />
                  </MenuIconButton>
                </Link>
              )}
              <Link href='/about' css={{ '&:hover': { color: 'var(--textColor)'} }}>
                <MenuIconButton tooltip='About' className='mb-3' css={{
                  background: 'var(--primaryColor)',
                  '&:hover': {
                    background: 'var(--primaryColorDark)',
                  }
                }}>
                  <BiQuestionMark />
                </MenuIconButton>
              </Link>
              <Link
                href='https://ko-fi.com/protocodex'
                css={{ '&:hover': { color: 'var(--textColor)'} }}
              >
                <MenuIconButton
                  tooltip='Support'
                  className='mb-3'
                  theme={{
                    backgroundColor: '#e7ba56',
                    primaryColor: '#e7ba56',
                    textColor: 'black'
                  }} 
                >
                  <TbPigMoney className='text-sm' />
                </MenuIconButton>
              </Link>
              <Link
                href='https://reddit.com/r/artifactguesser'
                css={{ '&:hover': { color: 'var(--textColor)'} }}
                target='_blank'
              >
                <MenuIconButton
                  tooltip='r/artifactguesser'
                  className='mb-3'
                  theme={{ backgroundColor: '#ed6330', primaryColor: '#ed6330', textColor: 'white' }}
                >
                  <PiRedditLogoFill className='text-sm' />
                </MenuIconButton>
              </Link>
              {!isAdmin && (
                <Link href='https://discord.gg/MvkqPTdcwm' css={{ '&:hover': { color: 'var(--textColor)'} }}>
                  <MenuIconButton tooltip='Join Discord' className='mb-3' theme={{
                    backgroundColor: '#5562ea',
                    primaryColor: '#5562ea',
                    textColor: '#ffffff',
                  }}>
                    <BsDiscord className='text-xs' />
                  </MenuIconButton>
                </Link>
              )}
            </div>
            <div className='p-2 flex flex-col justify-between items-center'>
              <Link href='/favorites' css={{ '&:hover': { color: 'var(--textColor)'} }}>
                <MenuIconButton tooltip='Favorites' className='mb-3' theme={artifactsTheme}>
                  <FaHeart color='#ff4f4f' className='text-sm' />
                </MenuIconButton>
              </Link>
              <IconButton onClick={logout} tooltip='Logout'>
                <GrLogout />
              </IconButton>
            </div>
          </div>
        )}
        <div className='relative p-3' css={{
          flexGrow: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          ...contentCSS
        }}>
          {children}
        </div>
      </div>
    </>
  )
}

export const MenuIconButton = ({ theme, children, ...props }) => {
  const styles = theme && css`
    ${themeCSS(theme)}
    background-color: var(--backgroundColor);
    color: var(--textColor);
    font-size: var(--fs);
  `

  return (
    <IconButton {...props} css={{ ...styles, ...props.css }}>
      {children}
    </IconButton>
  )
}