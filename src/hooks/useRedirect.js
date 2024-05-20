import { useRouter } from "next/router"
import { useEffect } from "react"
import useUser from "./useUser"

// args
// path: string - the path to redirect to
// condition: boolean - the condition to redirect on
export const useRedirect = args => {
  const { user } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (user && !user.isLoggedIn && (args?.exempt && (router.pathname === '/' || !args?.exempt.some(p => router.pathname.includes(p))))) router.push('/login')
    if (args?.condition) router.push(args?.path || '/')
    if (user && args?.roles && !args.roles.includes(user?.role)) router.push(args?.path || '/')
  }, [user])

  const loading = !user?.isLoggedIn || (args?.roles && !args.roles.includes(user?.role))

  return { user, loading }
}