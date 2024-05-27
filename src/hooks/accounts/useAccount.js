import { delabelize } from '@/lib/utils'
import axios from 'axios'
import useSWR, { mutate } from 'swr'
import { useUrl } from '../useUrl'

export const useAccount = args => {
  const { entity, entityId } = useUrl()

  const url = `/api/accounts/${args?._id || entityId}` + (args?.include ? `?include=${args?.include?.join(',')}` : '')

  const { data: account, isValidating, ...swr } = useSWR(!args?.skip && url)

  if (entity !== 'accounts' && !args?._id) return { account: null, mutate: null }

  const updateAccount = async data => {
    await axios.post(`/api/accounts/edit`, delabelize({
      _id: account?._id,
      ...data
    }))

    mutate(url)
  }

  const loading = isValidating && !account

  return { account, updateAccount, loading, ...swr }
}