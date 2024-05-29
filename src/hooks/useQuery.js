import { useRouter } from "next/router"

export const useQuery = () => {
  const router = useRouter()
  const searchParams = process.browser && new URLSearchParams(window.location.search)

  const query = searchParams && Object.fromEntries(searchParams.entries())
  
  // if any value in query === 'true' or 'false', convert to boolean
  Object.keys(query).forEach(key => {
    if (query[key] === 'true') query[key] = true
    if (query[key] === 'false') query[key] = false
  })

  const setQuery = (nq) => {
    const id = nq?.id || router?.query?.id

    // make sure new query has id for this to work
    if (!router.pathname.includes('[id]') || id) {
      router.replace({ query: { ...nq, ...(id ? { id } : {}) } }, undefined, { shallow: true })
    }
  }

  return { query, setQuery, ...processQuery(query) }
}

// util: extract metadata like sort, page, limit from query
const processQuery = query => {
  const filter = query && Object.keys(query).reduce((acc, key) => {
    if (!key.startsWith('__')) acc[key] = query[key]
    return acc
  }, {})

  const meta = query && Object.keys(query).reduce((acc, key) => {
    if (key.startsWith('__')) acc[key] = query[key]
    return acc
  }, {})

  return { filter, meta }
}