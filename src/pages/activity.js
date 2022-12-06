import React, { useCallback, useEffect, useState } from 'react';
import ReactTooltip from 'react-tooltip';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faAngleDown,
  faAngleUp,
  faDotCircle,
  faQuestionCircle,
} from '@fortawesome/free-solid-svg-icons';
import { Helmet } from 'react-helmet';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchActivityPageData,
  selectMostClaimed,
  selectMostRecent,
  selectUpcoming,
} from '../store';
import { ActivityType, getLastTransfers, POAP_APP_URL } from '../store/api';
import { EventCard } from '../components/eventCard';
import { Pill } from '../components/pill';
import Migration from '../assets/images/migrate.svg';
import Burn from '../assets/images/burn.svg';
import Claim from '../assets/images/claim.svg';
import Transfer from '../assets/images/transfer.svg';
import { Foliage } from '../components/foliage';
import {
  dateCell,
  debounce,
  shrinkAddress,
  utcDateFormatted,
  utcDateFromNow,
} from '../utilities/utilities';
import { useWindowWidth } from '@react-hook/window-size/throttled';
import { Link } from 'react-router-dom';
import { LazyImage } from '../components/LazyImage';
import { toast } from 'react-hot-toast';

export default function Activity() {
  const dispatch = useDispatch();

  // Meanwhile get all the events
  useEffect(() => {
    dispatch(fetchActivityPageData());
  }, []);

  const [loading, setLoading] = useState(false);
  const [transfers, setTransfers] = useState([]);

  const mostClaimed = useSelector(selectMostClaimed);
  const mostRecent = useSelector(selectMostRecent);
  const upcoming = useSelector(selectUpcoming);
  const transferLimit = 15;

  const toastNewTransfersError = () =>
    toast.error('There was a problem loading recent activity', {});
  const debouncedToastNewTransfersError = useCallback(
    debounce(() => toastNewTransfersError(), 500),
    []
  );

  useEffect(() => {
    setLoading(true);
    getLastTransfers(transferLimit).then(
      (transfers) => {
        setTransfers(transfers);
        setLoading(false);
      },
      (error) => {
        debouncedToastNewTransfersError();
        setLoading(false);
        console.log('failed to fetch last transfers', error);
      }
    );
  }, [setLoading, getLastTransfers, debouncedToastNewTransfersError]);

  return (
    <main id="site-main" role="main" className="app-content activity-main">
      <Helmet>
        <title>POAP Gallery - Activity</title>
        <link rel="canonical" href="https://poap.gallery/activity" />
        <meta property="og:url" content="https://poap.gallery/activity" />
        <meta property="og:title" content="POAP Gallery - Activity" />
      </Helmet>
      <Foliage />
      <div
        className="activityContainer container"
        style={{
          maxWidth: 'none',
        }}
      >
        <div
          className="gallery-grid activity-grid"
          style={{
            padding: '0 4rem',
            display: 'grid',
            justifyContent: 'center',
            gridAutoColumns: 295,
            minHeight: '380px',
          }}
        >
          {mostRecent && (
            <EventCard event={mostRecent} size="m" type="most-recent" />
          )}
          {upcoming && <EventCard event={upcoming} size="m" type="upcoming" />}
          {mostClaimed && (
            <EventCard event={mostClaimed} size="m" type="most-claimed" />
          )}
        </div>

        <div className="table-container" style={{ marginTop: 50 }}>
          <CreateTable loading={loading} transfers={transfers} />
        </div>
      </div>
    </main>
  );
}

function TokenRow({ transfer, dateFormat }) {
  const width = useWindowWidth();
  const [expanded, setExpanded] = useState(false);
  const toggleRowExpand = () => {
    setExpanded(!expanded);
  };
  return width > 780 ? (
    <tr>
      <td className="recent-activity" style={{ width: '100%' }}>
        {transfer.type === ActivityType.MIGRATION ? (
          <img src={Migration} alt="Migration" />
        ) : transfer.type === ActivityType.CLAIM ? (
          <img src={Claim} alt="Claim" />
        ) : transfer.type === ActivityType.BURN ? (
          <img src={Burn} alt="Burn" />
        ) : (
          <img src={Transfer} alt="Transfer" />
        )}
        <a
          className="recent-activity-image"
          href={`${POAP_APP_URL}/token/${transfer.tokenId}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <LazyImage
            src={transfer.eventImage}
            width={80}
            height={80}
            containerClasses="circle-container"
            containerStyles={{ margin: '0 24px 0 14px' }}
          />
        </a>
        <div className="recent-activity-content">
          <div className="activity-type-pill">
            <Pill
              className={transfer.type}
              text={transfer.type}
              tooltip={false}
            />
          </div>
          <div className="time ellipsis">
            {utcDateFromNow(transfer.timestamp * 1000)}
          </div>
          <TokenRowDescription transfer={transfer} />
        </div>
      </td>
      <td className="ellipsis">
        <a
          href={`${POAP_APP_URL}/token/${transfer.tokenId}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          {'#'}
          {transfer.tokenId}
        </a>
      </td>
      <td style={{ minWidth: '50px' }}>
        <a
          href={`${POAP_APP_URL}/scan/${transfer.to}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <span>{shrinkAddress(transfer.to, 15)}</span>
        </a>
      </td>
      <td>
        {' '}
        {transfer.transferCount && transfer.transferCount > 0
          ? transfer.transferCount
          : 'Claimed'}{' '}
      </td>
      <td style={{ wordBreak: 'break-all' }}>
        {' '}
        {dateCell(transfer.timestamp * 1000, dateFormat)}{' '}
      </td>
    </tr>
  ) : (
    <tr>
      <td className="mobile-row">
        <div className="recent-activity" style={{ width: '100%' }}>
          <TransferIcon transferType={transfer.type} />
          {width > 430 && (
            <a
              className="recent-activity-image"
              href={`${POAP_APP_URL}/token/${transfer.tokenId}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <LazyImage
                src={transfer.eventImage}
                width={80}
                height={80}
                containerStyles={{ margin: '0 24px 0 14px' }}
              />
            </a>
          )}
          <div className="recent-activity-content">
            <div className="activity-type-pill">
              <Pill
                className={transfer.type}
                text={transfer.type}
                tooltip={false}
              />
            </div>
            <div className="time ellipsis">
              {utcDateFromNow(transfer.timestamp * 1000)}
            </div>
            <TokenRowDescription transfer={transfer} />
          </div>
          <span
            className="expand-button"
            style={{
              width: `calc(100% - 180px${width > 430 ? ' - 118px' : ''})`,
            }}
          >
            <FontAwesomeIcon
              onClick={toggleRowExpand}
              icon={expanded ? faAngleUp : faAngleDown}
            />
          </span>
        </div>
        <div className={`mobile-row-content ${expanded ? 'open' : ''}`}>
          <span className="id-title">POAP ID</span>
          <span className="id-content">
            <a
              href={`${POAP_APP_URL}/token/${transfer.tokenId}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {'#'}
              {transfer.tokenId}
            </a>
          </span>
          <span className="address-title">Owner</span>
          <span className="address-content ellipsis">
            <a
              href={`${POAP_APP_URL}/scan/${transfer.owner}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span>
                {width > 480
                  ? shrinkAddress(transfer.owner, 25)
                  : shrinkAddress(transfer.owner, 10)}
              </span>
            </a>
          </span>
          <span className="tr-count-title">Transaction Count</span>
          <span className="tr-count-content">{transfer.transferCount}</span>
          <span className="claim-title">Minting Date</span>
          <span className="claim-content">
            {utcDateFormatted(transfer.timestamp * 1000)}
          </span>
        </div>
      </td>
    </tr>
  );
}

function TransferIcon(transferType) {
  return (
    <>
      {transferType === ActivityType.MIGRATION ? (
        <img src={Migration} alt="Migration" />
      ) : transferType === ActivityType.CLAIM ? (
        <img src={Claim} alt="Claim" />
      ) : transferType === ActivityType.BURN ? (
        <img src={Burn} alt="Burn" />
      ) : (
        <img src={Transfer} alt="Transfer" />
      )}
    </>
  );
}

function TokenRowDescription({ transfer }) {
  return (
    <div className="description">
      {transfer.type === ActivityType.MIGRATION ? (
        <span>
          POAP migrated to
          <a
            href={`${POAP_APP_URL}/scan/${transfer.to}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {' '}
            {transfer.to.substring(0, 16) + '…'}{' '}
          </a>
          from {transfer.chain} to Ethereum
        </span>
      ) : transfer.type === ActivityType.CLAIM ? (
        <span>
          POAP claimed on event{' '}
          <Link to={`/event/${transfer.eventId}`}>#{transfer.eventId}</Link> on{' '}
          {transfer.chain}
        </span>
      ) : transfer.type === ActivityType.BURN ? (
        <span>
          POAP burned on event{' '}
          <Link to={`/event/${transfer.eventId}`}>#{transfer.eventId}</Link> on{' '}
          {transfer.chain}
        </span>
      ) : (
        <span>
          POAP transferred from
          <a
            href={`${POAP_APP_URL}/scan/${transfer.from}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {' '}
            {shrinkAddress(transfer.from, 10)}{' '}
          </a>{' '}
          to
          <a
            href={`${POAP_APP_URL}/scan/${transfer.to}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {' '}
            {shrinkAddress(transfer.to, 10)}
          </a>{' '}
          on {transfer.chain}
        </span>
      )}
    </div>
  );
}

function CreateTable({ transfers, loading }) {
  const [dateFormat, setDateFormat] = useState('timeago');
  const width = useWindowWidth();
  const toggleDateFormat = () => {
    dateFormat === 'timeago' ? setDateFormat('date') : setDateFormat('timeago');
  };
  const tfers = [];
  for (let i = 0; i < transfers.length; i++) {
    const t = transfers[i];
    const k = `${t.eventId}-${t.tokenId}`;
    tfers.push(<TokenRow key={k} transfer={t} dateFormat={dateFormat} />);
  }
  if (tfers && tfers.length) {
    tfers.push(
      width > 780 ? (
        <tr key={tfers.length}>
          <td />
          <td />
          <td />
          <td />
          <td />
        </tr>
      ) : (
        <tr key={tfers.length}>
          <td />
        </tr>
      )
    );
  }
  return (
    <div style={{ width: '100%' }} className="activity-table-container">
      <table className="table" style={{ width: '100%', fontSize: '.93rem' }}>
        <thead>
          {width > 780 ? (
            <tr>
              <th style={{ paddingLeft: '20px', textAlign: 'start' }}>
                Recent Activity
              </th>
              <th>POAP ID</th>
              <th>Collection</th>
              <th>
                TX count{' '}
                <FontAwesomeIcon
                  icon={faQuestionCircle}
                  data-tip="The amount of transactions this POAP has done since it the day it been claimed."
                />
                <ReactTooltip effect="solid" />{' '}
              </th>
              <th>
                Minting Date{' '}
                <FontAwesomeIcon
                  icon={faDotCircle}
                  onClick={toggleDateFormat}
                  data-tip="Toggle date format"
                  style={{
                    width: '1rem',
                    marginRight: '.2rem',
                    cursor: 'pointer',
                  }}
                />
                <ReactTooltip effect="solid" />
              </th>
            </tr>
          ) : (
            <tr>
              <th style={{ width: '100%' }} />
            </tr>
          )}
        </thead>
        <tbody>
          {loading ? (
            <tr style={{ height: '600px', width: 'inherit' }}>
              <td className="loading" colSpan="6" />
            </tr>
          ) : tfers && tfers.length ? (
            tfers
          ) : (
            <tr>
              <td style={{ textAlign: 'center' }} colSpan="7">
                No Tokens Transferred
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
