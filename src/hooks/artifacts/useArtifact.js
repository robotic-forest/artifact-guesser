import { delabelize } from '@/lib/utils'
import axios from 'axios'
import useSWR, { mutate } from 'swr'
import { useUrl } from '../useUrl'

export const useArtifact = args => {
  const { entity, entityId } = useUrl()

  const url = `/api/artifacts/${args?._id || entityId}` + (args?.include ? `?include=${args?.include?.join(',')}` : '')

  const { data: artifact, isValidating, ...swr } = useSWR(!args?.skip && url)

  if (entity !== 'artifacts' && !args?._id) return { artifact: null, mutate: null }

  const updateArtifact = async data => {
    await axios.post(`/api/artifacts/edit`, delabelize({
      _id: artifact?._id,
      ...data
    }))

    mutate(url)
  }

  const loading = isValidating && !artifact

  return { artifact, updateArtifact, loading, ...swr }
}