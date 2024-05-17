import { useState } from "react"
import { Button } from "@/components/buttons/Button"
import { LoginDialog } from "@/components/dialogs/LoginDialog"
import useUser from "@/hooks/useUser"
import { SignupDialog } from "@/components/dialogs/SignupDialog"
import { FaUser } from "react-icons/fa"
import { IconButton } from "@/components/buttons/IconButton"
import { GrLogout } from "react-icons/gr"

export const AuthHeader = () => {
  const { user, logout } = useUser()

  const [loginOpen, setLoginOpen] = useState(false)
  const [signupOpen, setSignupOpen] = useState(false)

  return !user ? null : (
    <>
      <SignupDialog open={signupOpen} onClose={() => setSignupOpen(false)} />
      <LoginDialog open={loginOpen} onClose={() => setLoginOpen(false)} />
      <div className='fixed flex items-center m-1 top-0 right-0 z-10 text-sm'>
        {user?.isLoggedIn && (
          <div className='bg-black p-[1px_5px] rounded-[4px] mr-1 flex items-center'>
            <FaUser className='mr-2' />
            {user.username}
          </div>
        )}
        {user?.isLoggedIn ? (
          <IconButton onClick={() => logout()}>
            <GrLogout />
          </IconButton>
        ) : (
          <Button onClick={() => setLoginOpen(true)}>
            Log in
          </Button>
        )}
        {!user?.isLoggedIn && (
          <Button onClick={() => setSignupOpen(true)} css={{ marginLeft: 4 }}>
            Sign Up
          </Button>
        )}
      </div>
    </>
  )
}