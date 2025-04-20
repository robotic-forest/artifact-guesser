import useSWR from "swr"

export const useHighscores = ({ mode, timer, rounds }) => {
  // Construct the query string only with provided parameters
  const queryParams = new URLSearchParams()
  if (mode) queryParams.set('mode', mode)
  if (timer) queryParams.set('timer', timer)
  if (rounds) queryParams.set('rounds', rounds)

  const queryString = queryParams.toString()
  const apiUrl = `/api/games/highscores${queryString ? `?${queryString}` : ''}`

  const { data } = useSWR(apiUrl)
  return data
}
