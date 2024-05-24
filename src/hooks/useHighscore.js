import useSWR from "swr"

export const useHighscore = () => {
  const { data } = useSWR('/api/highscore')
  return {
    highscore: data?.highscore,
    gameId: data?.gameId
  }
}