import useSWR, { useSWRConfig } from 'swr'
import { useSort } from "../useSort"
import { usePagination } from "../usePagination"

export const useGames = args => {
  const { mutate: mutateAll } = useSWRConfig()
  const sort = useSort(args?.sort)

  let apiUrl = args?.stats
    ? `/api/games/stats?filter=${JSON.stringify(args?.filter)}`
    : `/api/games?filter=${JSON.stringify(args?.filter)}`
    
  if (args?.sort) apiUrl += sort.url
  
  const mutate = async () => mutateAll(apiUrl)

  if (args?.paginate) {
    const swr = usePagination({ url: args?.skip ? null : apiUrl, options: args?.paginate })
    return { sort, ...swr, games: swr.data, mutate: swr.mutate }
  } else {
    const { data } = useSWR(!args?.skip && apiUrl)
    return { sort, games: data?.data, mutate }
  }
}