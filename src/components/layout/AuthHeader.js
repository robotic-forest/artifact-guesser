import { useState, useContext } from "react" // Import useContext
import { useRouter } from "next/router" // Import useRouter
import { LoginDialog } from "@/components/dialogs/LoginDialog"
import useUser from "@/hooks/useUser"
import { SignupDialog } from "@/components/dialogs/SignupDialog"
import { useMultiplayer } from "@/components/multiplayer/context/MultiplayerContext"
import { FaHeart } from "react-icons/fa"
import { IconButton } from "@/components/buttons/IconButton"
import { GrLogout } from "react-icons/gr"
import Link from "next/link"
import { MdDashboard } from "react-icons/md"
import { GameButton } from "../buttons/GameButton"
import { IconGenerator } from "../art/IconGenerator"
import { MenuIconButton } from "./Layout"
import { GiAbstract034 } from "react-icons/gi"
import { gamesTheme } from "@/pages/games"

export const AuthHeader = ({ loginCss, signupCss }) => {
  const { user, isAdmin, logout } = useUser()
  const router = useRouter() // Get router object
  const { leaveLobby, currentLobbyId, _socket: socket } = useMultiplayer() // Get multiplayer context functions/state
  const [loginOpen, setLoginOpen] = useState(false)
  const [signupOpen, setSignupOpen] = useState(false)

  return !user ? null : (
    <>
      <SignupDialog open={signupOpen} onClose={() => setSignupOpen(false)} />
      <LoginDialog open={loginOpen} onClose={() => setLoginOpen(false)} />
      <div className='fixed flex items-center m-1 top-0 right-0 z-10 text-sm'>
        {user?.isLoggedIn && (
          <>
            <div className='p-[1px_6px] rounded-[4px] mr-1 flex items-center min-h-[22px]'
              css={{
                '@media (max-width: 800px)': { display: 'none' },
                background: 'var(--backgroundColorSlightlyLight)',
              }}
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
              onClick={() => {
                const handleLogout = () => {
                  // Emit the logout event to the server *before* leaving/logging out
                  if (socket) {
                    console.log('Emitting handle-logout to server...');
                    socket.emit('handle-logout');
                  } else {
                    console.warn('Socket not available when trying to emit handle-logout.');
                  }

                  const isOnLobbyPage = router.pathname.startsWith('/multiplayer/') && router.query.lobbyid;
                  const isInThisLobby = currentLobbyId === router.query.lobbyid;

                  if (isOnLobbyPage && isInThisLobby) {
                    console.log('Leaving lobby before logout...');
                    leaveLobby(); // Leave the lobby first
                    logout();     // Then logout
                    router.push('/multiplayer'); // Redirect to multiplayer index
                  } else {
                    logout(); // Standard logout if not in a lobby
                  }
                };

                // Check session storage if a game is active
                const isGameActive = sessionStorage.getItem('ag_gameActive') === 'true';
                if (isGameActive) {
                  // Show confirmation dialog
                  if (window.confirm('Are you sure you want to log out? This will forfeit your current game.')) {
                    // User confirmed, proceed with logout logic
                    handleLogout();
                  } else {
                    // User cancelled, do nothing
                    console.log('Logout cancelled by user.');
                  }
                } else {
                  // No active game, logout directly using the handleLogout logic
                  // (which will still emit if socket is available, though less critical here)
                  handleLogout();
                }
              }}
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
            <GameButton css={{ fontSize: '1.1em', padding: '2.45px 10px', ...loginCss }} onClick={() => setLoginOpen(true)}>
              Log in
            </GameButton>
            <GameButton
              onClick={() => setSignupOpen(true)}
              css={{
                marginLeft: 4,
                background: '#E4C1F4',
                color: '#000000',
                ':hover': { background: '#CCA5DE' },
                fontSize: '1.1em', padding: '2.45px 10px',
                ...signupCss
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
