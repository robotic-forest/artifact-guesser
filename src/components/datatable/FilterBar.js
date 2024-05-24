import { IconButton } from '../buttons/IconButton'
import { Dropdown } from '../dropdown/Dropdown'
import { createContext, useContext, useEffect, useState } from "react"
import { BiFilter, BiSearch } from "react-icons/bi"
import { VscChromeClose } from "react-icons/vsc"
import { HiOutlineChevronDown } from "react-icons/hi"
import { RxEyeOpen } from "react-icons/rx"
import moment from 'moment'
import { ToggleButton } from './components/ToggleButton'
import { useQuery } from '@/hooks/useQuery'
import { FormTextArea, Input, ReactSelect } from '../form/Form'
import { delabelize, isNumeric, renderMdbFilter } from '@/lib/utils'
import { labelize } from '../form/formUtils'
import { Button } from '../buttons/Button'
import { EditableDate } from '../gameui/EditableDate'

// create filtercontext
const FilterContext = createContext(null)

export const useFilter = () => {
  const context = useContext(FilterContext)
  if (!context) {
    return { filter: null }
  }
  return context
}

export const FilterBar = ({
  title,
  children,
  renderFilter,
  searchFields,
  noLayoutShift,
  customFilter,
  toggleFields,
  minimal,
  style,
  useStateFilter
}) => {
  const query = useQuery()
  const [filterItems, setFilterItems] = useState([])
  const [hiddenFields, setHiddenFields] = useState(toggleFields)
  const [queryParsed, setQueryParsed] = useState(false)

  const [stateFilter, setStateFilter] = useState({})
  const filter = useStateFilter ? stateFilter : (query?.filter || {})
  const setFilter = useStateFilter ? setStateFilter : (nf) => {
    const newFilter = typeof nf === 'function' ? nf(filter) : nf
    query.setQuery({ ...newFilter, ...query.meta })
  }

  const addFilterItem = (newItem) => {
    setFilterItems(prev => {
      const alreadyExists = prev.find((f) => f.name === newItem.name)
      const newFilterItems = alreadyExists
        ? prev.map((f) => f.name === newItem.name ? newItem : f)
        : [ ...prev, newItem ]

      return newFilterItems
    })
  }

  const querySearchField = Object.keys(query.filter).find(key => searchFields?.find((sf) => sf.value === key))
  const [searchValue, setSearchValue] = useState('')
  const [searchField, setSearchField] = useState(searchFields?.[0]?.value)
  
  useEffect(() => {
    if (!queryParsed) {
      if (querySearchField) {
        setSearchField(querySearchField)
        setSearchValue(query.filter[querySearchField])
      }

      if (Object.keys(filter).length && !useStateFilter) {
        buildFilterItemsFromQuery(query.filter, renderFilter, addFilterItem, setFilter)
      }

      return setQueryParsed(true)
    }

    let newFilter = filter
    if (searchField) {
      newFilter = Object.keys({ ...newFilter, [searchField]: searchValue }).reduce((acc, key) => {
        const isPossibleSearchField = searchFields?.find((sf) => sf.value === key)

        if (isPossibleSearchField && searchField !== key) delete acc[key]
        if (searchField === key && !searchValue) delete acc[key]
        
        return acc
      }, { ...newFilter, [searchField]: searchValue })
    }

    setFilter(newFilter)
    setQueryParsed(true)
  }, [searchField, searchValue])

  const renderedButtons = renderFilter?.map(({ name, filter: f }) => ({
    name,
    ...f(addFilterItem, setFilter),
    disabled: filterItems.find((f) => f.name === name)
  }))

  const toggleButtons = toggleFields?.map((name) => ({
    contents: <ToggleButton {...{ name, hiddenFields }} />,
    onClick: () => {
      setHiddenFields(hiddenFields.includes(name) ? hiddenFields.filter((f) => f !== name) : [ ...hiddenFields, name ])
    }
  }))

  // Purged filter object that only includes fields that are in the renderFilter array.
  // avoids errors from switching tabs to another tab with different filter fields, ie. deal appointments to deal tickets
  const purgedFilter = Object.keys(filter).reduce((acc, key) => {
    if (renderFilter.find((f) => f.name === key) || key === searchField) {
      acc[key] = filter[key]
    }
    return acc
  }, {})

  // convert strings to regex n moere
  const finalFilter = renderMdbFilter(purgedFilter, filterItems)

  return (
    <FilterContext.Provider value={{ filter: finalFilter, hiddenFields }}>
      <div css={style}>
        <div css={{
          display: 'flex',
          flexFlow: 'row wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 3,
        }}>
          <div css={{
            marginBottom: 8
          }}>
            {title}
          </div>
          <div css={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: 8
          }}>
            <div css={{
              marginRight: 10,
              '@media (max-width: 696px)': {
                display: 'none'
              },
              display: 'flex',
              position: 'relative',
            }}>
              {customFilter && (
                <div css={{
                  marginLeft: 5,
                  display: 'flex',
                }}>
                  {customFilter}
                </div>
              )}
              {toggleFields?.length > 0 && (
                <Dropdown
                  top={8}
                  button={
                    <IconButton tooltip='Toggle Additional Fields' tooltipPlace='bottom'>
                      <RxEyeOpen />
                    </IconButton>
                  }
                  menuButtons={toggleButtons}
                />
              )}
            </div>
            {searchFields && (
              <div css={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                flexGrow: 1,
                top: 1,
                marginRight: renderFilter ? 4 : 0,
                height: 28,
                background: 'var(--backgroundColorSlightlyLight)',
                borderRadius: 5,
                marginRight: 8,
                paddingTop: 2,
                transition: 'all 0.2s ease-in-out',
                '&:focus': {
                  background: 'var(--backgroundColorLight)',
                  boxShadow: '0 2px 5px 0px var(--textSuperLowOpacity)'
                },
                '&:hover': {
                  background: 'var(--backgroundColorLight)',
                  boxShadow: '0 2px 5px 0px var(--textSuperLowOpacity)'
                }
              }}>
                <BiSearch css={{ margin: '0 4px 0 8px', minWidth: 18 }} />
                <Input
                  type='text'
                  naked
                  placeholder='Search...'
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  spellCheck={false}
                  css={{
                    fontSize: '0.9em',
                    padding: '4px 8px 7px 4px',
                    background: 'transparent',
                    flexGrow: 1,
                  }}
                />
                <Dropdown
                  top={4}
                  button={
                    <button
                      css={{
                        position: 'relative',
                        top: -2,
                        marginRight: 8,
                        background: 'transparent',
                        display: 'inline-flex',
                        alignItems: 'center',
                        border: 'none',
                        outline: 'none',
                        cursor: 'pointer',
                        fontSize: '0.9em',
                        '&:hover': {
                          color: 'var(--textLowOpacity)'
                        }
                      }}
                    >
                      {searchFields.find((f) => f.value === searchField)?.label}
                      <HiOutlineChevronDown css={{ marginLeft: 8 }} />
                    </button>
                  }
                  menuButtons={searchFields
                    .map((field) => ({
                      contents: field.label,
                      onClick: () => setSearchField(field.value)
                    }))
                  }
                  dropdownStyle={{
                    right: 7
                  }}
                  closeAfterClick
                />
              </div>
            )}
            <div css={{
              display: 'flex',
              flexFlow: 'row wrap',
              // '@media (max-width: 696px)': {
              //   width: '100%'
              // },
            }}>
              {(toggleFields?.length > 0 || customFilter) && (
                <div css={{
                  '@media (min-width: 696px)': {
                    display: 'none'
                  },
                }}>
                  {customFilter}
                </div>
              )}
              {renderedButtons?.length > 0 && (
                <div css={{
                  marginLeft: 'auto',
                  '@media (max-width: 696px)': {
                    marginRight: 4
                  },
                }}>
                  <Dropdown
                    top={8}
                    button={
                      minimal ? (
                        <div>
                          <IconButton iconSize={16} tooltip='Filter' tooltipPlace='top'>
                            <BiFilter />
                          </IconButton>
                        </div>
                      ) : (
                        <Button css={{ padding: '1px 9px' }}>
                          <BiFilter style={{ fontSize: '1.3em', marginRight: 6 }} />
                          Filter
                        </Button>
                      )
                    }
                    menuButtons={renderedButtons}
                    closeAfterClick
                  />
                </div>
              )}
            </div>
          </div>
        </div>
        {filterItems.length === 0 && noLayoutShift && <div css={{ width: '100%', height: 41 }} />}
        {filterItems.length > 0 && (
          <div css={{
            padding: '0 0px 8px 0px',
            display: 'flex',
            flexFlow: 'row wrap'
          }}>
            {filterItems.map((item) => item.type === 'boolean' ? (
              <div
                key={item.name}
                css={{
                  boxShadow: '0 2px 5px 0px var(--textSuperLowOpacity)',
                  display: 'flex',
                  alignItems: 'center',
                  borderRadius: 6,
                  padding: '0px 2px 0px 8px',
                  margin: '0 6px 4px 0',
                  width: 'fit-content',
                  minHeight: 29
                }}
              >
                <div css={{ marginRight: 8 }}>
                  {item.contents}
                </div>
                {!item.forceOpen && (
                  <IconButton
                    size={22}
                    onClick={() => {
                      setFilterItems(f => f.filter((i) => i.name !== item.name))
                      setFilter((f) => {
                        const { [item.name]: _, ...rest } = f
                        return rest
                      })
                    }}
                  >
                    <VscChromeClose />
                  </IconButton>
                )}
              </div>
            ) : (
              <div
                css={{
                  display: 'flex',
                  borderRadius: 6,
                  padding: '4px 4px 4px 8px',
                  width: 'fit-content',
                  transition: 'background-color 0.1s ease-in-out',
                  margin: '0 6px 4px 0',
                  userSelect: 'none',
                  height: 29,
                  color: `var(--textLowOpacity)`,
                  background: 'var(--backgroundColorBarelyLight)',
                  '&:hover': {
                    backgroundColor: 'var(--backgroundColorSlightlyLight)'
                  },
                  boxShadow: '0 2px 5px 0px var(--textSuperLowOpacity)'
                }}
              >
                <span>
                  {item.contents}
                </span>
                {['date'].includes(item.type) && (
                  <FilterDateInput filterValue={filter[item.name]} setFilter={setFilter} item={item} />
                )}
                {['year'].includes(item.type) && (
                  <EditableDate
                    value={Number(filter[item.name])}
                    onChange={(v) => setFilter((f) => ({ ...f, [item.name]: v }))}
                    dropDownPlace='bottom'
                    className='relative top-[-1px]'
                  />
                )}
                {item.type === 'text' && (
                  <FormTextArea
                    textAreaStyle={{
                      padding: 1,
                      border: 'none',
                      boxShadow: 'none',
                      position: 'relative',
                      top: 6.5,
                      fontSize: '1em',
                      lineHeight: '1.4em',
                      marginBottom: 8
                    }}
                    style={{ width: '100%' }}
                    placeholder={`Search by ${item.name}`}
                    autosize
                    autoFocus
                    value={filter[item.name]}
                    onChange={(e) => {
                      const value = e.target.value
                      setFilter((f) => ({
                        ...f,
                        [item.name]: value
                      }))
                    }}
                  />
                )}
                {item.type === 'select' && (
                  <ReactSelect
                    minimalist
                    minMenuWidth={item.minMenuWidth}
                    placeholder={filter[item.name]}
                    css={{ position: 'relative', top: -3, marginLeft: 4 }}
                    options={item.options.map((option) => option.label ? option : {
                      value: option,
                      label: option
                    })}
                    value={(() => {
                      const value = isNumeric(filter[item.name]) ? Number(filter[item.name]) : filter[item.name]
                      const label = item.options.find((o) => String(o.value) === String(value))?.label

                      if (label) return { label, value }

                      return filter[item.name] && filter[item.name].label
                        ? filter[item.name]
                        : filter[item.name] ? { label: filter[item.name], value: filter[item.name] } : undefined
                    })()}
                    onChange={(data) => {
                      setFilter((f) => ({
                        ...f,
                        [item.name]: data.value
                      }))
                    }}
                  />
                )}
                {item.type === 'multi-select' && (
                  <ReactSelect
                    minimalist
                    isMulti
                    placeholder={null}
                    css={{ width: '100%' }}
                    options={labelize(item.options)}
                    value={filter[item.name]
                      ? labelize(
                        filter[item.name].includes(',')
                          ? filter[item.name].split(',')
                          : [filter[item.name]]
                      ) : []}
                    onChange={(data) => {
                      setFilter((f) => ({
                        ...f,
                        [item.name]: delabelize(data).join(',')
                      }))
                    }}
                  />
                )}
                {!item.forceOpen && (
                  <IconButton
                    size={20}
                    css={{
                      marginLeft: 4,
                      background: 'transparent',
                      '&:hover': {
                        background: 'var(--textSuperLowOpacity)'
                      }
                    }}
                    onClick={() => {
                      setFilterItems((f) => f.filter((i) => i.name !== item.name))
                      setFilter((f) => {
                        const { [item.name]: _, ...rest } = f
                        return rest
                      })
                    }}
                  >
                    <VscChromeClose color='var(--textLowOpacity)' />
                  </IconButton>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      {children}
    </FilterContext.Provider>
  )
}

// This component exists to catch an edgecase where the filter items are not being set properly in date inputs,
// so it updates a local state var for the actual value of the input and keeps the query in sync
const FilterDateInput = ({ filterValue, setFilter, item }) => {
  const [value, setValue] = useState(filterValue || '')

  // keep things in sync
  useEffect(() => {
    setValue(filterValue)
  }, [filterValue])

  return (
    <input
      type='date'
      css={{
        padding: '0 2px',
        outline: 0,
        boxShadow: 'none',
        border: 'none',
        background: 'none',
        position: 'relative',
        lineHeight: 20,
        marginLeft: 8
      }}
      value={value}
      onChange={(e) => {
        const v = e.target.value
        setValue(v)

        // only update if valid date, to prevent '0200-01-01' from being set when typing year
        const isValid = moment(v, 'YYYY-MM-DD', true).isAfter('1900-01-01')
        isValid && setFilter((f) => ({
          ...f,
          [item.name]: v
        }))
      }}
    />
  )
}

const buildFilterItemsFromQuery = (query, renderFilter, addFilterItem, setFilter) => {
  // since the objects in renderFilter defines the properties of the buttons in the filter dropdown,
  // we can hijack that button's onClick and call it manually to set the filter items
  // the fact this works is a testament to the hubris of man
  Object.keys(query).map((key, index) => {
    const filterItem = renderFilter.find((f) => f.name === key)
    if (filterItem) {
      filterItem.filter(addFilterItem, setFilter).onClick(index === 0)
    }
  })
}

export default FilterBar