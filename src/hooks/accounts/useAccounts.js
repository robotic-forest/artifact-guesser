import { usePagination } from '@/hooks/usePagination'
import { useSort } from '@/hooks/useSort'
import useSWR from 'swr'

export const useAccounts = args => {
  const sort = useSort(args?.sort)

  let apiUrl = args?.total
  ? `/api/accounts/total`
  : `/api/accounts?filter=${JSON.stringify(args.filter)}`

  if (args?.sort) apiUrl += sort.url

  if (args?.paginate) {
    const swr = usePagination({ url: apiUrl, options: args?.paginate })
    return { sort, accounts: swr.data, ...swr }
  }

  const { data, isValidating, ...swr } = useSWR(!args?.skip && apiUrl)
  const loading = isValidating && !data?.data

  return { accounts: data, loading, ...swr }
}