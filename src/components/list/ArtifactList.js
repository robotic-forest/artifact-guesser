import { formatLoaction, formatTime } from "@/lib/artifactUtils"
import { DataTable } from "../datatable/DataTable"
import FilterBar, { useFilter } from "../datatable/FilterBar"
import { useArtifacts } from "@/hooks/artifacts/useArtifacts"
import { GiAmphora } from "react-icons/gi"

export const ArtifactsList = ({
  title,
  baseFilter,
  hiddenFields,
  excludeFields,
  excludeFilters,
  searchFields,
  customFilter,
  toggleFields,
  minimal
}) => {

  return (
    <FilterBar
      title={title || (
        <div css={{ display: 'flex', alignItems: 'center' }}>
          <GiAmphora css={{ marginRight: 8 }} />
          Artifacts
        </div>
      )}
      renderFilter={artifactFilter.filter(f => !excludeFilters?.includes(f.name))}
      toggleFields={toggleFields}
      minimal={minimal}
      customFilter={customFilter}
      hiddenFields={hiddenFields}
      searchFields={searchFields}
    >
      <ArtifactsDataTable
        baseFilter={baseFilter}
        excludeFields={excludeFields}
      />
    </FilterBar>
  )
}

const ArtifactsDataTable = ({ baseFilter, excludeFields }) => {
  const { filter, hiddenFields } = useFilter()
  const { artifacts, pagination, sort } = useArtifacts({
    filter: { ...baseFilter, ...filter },
    paginate: true,
    sort: true
  })

  return (
    <DataTable
      columns={artifactColumns
        .filter(r => !hiddenFields?.includes(r.name))
        .filter(r => !excludeFields?.includes(r.name))
      }
      data={artifacts}
      {...pagination}
      {...sort}
      noDataComponent='No artifacts found with this filter.'
      highlightOnHover
    />
  )
}

const artifactFilter = []

const artifactColumns = [
  {
    name: 'Name',
    selector: r => {
      return (
        <div
          css={{
            display: 'inline-flex',
            alignItems: 'center',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}
          data-tag="allowRowEvents"
        >
          <img
            src={r.images.thumbnail || r.images.external[0]}
            alt={r.name}
            css={{ width: 26, height: 26, margin: '5px 10px 5px 0', borderRadius: 4 }}
          />
          {r.name}
        </div>
      )
    },
    grow: 1
  },
  {
    name: 'Location',
    selector: r => formatLoaction(r.location),
  },
  {
    name: 'Time',
    selector: r => formatTime(r.time),
  }
]