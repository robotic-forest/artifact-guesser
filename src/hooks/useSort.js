import { VscTriangleUp } from "react-icons/vsc"
import { useQuery } from "./useQuery"

// args: { default: { field: direction } }
export const useSort = args => {
  const { query, setQuery } = useQuery()
  const hasSort = query?.__sortfield && query?.__sortdirection

  const sort = hasSort ? { [query.__sortfield]: parseInt(query.__sortdirection) } : args?.default
  const setSort = newSort => {
    if (Object.keys(newSort).length === 0) return

    setQuery({
      ...query,
      __sortfield: Object.keys(newSort)[0],
      __sortdirection: Object.values(newSort)[0]
    })
  }

  const url = sort ? `&sort=${JSON.stringify(sort)}` : ''
  const sortProps = {
    onSort: (field, direction) => setSort({ [field.sortField]: direction === 'asc' ? 1 : -1 }),
    sortIcon: <VscTriangleUp css={{ marginLeft: 8, position: 'relative', top: 1.5 }} />,
    sortServer: true
  }

  if (hasSort) {
    sortProps.defaultSortAsc = parseInt(query?.__sortdirection) === 1
    sortProps.defaultSortFieldId = query?.__sortfield
  } else if (args?.default) {
    sortProps.defaultSortAsc = Object.values(args.default)[0] === 1
    sortProps.defaultSortFieldId = args?.fieldId
  }

  return { url, ...sortProps }
}