import useSWR from 'swr'

export const useActiveRun = () => {
  const { data } = useSWR('/api/active-run', { revalidateOnFocus: true })
  return {
    kind: data?.kind || null,
    url: data?.url || '/',
  }
}
