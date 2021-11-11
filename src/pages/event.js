import React, {useEffect, useMemo, useState} from 'react';
import {usePagination, useSortBy, useTable} from 'react-table'
import {InView} from 'react-intersection-observer';
import ReactTooltip from 'react-tooltip';
import {Route, Switch, useParams, useRouteMatch} from 'react-router-dom';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faAngleLeft, faAngleRight, faArrowDown, faArrowUp, faDotCircle, faQuestionCircle} from '@fortawesome/free-solid-svg-icons'
import {Helmet} from 'react-helmet'
import {useDispatch, useSelector} from 'react-redux';
import {fetchEventPageData} from '../store';
import {CSVLink} from "react-csv";
import {getEnsData} from '../store/mutations';
import Loader from '../components/loader'
import _ from 'lodash'
import { EventCard } from '../components/eventCard';
import { Foliage } from '../components/foliage';
import {dateCell, shrinkAddress, utcDateFormatted, utcDateFull} from '../utilities/utilities';
import { useWindowWidth } from '@react-hook/window-size/throttled';
import OpenLink from '../assets/images/openLink.svg'

const GRAPH_LIMIT = 1000;

export default function Events() {
  let match = useRouteMatch();

  return (
    <Switch>
      <Route path={`${match.path}/:eventId`}>
        <Event />
      </Route>
      <Route path={match.path}>
        <h3 style={{ display: 'flex', justifyContent: 'center' }}>No event Selected</h3>
      </Route>
    </Switch>
  );
}

export function Event() {
  const params = useParams();
  const { eventId } = params;
  const dispatch = useDispatch()
  const tokens = useSelector(state => state.events.tokens)
  const loadingEvent  = useSelector(state => state.events.eventStatus)
  const errorEvent = useSelector(state => state.events.eventError)
  const event = useSelector(state => state.events.event)

  const [pageIndex, setPageIndex] = useState(0);
  const [data, setData] = useState([]);
  const [mobileData, setMobileData] = useState([]);
  const [csv_data, setCsv_data] = useState([]);
  const [ensNames, setEnsNames] = useState([]);
  const width = useWindowWidth();
  const pageCount = useMemo( () => event.tokenCount % 50 !== 0 ? Math.floor(event.tokenCount / 50) + 1 : event.tokenCount, [event])
  const power = calculatePower(csv_data);

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])
  
  const MobileRow = ({token, address}) => (
    <div className={`mobile-row open`}>
      <span className='id-title'>POAP ID</span><span className='id-content'>#{token.id}</span>
      <span className='address-title'>Address</span><span className='address-content ellipsis'>
        <a href={"https://app.poap.xyz/scan/" + token.owner.id} target="_blank" rel="noopener noreferrer">{shrinkAddress(address, 15)}</a></span>
      <span className='claim-title'>Claim Date</span><span className='claim-content'>{utcDateFormatted(token.created * 1000)}</span>
      <span className='tr-count-title'>Transaction Count</span><span className='tr-count-content'>{token.transferCount}</span>
      <span className='power-title'>Power</span><span className='power-content'>{token.owner.tokensOwned}</span>
    </div>
  )
  useEffect(() => {
    if (eventId) {
      dispatch(fetchEventPageData({ eventId, first: GRAPH_LIMIT, skip: GRAPH_LIMIT*pageIndex  }))
    }
  }, [dispatch, eventId, pageIndex])

  useEffect(() => {
    let ownerIds = tokens.map(t => t.owner.id)
    if (event && event.tokenCount > GRAPH_LIMIT && tokens && tokens.length > 0) {
      const totalPages = Math.ceil(event.tokenCount / GRAPH_LIMIT);
      if (pageIndex + 1 < totalPages) {
        setPageIndex(pageIndex + 1);
      }
    }

    let _data = [], _mobileData = []
    let _csv_data = []
    _csv_data.push(['ID', 'Collection', 'ENS', 'Minting Date', 'Tx Count', 'Power']);
    for (let i = 0; i < tokens.length; i++) {
      _data.push({
        col1:  (<ExternalLinkCell url={"https://app.poap.xyz/token/" + tokens[i].id} content={`#${tokens[i].id}`}/>) ,
        col2: (<ExternalLinkCell url={"https://app.poap.xyz/scan/" + tokens[i].owner.id} tooltipText='View Collection in POAP.scan' content={tokens[i].owner.id}/>),
        col3: tokens[i].created * 1000,
        col4: tokens[i].transferCount,
        col5: tokens[i].owner.tokensOwned,
      })
      _mobileData.push({
        col1: <MobileRow token={tokens[i]} address={tokens[i].owner.id} />
      })
      _csv_data.push([tokens[i].id, tokens[i].owner.id, null, utcDateFull(tokens[i].created * 1000), tokens[i].transferCount, tokens[i].owner.tokensOwned])
    }
    setData(_data)
    setMobileData(_mobileData)
    setCsv_data(_csv_data)
    getEnsData(ownerIds).then(allnames => {
      if(allnames.length > 0){
        setEnsNames(allnames)
      }
    })
  }, [event, tokens, pageIndex, setPageIndex]); /* eslint-disable-line react-hooks/exhaustive-deps */

  useEffect(() => {
    if(ensNames.length > 0){
      // TODO: probably there is a better way to merge
      let _data = _.cloneDeep(width > 480 ? data : mobileData);
      let _csv_data = _.cloneDeep(csv_data);
      for (let i = 0; i < tokens.length; i++) {
        let validName = ensNames[i]
        if (validName) {
          if (data[i]) {
            if (width > 480) {
              _data[i].col2 = (<a href={"https://app.poap.xyz/scan/" + tokens[i].owner.id} target="_blank"  rel="noopener noreferrer" data-tip='View Collection in POAP.scan'> <ReactTooltip effect='solid' /> {validName}</a>)
            } else {
              _data[i].col1 = <MobileRow token={tokens[i]} address={validName} />
            }
            _csv_data[i+1][2] = validName // i+1 is there to compensate for the first array which is just the csv titles
          }
        }
      }
      if (width > 480) {
        setData(_data)
      } else {
        setMobileData(_data)
      }
      setCsv_data(_csv_data)
    }
  }, [ensNames]) /* eslint-disable-line react-hooks/exhaustive-deps */

  const columns = useMemo(
    () => [
      {
        Header: () => (<><span data-tip="Click to sort by ID">POAP ID </span><ReactTooltip effect='solid' /></>),
        accessor: 'col1', // accessor is the "key" in the data
      },
      {
        Header: 'Collection',
        accessor: 'col2',
      },
      {
        Header: 'Minting Date',
        accessor: 'col3',
      },
      {
        Header: (<><span data-tip="Click to sort by TX Count">TX Count </span><ReactTooltip effect='solid' /></>),
        accessor: 'col4',
      },
      {
        Header: () => (<><span><span data-tip="Click to sort by Power" data-for='power-order'>Power</span> <FontAwesomeIcon icon={faQuestionCircle} data-tip="Total amount of POAPs held by this address" data-for='power-info' /><ReactTooltip id='power-info' effect='solid' /> </span><ReactTooltip id='power-order' effect='solid' /></>),
        accessor: 'col5',
      },
    ],
    []
  )

  const mobileColumns = useMemo(
    () => [
      {
        Header: '',
        accessor: 'col1', // accessor is the "key" in the data
      }
    ],
    []
  )

  if (loadingEvent === 'loading' || loadingEvent === 'idle') {
    return (
      <main id="site-main" role="main" className="app-content event-main">
        <Helmet>
          <title>POAP Gallery - Event</title>
          <link rel="canonical" href={"https://poap.gallery/event/" + eventId}/>
          <meta property="og:url" content={"https://poap.gallery/event/" + eventId}/>
          <meta property="og:title" content="POAP Gallery - Event"/>
        </Helmet>
        <Foliage />
        <div style={{display: 'flex', justifyContent: 'center'}}>
          <Loader />
        </div>
      </main>
    )
  }

  if (errorEvent || Object.keys(event).length === 0) {
    return (
      <main id="site-main" role="main" className="app-content event-main">
        <Helmet>
          <title>POAP Gallery - Event</title>
          <link rel="canonical" href={"https://poap.gallery/event/" + eventId}/>
          <meta property="og:url" content={"https://poap.gallery/event/" + eventId}/>
          <meta property="og:title" content="POAP Gallery - Event"/>
        </Helmet>
        <Foliage />
        <div style={{display: 'flex', justifyContent: 'center', flexDirection: 'column', margin: '0 auto', textAlign: 'center'}}>
          <h2>{errorEvent || 'Token not found'}</h2>
          <div >
            <img alt="warning sign" style={{maxWidth: '30rem'}} src="/icons/warning.svg"/>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main id="site-main" role="main" className="app-content event-main">
      <Helmet>
        <title>POAP Gallery - Event</title>
        <link rel="canonical" href={"https://poap.gallery/event/" + eventId}/>
        <meta property="og:url" content={"https://poap.gallery/event/" + eventId}/>
        <meta property="og:title" content="POAP Gallery - Event"/>
      </Helmet>
      <Foliage />
      <div className="container">
        <div style={{
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap',
          alignContent: 'space-around',
          justifyContent: 'space-around',
          marginBottom: 82,
          }}>
          <div style={{flex: '0 0 18rem', display: 'flex', flexDirection: "column", justifyContent: "center"}}>
            <div className='prev-next-buttons' style={{display: 'flex', justifyContent: 'space-between', marginBottom: 38,}}>
              <a href={parseInt(eventId)-1} ><FontAwesomeIcon icon={faAngleLeft}/>{'  Prev'}</a>
              <h4 style={{marginBottom: '0'}}><div className='event-title'>EVENT ID</div><div className='event-id'>#{eventId}</div> </h4>
              <a href={parseInt(eventId)+1} >{'Next  '}<FontAwesomeIcon icon={faAngleRight}/></a>
            </div>
            <div style={{minHeight: '200px', margin: '0 auto'}}>
              <EventCard key={0} event={event} size='l' power={power} />
            </div>
          </div>
        </div>
        <div className='table-header'>
          <div className='table-title'>Collections <span>({tokens.length})</span></div>
          <CSVLink
            filename={`${event.name}.csv`}
            target="_blank"
            className="btn"
            style={{
              width: 'fit-content',
              minWidth: 'auto',
              marginBottom: '0px',
              marginLeft: 'auto',
              padding: '12px 32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 6px 18px 0 #6534FF4D',
            }}
            data={csv_data}
          >
            <span>Download CSV</span>
          </CSVLink>
        </div>
        <div className='table-container'>
          {
            width > 480
            ? <CreateTable event={event} loading={loadingEvent !== 'succeeded'} columns={columns} data={data} pageCount={pageCount} />
            : <CreateMobileTable event={event} loading={loadingEvent !== 'succeeded'} columns={mobileColumns} data={mobileData} pageCount={pageCount} />
          }
        </div>
      </div>
    </main>
  );
}

function ExternalLinkCell({url, tooltipText = null, content}) {
  const [isHovering, setIsHovering] = useState(false)
  const [isHoveringLink, setIsHoveringLink] = useState(false)
  const width = useWindowWidth()
  let hoverDeactivateTimeout = null;
  let hoverLinkDeactivateTimeout = null;
  useEffect(()=>{
    return () => {
      // Clear timeouts on unmount
      clearTimeout(hoverDeactivateTimeout)
      clearTimeout(hoverLinkDeactivateTimeout)
    }
  })
  return (
    <a href={url} target="_blank" rel="noopener noreferrer"
       data-tip={tooltipText}
       data-for='mainTooltip'
       onMouseEnter={() => {setIsHovering(true)}}
       onMouseLeave={() => {hoverDeactivateTimeout = setTimeout(() => {
         if (!isHoveringLink) setIsHovering(false)
       }, 500)}}
       style={{position: 'relative', width: 27}}
    >
      <span>{shrinkAddress(content, width > 768 ? 20 : 10)}</span><ReactTooltip id='mainTooltip' effect='solid'/>
       {
         isHovering &&
         <><div className='external-link'
              data-tip='Open external link'
              data-for='linkTooltip'
              onMouseEnter={() => {clearTimeout(hoverDeactivateTimeout); clearTimeout(hoverLinkDeactivateTimeout); setIsHoveringLink(true)}}
              onMouseLeave={() => {hoverLinkDeactivateTimeout = setTimeout(() => {
                setIsHoveringLink(false)
                setIsHovering(false)
              }, 500)}}
         >
           <img src={OpenLink} alt={'Open external link'} />
         </div><ReactTooltip id='linkTooltip' effect='solid' place='bottom'/></> }
   </a>
 );
}

function CreateTable({loading, pageCount: pc, columns, data, event}) {
  const [length, setLength] = useState(20);
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    page,
    setPageSize,
  } = useTable({ columns, data, pageCount: pc,
    initialState: { pageSize: length, sortBy: [
        {
          id: 'col3',
          desc: true
        }
      ] } }, useSortBy, usePagination)

  const [dateFormat, setDateFormat] = useState('timeago')
  const toggleDateFormat = () => {
    dateFormat === 'timeago' ? setDateFormat('date') : setDateFormat('timeago')
  }

  return (
    <div style={{width: '100%'}} className='event-table'>
      <table style={{ width: '100%' }} {...getTableProps()}>
      <thead>
        {// Loop over the header rows
        headerGroups.map((headerGroup, i) => (
          // Apply the header row props
          <tr key={i} {...headerGroup.getHeaderGroupProps()}>
            {// Loop over the headers in each row
            headerGroup.headers.map((column, idx) => (
              // Apply the header cell props
              (idx === 0 || idx === 3 || idx === 4)
                ? <th key={idx} {...column.getHeaderProps(column.getSortByToggleProps({title: undefined}))}>
                  {// Render the header
                  column.render('Header')}{' '}
                  {column.isSorted
                    ? column.isSortedDesc
                      ? <FontAwesomeIcon style={{ width: '1rem', marginRight: '.2rem' }} icon={faArrowDown} />
                      : <FontAwesomeIcon style={{ width: '1rem', marginRight: '.2rem' }} icon={faArrowUp} />
                    : ''}
                  </th>
                :
              idx === 2
                ? <th key={idx} {...column.getHeaderProps()}>
                  {// Render the header
                  column.render('Header')}{' '}
                  <FontAwesomeIcon onClick={toggleDateFormat} style={{ width: '1rem', marginRight: '.2rem', cursor: 'pointer' }} icon={faDotCircle} data-tip='Toggle date format'/> <ReactTooltip effect='solid' />
                </th>
                : <th key={idx} {...column.getHeaderProps()}>
                  {// Render the header
                  column.render('Header')}
                </th>
            ))}
          </tr>
        ))}
      </thead>
      {/* Apply the table body props */}
      <tbody {...getTableBodyProps()}>
          {page.map((row, i) => {
            prepareRow(row)
            return (
              <tr key={i} {...row.getRowProps()}>
                {row.cells.map((cell, idx) => {
                  return (
                    idx === 2
                    ? <td key={idx} {...cell.getCellProps()}>{dateCell(cell.value, dateFormat)}</td>
                    : <td key={idx} {...cell.getCellProps()}>{cell.render('Cell')}</td>
                )})}
              </tr>
            )
          })}
          <tr>
            {loading ? (
              // Use our custom loading state to show a loading indicator
              <td colSpan="10000">Loading...</td>
            ) : (
              <td colSpan="10000">
                
                {/* Showing {page.length} of {page.length}{' '}
                results */}
              </td>
            )}
          </tr>
        </tbody>
    </table>
    <div className="pagination">
      <InView
        threshold={1}
        onChange={(inView, entry) => {
          if (inView) {
            setLength(length + 20)
            setPageSize(length + 20)
          }
        }}
      >
        {({ inView, ref, entry }) => <div ref={ref}></div>}
      </InView>
    </div>
   </div>
  )
}

function CreateMobileTable({loading, pageCount: pc, columns, data, event}) {
  const [length, setLength] = useState(20);
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    page,
    setPageSize
  } = useTable({ columns, data, pageCount: pc, initialState: { pageSize: length } }, useSortBy, usePagination )

  return (
    <div style={{width: '100%'}} className='event-table'>
      <table style={{ width: '100%' }} {...getTableProps()}>
      <thead>
        {// Loop over the header rows
        headerGroups.map((headerGroup, i) => (
          // Apply the header row props
          <tr key={i} {...headerGroup.getHeaderGroupProps()}>
            {// Loop over the headers in each row
            headerGroup.headers.map((column, idx) => (
              // Apply the header cell props
              <th key={idx} {...column.getHeaderProps()}>
                {// Render the header
                column.render('Header')}
              </th>
            ))}
          </tr>
        ))}
      </thead>
      {/* Apply the table body props */}
      <tbody {...getTableBodyProps()}>
          {page.map((row, i) => {
            prepareRow(row)
            return (
              <tr key={i} {...row.getRowProps()}>
                {row.cells.map((cell, idx) => {
                  return (
                    <td key={idx} {...cell.getCellProps()}>{cell.render('Cell')}</td>
                )})}
              </tr>
            )
          })}
          <tr>
            {loading ? (
              // Use our custom loading state to show a loading indicator
              <td colSpan="10000">Loading...</td>
            ) : (
              <td colSpan="10000">
                
                {/* Showing {page.length} of {page.length}{' '}
                results */}
              </td>
            )}
          </tr>
        </tbody>
    </table>
    <div className="pagination">
      <InView
        threshold={1}
        onChange={(inView, entry) => {
          if (inView) {
            setLength(length + 20)
            setPageSize(length + 20)
          }
        }}
      >
        {({ inView, ref, entry }) => <div ref={ref}></div>}
      </InView>
    </div>
   </div>
  )
}

function calculatePower(csv_data) {
  if (!Array.isArray(csv_data) || csv_data.length <= 1) {
    return 0;
  }
  const power = csv_data.reduce((power, token, index) => {
    if(index === 0)
      return 0;
    return power + token[5]
  }, 0)
  return power;
}
