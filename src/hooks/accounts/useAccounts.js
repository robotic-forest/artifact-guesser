import { usePagination } from '@/hooks/usePagination'
import { useSort } from '@/hooks/useSort'
import axios from 'axios'
import toast from 'react-hot-toast'
import useSWR from 'swr'

export const useAccounts = args => {
  const sort = useSort(args?.sort)

  let apiUrl = args?.stats
  ? `/api/accounts/stats`
  : `/api/accounts?filter=${JSON.stringify(args.filter)}`

  if (args?.sort) apiUrl += sort.url

  if (args?.paginate) {
    const swr = usePagination({ url: apiUrl, options: args?.paginate })
    return { sort, accounts: swr.data, ...swr }
  }

  const { data, isValidating, ...swr } = useSWR(!args?.skip && apiUrl)
  const loading = isValidating && !data?.data

  const sendEmail = async ({ message, subject, test }) => {
    const res = await axios.post('/api/accounts/email', { message, subject, test })
    if (res.success) toast.success('Email sent!')
  }

  return { accounts: data, sendEmail, loading, ...swr }
}