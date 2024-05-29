import useSWR from "swr"

export const useHighscores = () => {
  const { data } = useSWR('/api/games/top')
  return data
}