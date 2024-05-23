import { formatDateRange, formatLocation, formatTime } from "@/lib/artifactUtils"
import { DataTable } from "../datatable/DataTable"
import FilterBar, { buildFilterItems, useFilter } from "../datatable/FilterBar"
import { useArtifacts } from "@/hooks/artifacts/useArtifacts"
import { GiAmphora } from "react-icons/gi"
import { MdCalendarMonth } from "react-icons/md"

export const ArtifactsList = ({
  title,
  baseFilter,
  hiddenFields,
  excludeFields,
  excludeFilters,
  searchFields,
  customFilter,
  toggleFields,
  minimal,
  isFavorites
}) => {

  return (
    <FilterBar
      title={title || (
        <b className='flex items-center'>
          <GiAmphora css={{ marginRight: 8 }} />
          Artifacts
        </b>
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
        isFavorites={isFavorites}
      />
    </FilterBar>
  )
}

const ArtifactsDataTable = ({ baseFilter, excludeFields, isFavorites }) => {
  const { filter, hiddenFields } = useFilter()
  const { artifacts, pagination, sort } = useArtifacts({
    filter: { ...baseFilter, ...filter },
    isFavorites,
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
      onRowClicked={r => window.open(r.source.url, '_blank')}
      scrollOverflow
    />
  )
}

const artifactFilter = [
  {
    name: 'startDateAfter',
    filter: (setFilterItems) => {
      const contents = (
        <span css={{ fontSize: '0.9em', display: 'inline-flex', alignItems: 'center' }}>
          <MdCalendarMonth css={{  marginRight: 8 }} color='var(--textLowOpacity)' />
          Start Date After
        </span>
      )

      return {
        contents,
        onClick: (init) => buildFilterItems(setFilterItems, init, {
          name: 'startDateAfter',
          type: 'year',
          contents
        })
      }
    }
  },
  {
    name: 'startDateBefore',
    filter: (setFilterItems) => {
      const contents = (
        <span css={{ fontSize: '0.9em', display: 'inline-flex', alignItems: 'center' }}>
          <MdCalendarMonth css={{  marginRight: 8 }} color='var(--textLowOpacity)' />
          Start Date Before
        </span>
      )

      return {
        contents,
        onClick: (init) => buildFilterItems(setFilterItems, init, {
          name: 'startDateBefore',
          type: 'year',
          contents
        })
      }
    }
  },
  {
    name: 'endDateAfter',
    filter: (setFilterItems) => {
      const contents = (
        <span css={{ fontSize: '0.9em', display: 'inline-flex', alignItems: 'center' }}>
          <MdCalendarMonth css={{  marginRight: 8 }} color='var(--textLowOpacity)' />
          End Date After
        </span>
      )

      return {
        contents,
        onClick: (init) => buildFilterItems(setFilterItems, init, {
          name: 'endDateAfter',
          type: 'year',
          contents
        })
      }
    }
  },
  {
    name: 'endDateBefore',
    filter: (setFilterItems) => {
      const contents = (
        <span css={{ fontSize: '0.9em', display: 'inline-flex', alignItems: 'center' }}>
          <MdCalendarMonth css={{  marginRight: 8 }} color='var(--textLowOpacity)' />
          End Date Before
        </span>
      )

      return {
        contents,
        onClick: (init) => buildFilterItems(setFilterItems, init, {
          name: 'endDateBefore',
          type: 'year',
          contents
        })
      }
    }
  }
]

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
            css={{ width: 26, height: 26, margin: '6px 10px 6px 0', borderRadius: 4 }}
          />
          {r.name}
        </div>
      )
    },
    grow: 1
  },
  {
    name: 'Location',
    selector: r => formatLocation(r.location),
    grow: 0.5
  },
  {
    name: 'Time',
    selector: r => formatDateRange(r.time.start, r.time.end),
    grow: 0.5
  }
]