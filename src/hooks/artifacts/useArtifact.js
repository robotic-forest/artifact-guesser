import { delabelize } from '@/lib/utils'
import axios from 'axios'
import useSWR, { mutate } from 'swr'
import { useUrl } from '../useUrl'

export const useArtifact = args => {
  const { entityId } = useUrl()

  const url = `/api/artifacts/${args?._id || entityId}` + (args?.include ? `?include=${args?.include?.join(',')}` : '')

  const { data, isValidating, ...swr } = useSWR(!args?.skip && !args?.artifact && url)

  const artifact = args?.artifact || data

  const updateArtifact = async data => {
    if (!artifact) return console.error('No artifact to update')

    await axios.post(`/api/artifacts/${artifact._id}/edit`, delabelize(data))

    mutate(url)
  }

  const loading = isValidating && !artifact

  return { artifact, updateArtifact, loading, ...swr }
}