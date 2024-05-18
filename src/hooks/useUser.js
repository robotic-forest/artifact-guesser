import { useEffect } from "react"
import Router from "next/router"
import useSWR, { useSWRConfig } from "swr"
import axios from "axios"
import { delabelize } from "@/lib/utils"
import toast from "react-hot-toast"

// How to use:
// const { user } = useUser({ redirectTo: "/login" })

export default function useUser({
  redirectTo = "",
  redirectIfFound = false,
  roles
} = {}) {
  const { mutate } = useSWRConfig()
  const { data: user } = useSWR("/api/user")

  useEffect(() => {
    // if no redirect needed, just return (example: already on /dashboard)
    // if user data not yet there (fetch in progress, logged in or not) then don't do anything yet
    if (!redirectTo || !user) return

    if (
      // If redirectTo is set, redirect if the user was not found.
      (redirectTo && !redirectIfFound && !user?.isLoggedIn) ||
      // If redirectIfFound is also set, redirect if the user was found
      (redirectIfFound && user?.isLoggedIn)
    ) {
      Router.push(redirectTo)
    }

    // role-based redirect
    if (user?.isLoggedIn && roles && !roles.includes(user?.role)) Router.push(redirectTo || '/')
  }, [user, redirectIfFound, redirectTo])

  const refetch = () => mutate("/api/user")

  const logout = () => {
    axios.post('/api/logout').then(res => {
      if (res.data.success) {
        toast.success('Logged out successfully.')
        refetch()
      }
    })
  }

  const updateUser = async data => {
    await axios.post(`/api/accounts/edit`, delabelize({
      _id: user._id,
      ...data
    }))
    mutate("/api/user", { ...user, ...data })
  }

  const isAdmin = user?.role === 'Admin'

  const loading = !user?.isLoggedIn || (roles && !roles.includes(user?.role))

  return { user, loading, updateUser, isAdmin, logout, refetch }
}