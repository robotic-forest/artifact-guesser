import axios from "axios"
import toast from "react-hot-toast"
import useSWR, { useSWRConfig } from 'swr'
import { useSort } from "../useSort"
import { usePagination } from "../usePagination"

export const useArtifacts = args => {
  const { mutate: mutateAll } = useSWRConfig()
  const sort = useSort(args?.sort)

  let apiUrl = args?.total
    ? `/api/artifacts/total`
    : `/api/artifacts?filter=${JSON.stringify(args?.filter)}`
    
  if (args?.sort) apiUrl += sort.url
  
  const mutate = async () => mutateAll(apiUrl)

  const createArtifact = async object => {
    const res = await axios.post('/api/artifacts/new', object)
    if (res?.data?.success) toast.success('Artifact created')
    return true
  }

  if (args?.paginate) {
    const swr = usePagination({ url: args?.skip ? null : apiUrl, options: args?.paginate })
    return { sort, ...swr, artifacts: swr.data, mutate: swr.mutate, createArtifact }
  } else {
    const { data } = useSWR(!args?.skip && apiUrl)
    return { sort, artifacts: data?.data, mutate, createArtifact }
  }
}