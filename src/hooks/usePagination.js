import { useEffect, useState } from "react"
import useSWR from "swr"
import { useQuery } from "./useQuery"

const pageSizes = [10, 20, 50, 100]

export const usePagination = ({ url, options }) => {
  const { query, setQuery } = useQuery()

  const [sPage, setSPage] = useState(1)
  const [sPerPage, setSPerPage] = useState(options?.defaultPageSize || 20)

  const page = options?.stateFilter ? sPage : (query?.__page || 1)
  
  const onChangePage = options?.stateFilter
    ? p => setSPage(p)
    : p => setQuery({ ...query, __page: p })


  const perPage = options?.stateFilter
    ? sPerPage
    : query?.__per_page || options?.defaultPageSize || 20

  const onChangeRowsPerPage = options?.stateFilter
    ? (pp, p) => { setSPerPage(pp); setSPage(p) }
    : (pp, p) => setQuery({ ...query, __per_page: pp, __page: p })

  const { data, mutate } = useSWR(url && `${url}&page=${page}&per_page=${perPage}`)

  const [totalRows, setTotalRows] = useState(0)
  useEffect(() => { data?.total && setTotalRows(data.total) }, [data])

  return {
    data: data?.data,
    mutate,
    pagination: {
      progressPending: !data,
      pagination: true,
      paginationServer: true,
      paginationTotalRows: totalRows,
      onChangePage,
      onChangeRowsPerPage,
      paginationRowsPerPageOptions: Array.from(new Set([...pageSizes, options?.defaultPageSize]))
        .filter(n => !isNaN(n))
        .sort((a, b) => a - b),
      paginationPerPage: perPage,
      paginationDefaultPage: page,
    }
  }
}