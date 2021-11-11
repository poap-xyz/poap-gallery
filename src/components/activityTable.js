import React, {useState, useEffect} from 'react'
import {Link} from 'react-router-dom'
import {getMainnetTransfers, getxDaiTransfers, POAP_API_URL} from "../store/api";
import { Pill } from './pill';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import { faClock } from '@fortawesome/free-regular-svg-icons';
import TransferIcon from '../assets/images/transfer-icon.svg'
import ClaimIcon from '../assets/images/claim-icon.svg'
import MigrateIcon from '../assets/images/migrate-icon.svg'
import BurnIcon from '../assets/images/burn-icon.svg'
import { useWindowWidth } from '@react-hook/window-size/throttled';
import {transferType, utcDateFromNow} from '../utilities/utilities'
import { LazyImage } from './LazyImage';

export default function ActivityTable() {

  const [loading, setLoading] = useState(false)
  const [transfers, setTransfers] = useState([])
  const [daitransfers, setDaiTransfers] = useState([])
  const [mainnetTransfers, setMainnetTransfers] = useState([])
  const transferLimit = 3
  
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
          console.log('failed to query the graph', error)
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
          console.log('failed to query the graph', error)
        },
      );
  }, []);

  useEffect(() => {
    let transfers = daitransfers.concat(mainnetTransfers)
    transfers.sort((a, b) => {
      return b.timestamp - a.timestamp
    })

    setTransfers(transfers.slice(0, transferLimit))
  }, [daitransfers, mainnetTransfers])

  return (
    <div className="activity-table"
         style={{display: "flex", flexDirection: "column", justifyContent: "center", fontSize: '.89rem'}}>
      <div style={{display:'flex', flexDirection: 'column', alignItems: 'center'}}>
        <div className='activity-table-title-container'>
          <div className="activity-table-title">POAP Gallery</div>
          <div className="activity-table-subtitle">Explore POAP.gallery and enjoy the adventure through the digital collectibles universe.</div>
        </div>
        <Transfers loading={loading} transfers={transfers}/>
      </div>
      <div style={{display: "flex", justifyContent: "center", margin: '.5rem 0'}}><Link to="/activity">
        <FontAwesomeIcon icon={faClock} />
        {' '}View more activity
      </Link></div>
    </div>
  )
}

function Transfer({transfer}) {
  const width = useWindowWidth();
  const type = transferType(transfer)
  return (
    <div className='transfer'>
      {width > 480 &&
        <>
        <div className='dashed-line' style={{height: `${transfer.opacity === 0.3 ? '0' : 'inherit'}`}}/>
        <img style={{width: `37px`, zIndex: 2}} src={type==='Migration'? MigrateIcon: type==='Claim'? ClaimIcon: type==='Burn'? BurnIcon:TransferIcon} alt={type} />
        </>
      }
      <div style={{display: 'flex', justifyContent: 'center', width: '100%'}}>
        <a href={"https://app.poap.xyz/token/" + transfer.token.id} target="_blank" style={{margin: '.8rem 0', opacity: transfer.opacity}} className={`round-box ${transfer.opacity===1? 'first':''}`} rel="noopener noreferrer">
          <div className='round-box-image'>
            <LazyImage
              src={`${POAP_API_URL}/token/${transfer.token.id}/image`}
              width={50}
              height={50}
              containerClasses="circle-container"
            />
          </div>
          <div className='round-box-content'>
            <Pill text={type} className={type} tooltip={false} />
            {
              (type === 'Claim')?
              <span> POAP claimed on event
                {' '}<Link to={`/event/${transfer.token.event.id}`}>#{transfer.token.event.id}</Link>
                {' '}on {transfer.network}
              </span> :
              (type === 'Transfer')?
              <span>POAP transferred from
                <a href={"https://app.poap.xyz/scan/" + transfer.from.id} target="_blank"  rel="noopener noreferrer"> {transfer.from.id.substring(0, 8) + '…'} </a> to 
                <a href={"https://app.poap.xyz/scan/" + transfer.to.id} target="_blank"  rel="noopener noreferrer"> {transfer.to.id.substring(0, 8) + '…'} </a>
                 on {transfer.network}
              </span> :
              (type === 'Migration')?
              <span> POAP migrated to 
                <a href={"https://app.poap.xyz/scan/" + transfer.to.id} target="_blank"  rel="noopener noreferrer"> {transfer.to.id.substring(0, 16) + '…'} </a>
                from {transfer.network} to Ethereum
              </span> :
              (type === 'Burn')?
              <span>POAP burned on event <Link to={`/event/${transfer.token.event.id}`}>#{transfer.token.event.id}</Link> on {transfer.network}</span> :
              null
            }

          </div>
          {width > 768 && 
            <div className='round-box-time'>
              {utcDateFromNow(transfer.timestamp * 1000)}
            </div>}
        </a>
      </div>
    </div>
  )
}

function Transfers({transfers, loading}) {
  const tfers = []
  for (let i = 0; i < transfers.length; i++) {
    const t = transfers[i];
    t.opacity = i===0? 1.0: i===1? 0.7: 0.3;
    tfers.push(<Transfer key={t.id} transfer={t}/>)
  }
  return tfers
}
