import { useState } from "react"
import { Button } from "@/components/buttons/Button"
import { LoginDialog } from "@/components/dialogs/LoginDialog"
import useUser from "@/hooks/useUser"
import { SignupDialog } from "@/components/dialogs/SignupDialog"
import { FaUser } from "react-icons/fa"
import { IconButton } from "@/components/buttons/IconButton"
import { GrLogout, GrMenu } from "react-icons/gr"
import { Dropdown } from "../dropdown/Dropdown"
import { useRouter } from "next/router"

export const AuthHeader = () => {
  const router = useRouter()
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
            {isAdmin && (
              <Dropdown
                top={4}
                button={
                  <IconButton size={22} css={{ marginRight: 4 }}>
                    <GrMenu />
                  </IconButton>
                }
                menuButtons={[
                  { contents: 'Dashboard', onClick: () => router.push('/dashboard') }
                ]}
                dropdownStyle={{
                  width: 120
                }}
              />
            )}
            <div className='bg-black p-[1px_6px] rounded-[4px] mr-1 flex items-center'>
              <FaUser className='text-xs mr-2' />
              {user.username}
            </div>
            <IconButton size={22} iconSize={10} onClick={() => logout()}>
              <GrLogout />
            </IconButton>
          </>
        )}
        {!user?.isLoggedIn && (
          <>
            <Button onClick={() => setLoginOpen(true)}>
              Log in
            </Button>
            <Button onClick={() => setSignupOpen(true)} css={{ marginLeft: 4 }}>
              Sign Up
            </Button>
          </>
        )}
      </div>
    </>
  )
}