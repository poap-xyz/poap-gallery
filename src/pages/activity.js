import React, {useEffect, useState} from 'react'
import ReactTooltip from 'react-tooltip';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faAngleDown, faAngleUp, faDotCircle, faQuestionCircle} from '@fortawesome/free-solid-svg-icons';
import {Helmet} from 'react-helmet'
import {useDispatch, useSelector} from 'react-redux';
import {
  fetchIndexData,
  selectMostClaimed,
  selectMostRecent,
  selectRecentEvents,
  selectUpcoming
} from '../store';
import {getMainnetTransfers, getxDaiTransfers, POAP_API_URL} from "../store/api";
import {EventCard} from "../components/eventCard";
import { Pill } from '../components/pill';
import Migration from '../assets/images/migrate.svg'
import Burn from '../assets/images/burn.svg'
import Claim from '../assets/images/claim.svg'
import Transfer from '../assets/images/transfer.svg'
import { Foliage } from '../components/foliage';
import {dateCell, shrinkAddress, transferType, utcDateFormatted, utcDateFromNow} from '../utilities/utilities';
import { useWindowWidth } from '@react-hook/window-size/throttled';
import { Link } from 'react-router-dom'
import { LazyImage } from '../components/LazyImage';


export default function Activity() {
  const dispatch = useDispatch()

  // Meanwhile get all the events
  useEffect(() => {
    dispatch(fetchIndexData());
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */

  const [loading, setLoading] = useState(false)
  const [transfers, setTransfers] = useState([])
  const [daitransfers, setDaiTransfers] = useState([])
  const [mainnetTransfers, setMainnetTransfers] = useState([])

  const mostClaimed = useSelector(selectMostClaimed)
  const mostRecent = useSelector(selectMostRecent)
  const upcoming = useSelector(selectUpcoming)
  const recentEvents = useSelector(selectRecentEvents)
  const [privateEvents, setPrivateEvents] = useState(undefined)
  const transferLimit = 15

  useEffect(()=>{
    if (recentEvents) {
      setPrivateEvents(recentEvents.filter(e => e.private_event))
    }
  },[recentEvents])
  useEffect(() => {
      setLoading(true)
      getMainnetTransfers(transferLimit)
        .then(
          (result) => {
            let transfers = result.data.transfers
            transfers.map(t => t.network = "mainnet")
            setMainnetTransfers(transfers)
            setLoading(false)
          },
          (error) => {
            setLoading(false)
            console.log('failed to query the graph',error)
          },
        );
  }, []);

  useEffect(() => {
      setLoading(true)
      getxDaiTransfers(transferLimit)
        .then(
          (result) => {
            let transfers = result.data.transfers
            transfers.map(t => t.network = "xDai")
            setDaiTransfers(transfers)
            setLoading(false)
          },
          (error) => {
            setLoading(false)
            console.log('failed to query the graph',error)
          },
        );
  }, []);

  useEffect(() => {
    let _transfers = daitransfers.concat(mainnetTransfers)
      // Filter ongoing private events
      .filter(t => {
        // Check if transfer belongs to a private event
        const privateEvent = privateEvents.find(e => e.id === t.token.event.id)
        if (privateEvent === undefined) return true;

        // If it does, check if it is an ongoing private event
        let evEndDate = new Date(privateEvent.end_date.replace(/-/g, ' ')).getTime()
        let now = new Date().getTime()

        // Show any transfers from finished private events
        return evEndDate <= now;
      })
      // Sort from newer to older
      .sort((a, b) => {
        return b.timestamp - a.timestamp
      })
      // Only show a few
      .slice(0, transferLimit)
    setTransfers(_transfers)
  }, [daitransfers, mainnetTransfers, privateEvents])

  return (
    <main id="site-main" role="main" className="app-content activity-main">
      <Helmet>
        <title>POAP Gallery - Activity</title>
        <link rel="canonical" href="https://poap.gallery/activity"/>
        <meta property="og:url" content="https://poap.gallery/activity"/>
        <meta property="og:title" content="POAP Gallery - Activity"/>
      </Helmet>
      <Foliage />
      <div className="activityContainer container" style={{
        maxWidth: 'none'
      }}>

        <div className="gallery-grid activity-grid" style={{ padding: '0 4rem', display: 'grid', justifyContent: 'center', gridAutoColumns: 295, minHeight: '380px' }}>
          {mostRecent && <EventCard event={mostRecent} size='m' type='most-recent'/>}
          {upcoming && <EventCard event={upcoming} size='m' type='upcoming'/>}
          {mostClaimed && <EventCard event={mostClaimed} size='m' type='most-claimed'/>}
        </div>

        <div className='table-container' style={{ marginTop: 50}}>
          <CreateTable loading={loading} transfers={transfers} />
        </div>

      </div>
    </main>
  )
}

function TokenRow({transfer, dateFormat}) {
  const type = transferType(transfer)
  const width = useWindowWidth()
  const [expanded, setExpanded] = useState(false)
  const toggleRowExpand = () => {
    setExpanded(!expanded)
  }
  return (
    width > 780
    ? <tr>
      <td className='recent-activity' style={{width:'100%'}}>
        {
          (type === 'Migration') ? <img src={Migration} alt="Migration" /> :
          (type === 'Claim') ? <img src={Claim} alt="Claim" /> :
          (type === 'Burn') ? <img src={Burn} alt="Burn" /> :
          <img src={Transfer} alt="Transfer" />
        }
        <a
          className='recent-activity-image'
          href={"https://app.poap.xyz/token/"+transfer.token.id} target="_blank"  rel="noopener noreferrer">
            <LazyImage
              src={`${POAP_API_URL}/token/${transfer.token.id}/image`}
              width={80}
              height={80}
              containerClasses="circle-container"
              containerStyles={{ margin: "0 24px 0 14px" }}
            />
        </a>
        <div className='recent-activity-content'>
          <div className='activity-type-pill'><Pill className={type} text={type} tooltip={false} /></div>
          <div className='time ellipsis'>{utcDateFromNow(transfer.timestamp * 1000)}</div>
          <TokenRowDescription transfer={transfer} />
        </div>
      </td>
      <td className='ellipsis'><a href={"https://app.poap.xyz/token/" + transfer.token.id} target="_blank"  rel="noopener noreferrer">{'#'}{transfer.token.id}</a></td>
      <td style={{minWidth: '50px'}}><a href={"https://app.poap.xyz/scan/" + transfer.to.id} target="_blank"  rel="noopener noreferrer">
          <span>{shrinkAddress(transfer.to.id, 15)}</span>
        </a></td>
      <td> {transfer.token.transferCount && transfer.token.transferCount > 0 ? transfer.token.transferCount : 'Claimed'} </td>
      <td style={{wordBreak: 'break-all'}} > { dateCell(transfer.timestamp * 1000, dateFormat) } </td>
    </tr>
    : <tr>
      <td className='mobile-row'>
        <div className='recent-activity' style={{width:'100%'}}>
          {
            (type === 'Migration') ? <img src={Migration} alt="Migration" /> :
            (type === 'Claim') ? <img src={Claim} alt="Claim" /> :
            (type === 'Burn') ? <img src={Burn} alt="Burn" /> :
            <img src={Transfer} alt="Transfer" />
          }
          {
            width > 430 &&
            <a
              className='recent-activity-image'
              href={"https://app.poap.xyz/token/"+transfer.token.id} target="_blank"  rel="noopener noreferrer">
                <LazyImage
                  src={`${POAP_API_URL}/token/${transfer.token.id}/image`}
                  width={80}
                  height={80}
                  containerStyles={{ margin: "0 24px 0 14px" }}
                />
            </a>
          }
          <div className='recent-activity-content'>
            <div className='activity-type-pill'><Pill className={type} text={type} tooltip={false} /></div>
            <div className='time ellipsis'>{utcDateFromNow(transfer.timestamp * 1000)}</div>
            <TokenRowDescription transfer={transfer} />
          </div>
          <span className='expand-button' style={{width: `calc(100% - 180px${width>430?' - 118px':''})`}}><FontAwesomeIcon onClick={toggleRowExpand} icon={expanded? faAngleUp:faAngleDown} /></span>
        </div>
        <div className={`mobile-row-content ${expanded ? 'open' : ''}`}>
          <span className='id-title'>POAP ID</span><span className='id-content'><a href={"https://app.poap.xyz/token/" + transfer.token.id} target="_blank"  rel="noopener noreferrer">{'#'}{transfer.token.id}</a></span>
          <span className='address-title'>Owner</span><span className='address-content ellipsis'><a href={"https://app.poap.xyz/scan/" + transfer.to.id} target="_blank"  rel="noopener noreferrer">
              <span>{
                width>480
                ? shrinkAddress(transfer.to.id, 25)
                : shrinkAddress(transfer.to.id, 10)}
              </span>
            </a></span>
          <span className='tr-count-title'>Transaction Count</span><span className='tr-count-content'>{transfer.token.transferCount}</span>
          <span className='claim-title'>Minting Date</span><span className='claim-content'>{ utcDateFormatted(transfer.timestamp * 1000) }</span>
        </div>
      </td>
    </tr>
  )
}

function TokenRowDescription({transfer}) {
  const type = transferType(transfer)
  return <div className='description'>{
    (type === 'Migration') ? <span>POAP migrated to
      <a href={"https://app.poap.xyz/scan/" + transfer.to.id} target="_blank"  rel="noopener noreferrer"> {transfer.to.id.substring(0, 16) + '…'} </a>
      from {transfer.network} to Ethereum</span> :
    (type === 'Claim') ? <span>POAP claimed on event <Link to={`/event/${transfer.token.event.id}`}>#{transfer.token.event.id}</Link> on {transfer.network}</span> :
    (type === 'Burn') ? <span>POAP burned on event <Link to={`/event/${transfer.token.event.id}`}>#{transfer.token.event.id}</Link> on {transfer.network}</span> :
    <span>POAP transferred from
      <a href={`https://app.poap.xyz/scan/${transfer.from.id}`} target="_blank"  rel="noopener noreferrer"> {shrinkAddress(transfer.from.id, 10)} </a> to
      <a href={`https://app.poap.xyz/scan/${transfer.to.id}`} target="_blank"  rel="noopener noreferrer"> {shrinkAddress(transfer.to.id, 10)}</a> on
      {' '}{transfer.network}
    </span>
  }</div>
}

function CreateTable({transfers, loading}) {
  const [dateFormat, setDateFormat] = useState('timeago')
  const width = useWindowWidth();
  const toggleDateFormat = () => {
    dateFormat === 'timeago' ? setDateFormat('date') : setDateFormat('timeago')
  }
  const tfers = []
  for (let i = 0; i < transfers.length; i++) {
    const t = transfers[i];
    tfers.push(<TokenRow key={t.id} transfer={t} dateFormat={dateFormat}/>)
  }
  if (tfers && tfers.length) {
    tfers.push(
      width>780
      ?<tr key={tfers.length} ><td/><td/><td/><td/><td/></tr>
      :<tr key={tfers.length}><td/></tr>)
  }
  return (
    <div style={{width: '100%'}} className='activity-table-container'>
      <table className="table" style={{ width: '100%', fontSize: '.93rem' }}>
        <thead>
          {
            width > 780
            ?<tr>
              <th style={{paddingLeft: '20px', textAlign: 'start'}}>Recent Activity</th>
              <th>POAP ID</th>
              <th>Collection</th>
              <th>TX count <FontAwesomeIcon icon={faQuestionCircle} data-tip="The amount of transactions this POAP has done since it the day it been claimed." /><ReactTooltip effect='solid'/> </th>
              <th>Minting Date <FontAwesomeIcon icon={faDotCircle} onClick={toggleDateFormat} data-tip="Toggle date format" style={{ width: '1rem', marginRight: '.2rem', cursor: 'pointer' }} /><ReactTooltip effect='solid'/></th>
            </tr>
            : <tr>
              <th style={{width: '100%'}}/>
            </tr>
          }
        </thead>
        <tbody>
          {loading ? <tr style={{height: '600px', width: 'inherit'}}><td className="loading" colSpan="6"/></tr> : tfers && tfers.length? tfers : (<tr><td style={{textAlign: 'center'}} colSpan="7">No Tokens Transferred</td></tr>)}
        </tbody>
      </table>
    </div>
  )
}
