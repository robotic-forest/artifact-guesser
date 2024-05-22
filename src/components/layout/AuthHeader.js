import { useState } from "react"
import { LoginDialog } from "@/components/dialogs/LoginDialog"
import useUser from "@/hooks/useUser"
import { SignupDialog } from "@/components/dialogs/SignupDialog"
import { FaUser } from "react-icons/fa"
import { IconButton } from "@/components/buttons/IconButton"
import { GrLogout } from "react-icons/gr"
import Link from "next/link"
import { MdDashboard } from "react-icons/md"
import { GameButton } from "../buttons/GameButton"

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
            <div className='bg-black p-[1px_6px] rounded-[4px] mr-1.5 flex items-center min-h-[22px]'>
              <FaUser className='text-xs' />
              <span css={{
                '@media (max-width: 800px)': { display: 'none' },
                marginLeft: 6
              }}>
                {user.username}
              </span>
            </div>
            {isAdmin && (
              <Link href='/dashboard'>
                <IconButton size={22} css={{ marginRight: 6 }}>
                  <MdDashboard />
                </IconButton>
              </Link>
            )}
            <IconButton size={22} iconSize={10} onClick={() => logout()}>
              <GrLogout />
            </IconButton>
          </>
        )}
        {!user?.isLoggedIn && (
          <>
            <GameButton onClick={() => setLoginOpen(true)}>
              Log in
            </GameButton>
            <GameButton onClick={() => setSignupOpen(true)} css={{ marginLeft: 4 }}>
              Sign Up
            </GameButton>
          </>
        )}
      </div>
    </>
  )
}