import Head from "next/head"
import { IconButton } from "../buttons/IconButton"
import { MdDashboard } from "react-icons/md"
import { GiAbstract042, GiAmphora, GiGreekSphinx } from "react-icons/gi"
import Link from "next/link"
import useUser from "@/hooks/useUser"
import { GrLogout } from "react-icons/gr"
import { FaHeart, FaUser } from "react-icons/fa"
import { css } from "@emotion/react"
import { themeCSS } from "../GlobalStyles"
import { dashbaordTheme } from "@/pages/dashboard"
import { artifactsTheme } from "@/pages/artifacts"
import { gamesTheme } from "@/pages/games"
import { accountTheme } from "@/pages/accounts"
import { ResumeGameButton } from "./components/ResumeGameButton"

export const Layout = ({ title, theme, children }) => {
  const { logout, user } = useUser()

  const styles = theme && css`
    ${themeCSS(theme)}
    background-color: var(--backgroundColor);
    color: var(--textColor);
    font-size: var(--fs);

    body, html {
      background-color: var(--backgroundColor);
      color: var(--textColor);
      font-size: var(--fs);
    }
  `

  return (
    <>
      <Head>
        <title>{title || 'Artifact Guesser'}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div className='flex w-[100%]' css={styles}>
        {user?.isLoggedIn && (
          <div className='sticky top-0 h-[100vh] min-h-[100vh] flex flex-col justify-between items-center' css={{
            background: 'var(--backgroundColorSlightlyLight)',
          }}>
            <div className=' flex flex-col items-center p-2 z-50'>
              <ResumeGameButton className='mt-1.5 mb-6' />
              <Link href='/dashboard' css={{ '&:hover': { color: 'var(--textColor)'} }}>
                <MenuButton tooltip='Dashboard' className='mb-3' theme={dashbaordTheme}>
                  <MdDashboard />
                </MenuButton>
              </Link>
              <Link href='/artifacts' css={{ '&:hover': { color: 'var(--textColor)'} }}>
                <MenuButton tooltip='Artifact Database' className='mb-3' theme={artifactsTheme}>
                  <GiAmphora />
                </MenuButton>
              </Link>
              <Link href='/games' css={{ '&:hover': { color: 'var(--textColor)'} }}>
                <MenuButton tooltip='Games' className='mb-3' theme={gamesTheme}>
                  <GiAbstract042 />
                </MenuButton>
              </Link>
              <Link href='/accounts' css={{ '&:hover': { color: 'var(--textColor)'} }}>
                <MenuButton tooltip='Accounts' className='mb-3' theme={accountTheme}>
                  <FaUser className='text-xs' />
                </MenuButton>
              </Link>
            </div>
            <div className='p-2 flex flex-col justify-between items-center'>
              <Link href='/favorites' css={{ '&:hover': { color: 'var(--textColor)'} }}>
                <MenuButton tooltip='Favorites' className='mb-3' theme={artifactsTheme}>
                  <FaHeart color='#ff4f4f' />
                </MenuButton>
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
        }}>
          {children}
        </div>
      </div>
    </>
  )
}

export const MenuButton = ({ theme, children, ...props }) => {
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