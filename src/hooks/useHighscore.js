import useSWR from "swr"

export const useHighscore = () => {
  const { data } = useSWR('/api/highscore')
  return {
    highscore: data?.highscore,
    prevHighscore: data?.prevHighscore,
    gameId: data?.gameId
  }
}