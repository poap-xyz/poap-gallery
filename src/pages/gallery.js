import React, {useCallback, useEffect, useState} from 'react';
import ActivityTable from '../components/activityTable'
import {Helmet} from 'react-helmet';
import {fetchIndexData, selectEventError, selectEventStatus, selectRecentEvents} from '../store';
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

export default function Gallery() {
  const dispatch = useDispatch()

  // Meanwhile get all the events
  useEffect(() => {
    dispatch(fetchIndexData());
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */

  const events  = useSelector(selectRecentEvents)
  const eventStatus = useSelector(selectEventStatus)
  const eventError = useSelector(selectEventError)


  const [items, setItems] = useState(events)
  const [search, setSearch] = useState(undefined);
  const [length, setLength] = useState(40);

  const orderTypeOptions = ['Date', 'Id', 'City', 'Holders', 'Transfers']
  const [orderType, setOrderType] = useState(orderTypeOptions[0]);
  const orderDirectionOptions = ['High to Low', 'Low to High']
  const [orderDirection, setOrderDirection] = useState(orderDirectionOptions[0]);

  const [searchValue, setSearchValue] = useState('');

  const width = useWindowWidth();

  useEffect(() => {
    setItems(events)
  }, [events])

  const debounceHandleSearch = useCallback(debounce((nextValue, items) => handleNewSearchValue(nextValue, items), 800), [])
  const handleSearch = (event) => {
    const value = event.target.value
    setSearchValue(value);
    debounceHandleSearch(value, items)
  };
  const handleNewSearchValue = (value, items) => {
    if (value && value.length > 1) {
      const filteredItems = items.filter((item) => {
        return item.name.toLowerCase().indexOf(value.toLowerCase()) !== -1;
      });
      setSearch(filteredItems);
    } else {
      setSearch(undefined);
    }
  }

  const handleOrderDirectionChange = (value) => {
    setOrderDirection(value);
    handleFilter(orderType, value);
  };
  const handleOrderTypeChange = (value) => {
    setOrderType(value);
    handleFilter(value, orderDirection);
  };

  const handleFilter = (type, direction) => {
    let isAsc = direction === 'Low to High'
    let sortedItems = [...items]
    if (type === 'Date') {
      sortedItems.sort((a, b) => {
        const a_start_date = a.start_date.replace(/-/g, " ")
        const b_start_date = b.start_date.replace(/-/g, " ")
        return isAsc
          ? new Date(a_start_date).getTime() - new Date(b_start_date).getTime()
          : new Date(b_start_date).getTime() - new Date(a_start_date).getTime();
      });
    } else if(type === 'Id') {
      sortedItems.sort((a, b) => {
        return isAsc ? a.id - b.id : b.id - a.id
      })
    } else if (type === 'City') {
      sortedItems.sort((a, b) => {
        a = a.city.trim().toLowerCase()
        b = b.city.trim().toLowerCase()

        if(a === "") {
          return 1
        }
        if (b === "") {
          return -1
        }
        if( a > b ) {
          return isAsc ? 1 : -1
        } else if(b > a) {
          return isAsc ? -1 : 1
        } else {
          return 0
        }
      })
    } else if (type === 'Holders') {
      sortedItems.sort((a, b) => {
        if(a.tokenCount === undefined) {
          a.tokenCount = 0
        }
        if(b.tokenCount === undefined) {
          b.tokenCount = 0
        }
        if(a.tokenCount > b.tokenCount) {
          return isAsc ? 1 : -1
        } else if (b.tokenCount > a.tokenCount) {
          return isAsc ? -1 : 1
        } else {
          return 0
        }
      });
    } else if (type === 'Transfers') {
      sortedItems.sort((a, b) => {
        if(a.transferCount === undefined) {
          a.transferCount = 0
        }
        if(b.transferCount === undefined) {
          b.transferCount = 0
        }
        if(a.transferCount > b.transferCount) {
          return isAsc ? 1 : -1
        } else if (b.transferCount > a.transferCount) {
          return isAsc ? -1 : 1
        } else {
          return 0
        }
      });
    }
    setItems(sortedItems)
  };

  const eraseSearch = () => {
    setSearchValue('');
    debounceHandleSearch('', items)
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
                <input onChange={handleSearch} type="text" value={searchValue} placeholder="Search..." maxLength={20} />{' '}
                {
                  searchValue.length
                      ? <FontAwesomeIcon icon={faTimesCircle} style={{ position: 'relative', fontSize: '1.5rem', right: 37, top: 8, cursor: 'pointer', color: '#C4CAE8' }} onClick={eraseSearch} />
                      : <FontAwesomeIcon icon={faSearch}      style={{ position: 'relative', fontSize: '1rem', right: 27, top: 11, color: '#C4CAE8' }}/>
                }
              </div>
              {
                search && search.length ?
                <span
                  style={{
                    position: 'absolute',
                    top: `${width > 590 && width < 768 ? '120%' : '200%'}`,
                    left: '0',
                    color: '#8492CE',
                    fontSize: '1rem',
                  }}
                >
                  {search.length} result(s)
                </span> : null
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
                        <Dropdown title={orderTypeOptions[0]} defaultOption={orderTypeOptions[0]} options={orderTypeOptions} onClickOption={(orderType) => handleOrderTypeChange(orderType)} />
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
                        <Dropdown title={orderDirectionOptions[0]} defaultOption={orderDirectionOptions[0]} options={orderDirectionOptions} onClickOption={(orderDirection) => handleOrderDirectionChange(orderDirection)} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {eventError ? (
              <div
                style={{
                  gridColumn: '1 / 3',
                }}
              >
                <span>Could not load gallery, check your connection and try again</span>
              </div>

            ) : eventStatus === 'succeeded' ? (
              (search?.length === 0) ? <div className='failed-search'>
                <img src={FailedSearch} alt='Failed search'/>
                <h3>No results for that search :(</h3>
              </div> :
              <Cards events={(search?.length) ? search : items} length={search?.length || length} />
            ) : (
              <Loader/>
            )}
          </div>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
        </div>
          {!search ?
            <button  className='btn' onClick={() => {
                if (items && items.length) {
                  if (length + 20 < items.length) {
                    setLength(length + 20);
                  } else {
                    setLength(items.length);
                  }
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
                boxShadow: '0 6px 18px 0 #6534FF4D'
              }}>
              Load more
            </button> : null
          }
        </div>
      </div>
    </main>
  );
}

function Cards({ events, length }) {
  let cards = [];
  if (events && events.length) {
    let len = (length <= events.length) ? length : events.length;
    for (let i = 0; i < len; i++) {
      const event = events[i]
      if ( !event.private_event ) {
        cards.push(<EventCard key={i} event={event} />)
      }
    }
  }
  return cards;
}
