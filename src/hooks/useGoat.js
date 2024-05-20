import useSWR from "swr"

export const useGoat = ({ path, params }) => {
  const url = `api/goatcounter?args=${JSON.stringify({ path, params })}`
  const { data } = useSWR(url)
  
  return data
}