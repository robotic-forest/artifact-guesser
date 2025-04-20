import useSWR from "swr"

export const useHighscore = args => {
  const { data } = useSWR(!args?.skip && '/api/highscore')
  
  return {
    highscore: data?.highscore,
    prevHighscore: data?.prevHighscore,
    gameId: data?.gameId
  }
}