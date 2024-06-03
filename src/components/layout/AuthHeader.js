import { useState } from "react"
import { LoginDialog } from "@/components/dialogs/LoginDialog"
import useUser from "@/hooks/useUser"
import { SignupDialog } from "@/components/dialogs/SignupDialog"
import { FaHeart, FaUser } from "react-icons/fa"
import { IconButton } from "@/components/buttons/IconButton"
import { GrLogout } from "react-icons/gr"
import Link from "next/link"
import { MdDashboard } from "react-icons/md"
import { GameButton } from "../buttons/GameButton"
import { IconGenerator } from "../art/IconGenerator"
import { MenuIconButton } from "./Layout"
import { GiAbstract034 } from "react-icons/gi"
import { gamesTheme } from "@/pages/games"

export const AuthHeader = () => {
  const { user, isAdmin, logout } = useUser()
  const [loginOpen, setLoginOpen] = useState(false)
  const [signupOpen, setSignupOpen] = useState(false)

  return !user ? null : (
    <>
      <SignupDialog open={signupOpen} onClose={() => setSignupOpen(false)} />
      <LoginDialog open={loginOpen} onClose={() => setLoginOpen(false)} />
      <div className='fixed flex items-center m-1 top-0 right-0 z-10 text-sm'>
        {user?.isLoggedIn && (
          <>
            <div className='bg-black p-[1px_6px] rounded-[4px] mr-1 flex items-center min-h-[22px]'
              css={{ '@media (max-width: 800px)': { display: 'none' } }}
            >
              <IconGenerator />
              <span css={{ marginLeft: 6 }}>
                {user.username}
              </span>
            </div>
            {isAdmin && (
              <Link href='/dashboard' css={{ '&:hover': { color: 'var(--textColor)'} }}>
                <IconButton
                  css={{
                    marginRight: 4,
                    '&:hover': { background: 'var(--backgroundColorLight2)' },
                    border: '1px solid #ffffff99'
                  }}
                >
                  <MdDashboard />
                </IconButton>
              </Link>
            )}
            <Link href='/favorites'>
              <IconButton
                iconSize={10}
                css={{
                  marginRight: 4,
                  '&:hover': { background: 'var(--backgroundColorLight2)' },
                  border: '1px solid #ff7c7c99'
                }}
                tooltip='Favorites'
                tooltipPlace='bottom'
              >
                <FaHeart color='#ff7c7c' />
              </IconButton>
            </Link>
            <Link href='/games?__sortfield=startedAt&__sortdirection=-1' css={{ '&:hover': { color: 'var(--textColor)'} }}>
              <MenuIconButton
                tooltip={isAdmin ? 'Games' : 'Played Games'}
                tooltipPlace='bottom'
                css={{
                  marginRight: 4,
                  border: '1px solid #ffffff66'
                }}
                theme={gamesTheme}
              >
                <GiAbstract034 />
              </MenuIconButton>
            </Link>
            <IconButton
              iconSize={10}
              onClick={() => logout()}
              css={{
                '&:hover': { background: 'var(--backgroundColorLight2)' },
                border: '1px solid #ffffff66'
              }}
            >
              <GrLogout />
            </IconButton>
          </>
        )}
        {!user?.isLoggedIn && (
          <>
            <GameButton onClick={() => setLoginOpen(true)}>
              Log in
            </GameButton>
            <GameButton
              onClick={() => setSignupOpen(true)}
              css={{
                marginLeft: 4,
                background: '#E4C1F4',
                color: '#000000',
                ':hover': { background: '#CCA5DE' }
              }}
            >
              <b>Sign Up</b>
            </GameButton>
          </>
        )}
      </div>
    </>
  )
}