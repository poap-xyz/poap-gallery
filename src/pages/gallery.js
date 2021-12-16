import React, {useCallback, useEffect, useState} from 'react';
import ActivityTable from '../components/activityTable'
import {Helmet} from 'react-helmet';
import {
  FETCH_INDEX_PAGE_INFO_STATUS,
  fetchIndexData,
  selectIndexFetchStatus,
  selectEvents, selectTotalResults
} from '../store';
import {useDispatch, useSelector} from 'react-redux';
import {EventCard} from "../components/eventCard";
import Loader from '../components/loader'
import { debounce } from '../utilities/utilities';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import { faTimesCircle } from '@fortawesome/free-regular-svg-icons';
import FailedSearch from '../assets/images/failed-search.svg'
import Dropdown from '../components/dropdown';
import {faSearch} from "@fortawesome/free-solid-svg-icons/faSearch";
import {useWindowWidth} from "@react-hook/window-size";
import {OrderType, OrderDirection} from "../store/api";

const SEARCH_STATUS = {
  NoSearch: 'NoSearch',
  Searching: 'Searching',
  Success: 'Success',
  Failed: 'Failed',
}

export default function Gallery() {
  const dispatch = useDispatch()

  const events  = useSelector(selectEvents)
  const indexFetchStatus = useSelector(selectIndexFetchStatus)
  const totalResultsAmount = useSelector(selectTotalResults)
  const invalidEventsAmount = useSelector(state => state.events.currentInvalidResults)

  const [items, setItems] = useState(events)
  const [searchStatus, setSearchStatus] = useState(SEARCH_STATUS.NoSearch);
  const [searchValue, setSearchValue] = useState('');
  const [page, setPage] = useState(0);
  const [moreToLoad, setMoreToLoad] = useState(true)

  const initialOrderType = OrderType.date
  const initialOrderDirection = OrderDirection.descending
  const [orderType, setOrderType] = useState(initialOrderType)
  const [orderDirection, setOrderDirection] = useState(initialOrderDirection)

  const fetchData = ({reset = false, nameFilter = undefined}) => {
    if (reset) {
      setPage(0)
    }
    const isSearch = nameFilter?.length
    // On search, force ordering by initial ordering
    const fetchDataArgs = {
      orderBy: isSearch ?
          {type: initialOrderType.val, order: initialOrderDirection.val} :
          {type: orderType.val, order: orderDirection.val},
      nameFilter: nameFilter,
      privateEvents: false,
      reset: reset
    }
    dispatch(fetchIndexData(fetchDataArgs))
  }

  // Meanwhile reset state and get all the events
  useEffect(() => {
    if (searchStatus !== SEARCH_STATUS.Searching) {
      eraseSearch()
    }
  }, [orderType, orderDirection]); /* eslint-disable-line react-hooks/exhaustive-deps */
  useEffect(() => {
    // Load more data
    if (page > 0) fetchData({nameFilter: searchValue})
  }, [page]); /* eslint-disable-line react-hooks/exhaustive-deps */

  const width = useWindowWidth();

  useEffect(() => {
    if (searchStatus === SEARCH_STATUS.Searching) {
      setSearchStatus(events.length ? SEARCH_STATUS.Success : SEARCH_STATUS.Failed)
    }

    if (page > 0 && events.length === items.length) {
      setMoreToLoad(false)
    } else {
      setMoreToLoad(true)
    }
    setItems(events)
  }, [events]) /* eslint-disable-line react-hooks/exhaustive-deps */

  const eraseSearch = () => {
    setSearchValue('');
    setSearchStatus(SEARCH_STATUS.NoSearch)
    handleNewSearchValue('')
  }

  const debounceHandleSearch = useCallback(debounce((nextValue) => handleNewSearchValue(nextValue), 800), [])
  const minimumCharsForSearch = 3
  const handleSearchInput = (event) => {
    const value = event.target.value
    debounceHandleSearch(value)
    setSearchValue(value);
    if (value?.length < minimumCharsForSearch) {
      setSearchStatus(SEARCH_STATUS.NoSearch)
    } else {
      setSearchStatus(SEARCH_STATUS.Searching)
    }
  }
  const handleNewSearchValue = (value) => {
    if (value && value.length >= minimumCharsForSearch) {
      fetchData({reset: true, nameFilter: value})
    } else if (value === '') {
      fetchData({reset: true})
    }
  }
  const handleOrderDirectionChange = (value) => {
    setOrderDirection(value);
  }
  const handleOrderTypeChange = (value) => {
    setOrderType(value);
  }

  return (
    <main id="site-main" role="main" className="app-content home-main">
      <Helmet>
        <title>POAP Gallery - Home</title>
        <link rel="canonical" href="https://poap.gallery"/>
        <meta property="og:url" content="https://poap.gallery"/>
        <meta property="og:title" content="POAP Gallery - Home"/>
      </Helmet>
      <div className="container">
        <div className="gradient-background"/>
        <div className='background'/>
        <div className='content'>
          <ActivityTable />
          <div className="gallery-title">Explore</div>
          <hr />
          <div className="gallery-grid">
            <div className="gallery-search">
              <div style={{ display: 'flex', flexDirection: 'row'}}>
                <input onChange={handleSearchInput} type="text" value={searchValue} placeholder="Search..." maxLength={20} />{' '}
                {
                  searchStatus === SEARCH_STATUS.NoSearch
                      ? <FontAwesomeIcon icon={faSearch}      style={{ position: 'relative', fontSize: '1rem', right: 27, top: 11, color: '#C4CAE8' }}/>
                      : <FontAwesomeIcon icon={faTimesCircle} style={{ position: 'relative', fontSize: '1.5rem', right: 37, top: 8, cursor: 'pointer', color: '#C4CAE8' }} onClick={eraseSearch} />
                }
              </div>
              {
                (searchStatus === SEARCH_STATUS.Success) &&
                <span
                  style={{
                    position: 'absolute',
                    top: `${width > 590 && width < 768 ? '120%' : '200%'}`,
                    left: '0',
                    color: '#8492CE',
                    fontSize: '1rem',
                  }}
                >
                  {totalResultsAmount - invalidEventsAmount} result(s)
                </span>
              }
            </div>
            <div className="gallery-filter">
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  marginRight: '-.3rem',
                }}
                className="gallery-sort"
              >
                <span
                  style={{
                    padding: '.2rem',
                    flex: '1 1 60px',
                    textAlign: 'right',
                    marginRight: '1rem',
                    color: '#8492CE'
                  }}
                >
                  Order by{' '}
                </span>
                <div style={{ flex: '2 1 160px' }} className="sort-options">
                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      justifyContent: 'space-between',
                    }}
                    className="selection-group"
                  >
                    <div
                      style={{
                        margin: '.5rem .3rem',
                        flex: '5 5 calc(50% - 1rem)',
                        minWidth: '9rem',
                      }}
                      className="selection-item"
                    >
                      <div
                        style={{
                          width: 'inherit',
                        }}
                        className="gallery-select-container"
                        role="menu"
                      >
                        <Dropdown
                            defaultOption={initialOrderType}
                            options={Object.values(OrderType)}
                            disable={searchStatus !== SEARCH_STATUS.NoSearch}
                            onClickOption={(orderType) => handleOrderTypeChange(orderType)} />
                      </div>
                    </div>
                    <div
                      style={{
                        margin: '.5rem .3rem',
                        flex: '5 5 calc(50% - 1rem)',
                        minWidth: '9rem',
                      }}
                      className="selection-item"
                    >
                      <div
                        style={{
                          width: 'inherit',
                        }}
                        className="gallery-select-container"
                        role="menu"
                      >
                        <Dropdown
                            defaultOption={initialOrderDirection}
                            options={Object.values(OrderDirection)}
                            disable={searchStatus !== SEARCH_STATUS.NoSearch}
                            onClickOption={(orderDirection) => handleOrderDirectionChange(orderDirection)} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {(indexFetchStatus === FETCH_INDEX_PAGE_INFO_STATUS.SUCCEEDED || indexFetchStatus === FETCH_INDEX_PAGE_INFO_STATUS.LOADING_MORE) && searchStatus === SEARCH_STATUS.Failed &&
              <div className='failed-search'>
                <img src={FailedSearch} alt='Failed search'/>
                <h3>No results for that search :(</h3>
              </div>
            }
            {(indexFetchStatus === FETCH_INDEX_PAGE_INFO_STATUS.SUCCEEDED || indexFetchStatus === FETCH_INDEX_PAGE_INFO_STATUS.LOADING_MORE) && searchStatus !== SEARCH_STATUS.Failed &&
              <Cards events={items} />
            }
            {(indexFetchStatus === FETCH_INDEX_PAGE_INFO_STATUS.IDLE || indexFetchStatus === FETCH_INDEX_PAGE_INFO_STATUS.LOADING) && <Loader/>}
          </div>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
        </div>
          {indexFetchStatus === FETCH_INDEX_PAGE_INFO_STATUS.FAILED && (
              <div className={'center'}>
                <span>Could not load gallery, check your connection and try again</span>
              </div>
          )}
          {
            moreToLoad && (indexFetchStatus === FETCH_INDEX_PAGE_INFO_STATUS.SUCCEEDED || indexFetchStatus === FETCH_INDEX_PAGE_INFO_STATUS.LOADING_MORE) &&
            searchStatus !== SEARCH_STATUS.Failed &&
            <button  className='btn' onClick={() => {
              if (items && items.length) {
                setPage(page + 1);
              }
            }}
              style={{
                marginTop: '40px',
                width: 'fit-content',
                minWidth: 'auto',
                marginBottom: '0px',
                marginLeft: 'auto',
                marginRight: 'auto',
                padding: '12px 32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 6px 18px 0 #6534FF4D',
              }}
              disabled={indexFetchStatus === FETCH_INDEX_PAGE_INFO_STATUS.LOADING_MORE}
            >
                Load more
            </button>
          }
        </div>
      </div>
    </main>
  );
}

function Cards({ events }) {
  return (events && events.length) ? events.map((event, idx) => <EventCard key={`${event.id}-${idx}`} event={event} />) : null
}
