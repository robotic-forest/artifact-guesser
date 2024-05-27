import useSWR from 'swr'
import { useUrl } from '../useUrl'

export const usePlayedGame = args => {
  const { entity, entityId } = useUrl()

  const url = `/api/games/${args?._id || entityId}`

  const { data: game, isValidating, ...swr } = useSWR(!args?.skip && url)

  if (entity !== 'games' && !args?._id) return { game: null, mutate: null }

  const loading = isValidating && !game

  return { game, loading, ...swr }
}