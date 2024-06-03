import { formatDateRange } from "@/lib/artifactUtils"
import { DataTable } from "../datatable/DataTable"
import FilterBar, { useFilter } from "../datatable/FilterBar"
import { useArtifacts } from "@/hooks/artifacts/useArtifacts"
import { GiAmphora } from "react-icons/gi"
import { MdCalendarMonth, MdImage } from "react-icons/md"
import Link from "next/link"
import { useQuery } from "@/hooks/useQuery"
import { IconButton } from "../buttons/IconButton"
import { GoEye } from "react-icons/go"
import { MasonryLayout } from "../layout/MasonryLayout"
import { ImmersiveDialog } from "../dialogs/ImmersiveDialog"
import { ArtifactImage } from "./components.js/ArtifactImage"
import dynamic from "next/dynamic"
import { useMediaQuery } from "react-responsive"

export const ArtifactsList = dynamic(() => Promise.resolve(ArtifactsListUI), { ssr: false })

const ArtifactsListUI = ({
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
  const { query, setQuery } = useQuery()

  const immersiveMode = query?.immersiveMode
  const toggleImmersiveMode = () => setQuery({ ...query, immersiveMode: !immersiveMode })

  const imageMode = query?.imageMode
  const toggleImageMode = () => setQuery({ ...query, imageMode: !imageMode })

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
      hiddenFields={hiddenFields}
      searchFields={searchFields}
      customFilter={(
        <div className='flex' css={{
          '@media (max-width: 600px)': { marginRight: 32 },
          marginLeft: 0
        }}>
          <IconButton
            tooltip={imageMode ? 'Disable Image Mode' : 'Enable Image Mode'}
            onClick={() => toggleImageMode()}
            css={{
              marginRight: 4,
              background: imageMode ? 'var(--primaryColor)' : 'var(--background)',
            }}
          >
            <MdImage />
          </IconButton>
          <IconButton
            tooltip={immersiveMode ? 'Disable Immersive Mode' : 'Enable Immersive Mode'}
            onClick={() => toggleImmersiveMode()}
          >
            <GoEye />
          </IconButton>
          {customFilter}
        </div>
      )}
    >
      <ArtifactsDataTable
        baseFilter={baseFilter}
        excludeFields={excludeFields}
        isFavorites={isFavorites}
        immersiveMode={immersiveMode}
        imageMode={imageMode}
        toggleImmersiveMode={toggleImmersiveMode}
      />
    </FilterBar>
  )
}

const ArtifactsDataTable = ({ baseFilter, excludeFields, isFavorites, immersiveMode, toggleImmersiveMode, imageMode }) => {
  const isMobile = useMediaQuery({ maxWidth: 800 })
  const { filter, hiddenFields } = useFilter()
  const { artifacts, pagination, sort } = useArtifacts({
    filter: { ...baseFilter, ...filter },
    isFavorites,
    paginate: true,
    sort: true
  })

  return (
    <>
      {immersiveMode && artifacts && (
        <ImmersiveDialog visible closeDialog={() => toggleImmersiveMode()}>
          <MasonryLayout gutter={0} breaks={{ default: 5 }}>
            {artifacts?.map(row => (
              <div key={row.id}>
                <img
                  src={row.images.external[0]}
                  alt={row.name}
                  css={{
                    display: 'block',
                    width: '100%',
                    height: 'auto'
                  }}
                />
                <div css={{ fontSize: '0.8em', padding: 4 }}>
                  {row.name}, {row?.location.country}, {formatDateRange(row?.time.start, row?.time.end)}
                </div>
              </div>
            ))}
          </MasonryLayout>
        </ImmersiveDialog>
      )}
      {imageMode && artifacts && (
        <MasonryLayout
          style={{
            borderRadius: 5,
            overflow: 'hidden',
            background: 'var(--backgroundColorBarelyDark)',
          }}
          gutter={0}
          breaks={{
            default: 6,
            600: 2,
            900: 3,
            1200: 4,
            1600: 5
          }}
        >
          {artifacts?.map(row => (
            <ArtifactImage key={row.id} artifact={row} noTumbnail />
          ))}
        </MasonryLayout>
      )}
      {isMobile && !imageMode && artifacts && (
        <div css={{ background: 'var(--backgroundColorBarelyDark)', borderRadius: 5 }}>
          {artifacts.map((a, i) => {

            return (
              <Link key={a.id} href={a.source.url} target='_blank' css={{ textDecoration: 'none' }}>
                <div css={{ borderBottom: i === artifacts?.length - 1 ? 'none' : '1px solid var(--backgroundColorSlightlyDark)' }}>
                  <div css={{ display: 'flex', alignItems: 'center', padding: 8 }}>
                    <img
                      src={a.images.thumbnail || a.images.external[0]}
                      alt={a.name}
                      css={{ width: 40.8, minWidth: 40.8, height: 40.8, objectFit: 'cover', borderRadius: 4, marginRight: 8 }}
                    />
                    <div css={{ flexGrow: 1 }}>
                      <div css={{ fontSize: '0.9em', fontWeight: 'bold' }}>{a.name}</div>
                      <span css={{ fontSize: '0.8em' }}>{a.location.country}, {formatDateRange(a.time.start, a.time.end)}</span>
                      <div css={{ fontSize: '0.8em' }}>{a.medium}</div>
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
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
        renderRow={(row, rowContent) => (
          <Link
            key={row.id}
            href={row.source.url}
            css={{
              textDecoration: 'none',
              '&:first-of-type': {
                borderTopLeftRadius: '6px',
                borderTopRightRadius: '6px',
              },
              '&:last-of-type': {
                borderBottomLeftRadius: '6px',
                borderBottomRightRadius: '6px',
                borderBottom: 'none'
              },
              overflow: 'hidden',
              borderBottom: '1px solid var(--backgroundColorSlightlyDark)'
            }}
            target='_blank'
          >
            {rowContent}
          </Link>
        )}
        scrollOverflow
        customStyles={(isMobile || imageMode) ? {
          tableWrapper: {
            style: {
              display: 'none'
            }
          },
          table: {
            style: {
              display: 'none'
            }
          },
        } : {
          rows: {
            style: {
              background: 'var(--backgroundColorBarelyDark)',
            },
            highlightOnHoverStyle: {
              color: 'var(--textColor)',
              backgroundColor: 'var(--backgroundColorSliightlyDark)',
              borderBottomColor: 'var(--backgroundColorSlightlyDark)',
              transition: 'all 0.3s ease',
              cursor: 'pointer',
              outline: 'none',
            }
          },
        }}
      />
    </>
  )
}

const artifactFilter = [
  {
    name: 'startDateAfter',
    filter: (addFilterItem) => {
      const contents = (
        <span css={{ fontSize: '0.9em', display: 'inline-flex', alignItems: 'center' }}>
          <MdCalendarMonth css={{  marginRight: 8 }} color='var(--textLowOpacity)' />
          Start After
        </span>
      )

      return {
        contents,
        onClick: () => addFilterItem({
          name: 'startDateAfter',
          type: 'year',
          contents
        })
      }
    }
  },
  {
    name: 'startDateBefore',
    filter: (addFilterItem) => {
      const contents = (
        <span css={{ fontSize: '0.9em', display: 'inline-flex', alignItems: 'center' }}>
          <MdCalendarMonth css={{  marginRight: 8 }} color='var(--textLowOpacity)' />
          Start Before
        </span>
      )

      return {
        contents,
        onClick: () => addFilterItem({
          name: 'startDateBefore',
          type: 'year',
          contents
        })
      }
    }
  },
  {
    name: 'endDateAfter',
    filter: (addFilterItem) => {
      const contents = (
        <span css={{ fontSize: '0.9em', display: 'inline-flex', alignItems: 'center' }}>
          <MdCalendarMonth css={{  marginRight: 8 }} color='var(--textLowOpacity)' />
          End After
        </span>
      )

      return {
        contents,
        onClick: () => addFilterItem({
          name: 'endDateAfter',
          type: 'year',
          contents
        })
      }
    }
  },
  {
    name: 'endDateBefore',
    filter: (addFilterItem) => {
      const contents = (
        <span css={{ fontSize: '0.9em', display: 'inline-flex', alignItems: 'center' }}>
          <MdCalendarMonth css={{  marginRight: 8 }} color='var(--textLowOpacity)' />
          End Before
        </span>
      )

      return {
        contents,
        onClick: () => addFilterItem({
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
    grow: 0.8
  },
  {
    name: 'Location',
    // selector: r => formatLocation(r.location),
    selector: r => r.location.country,
    grow: 0.5
  },
  {
    name: 'Time',
    selector: r => formatDateRange(r.time.start, r.time.end),
    grow: 0.5
  },
  {
    name: 'Medium',
    selector: r => r.medium,
    grow: 0.4
  }
]