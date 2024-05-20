import Head from "next/head"
import { IconButton } from "../buttons/IconButton"
import { MdDashboard } from "react-icons/md"
import { GiAbstract042, GiAmphora, GiGreekSphinx } from "react-icons/gi"
import Link from "next/link"
import useUser from "@/hooks/useUser"
import { GrLogout } from "react-icons/gr"
import { FaUser } from "react-icons/fa"

export const Layout = ({ title, children }) => {
  const { logout } = useUser()

  return (
    <>
      <Head>
        <title>{title || 'Artifact Guesser'}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div className='flex w-[100vw]'>
        <div className='sticky top-0 h-screen flex flex-col justify-between items-center'>
            <div className=' flex flex-col items-center p-2 z-50'>
            <Link href='/' css={{ '&:hover': { color: 'var(--textColor)'} }}>
              <GiGreekSphinx className='mt-2 mb-6' />
            </Link>
            <Link href='/dashboard' css={{ '&:hover': { color: 'var(--textColor)'} }}>
              <IconButton tooltip='Dashboard' className='mb-3'>
                <MdDashboard />
              </IconButton>
            </Link>
            <Link href='/artifacts' css={{ '&:hover': { color: 'var(--textColor)'} }}>
              <IconButton tooltip='Artifacts' className='mb-3'>
                <GiAmphora />
              </IconButton>
            </Link>
            <Link href='/games' css={{ '&:hover': { color: 'var(--textColor)'} }}>
              <IconButton tooltip='Games' className='mb-3'>
                <GiAbstract042 />
              </IconButton>
            </Link>
            <Link href='/accounts' css={{ '&:hover': { color: 'var(--textColor)'} }}>
              <IconButton tooltip='Accounts' className='mb-3'>
                <FaUser className='text-xs' />
              </IconButton>
            </Link>
          </div>
          <div className='p-2'>
            <IconButton onClick={logout} tooltip='Logout'>
              <GrLogout />
            </IconButton>
          </div>
        </div>
        <div className='relative p-3' css={{
          flexGrow: 1
        }}>
          {children}
        </div>
      </div>
    </>
  )
}