import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ActivityType, getLastTransfers, POAP_APP_URL } from '../store/api';
import { Pill } from './pill';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock } from '@fortawesome/free-regular-svg-icons';
import TransferIcon from '../assets/images/transfer-icon.svg';
import ClaimIcon from '../assets/images/claim-icon.svg';
import MigrateIcon from '../assets/images/migrate-icon.svg';
import BurnIcon from '../assets/images/burn-icon.svg';
import { useWindowWidth } from '@react-hook/window-size/throttled';
import { debounce, utcDateFromNow } from '../utilities/utilities';
import { LazyImage } from './LazyImage';

export default function ActivityTable() {
  const [loading, setLoading] = useState(false);
  const [transfers, setTransfers] = useState([]);
  const transferLimit = 3;

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
    <div
      className="activity-table center"
      style={{ flexDirection: 'column', fontSize: '.89rem' }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <div className="activity-table-title-container">
          <div className="activity-table-title">POAP Gallery</div>
          <div className="activity-table-subtitle">
            Explore POAP.gallery and enjoy the adventure through the digital
            collectibles universe.
          </div>
        </div>
        <Transfers loading={loading} transfers={transfers} />
      </div>
      <div className={'center'} style={{ margin: '.5rem 0' }}>
        <Link to="/activity">
          <FontAwesomeIcon icon={faClock} /> View more activity
        </Link>
      </div>
    </div>
  );
}

function Transfer({ transfer }) {
  const width = useWindowWidth();
  return (
    <div className="transfer">
      {width > 480 && (
        <>
          <div
            className="dashed-line"
            style={{ height: `${transfer.opacity === 0.3 ? '0' : 'inherit'}` }}
          />
          <img
            style={{ width: '37px', zIndex: 2 }}
            src={
              transfer.type === ActivityType.MIGRATION
                ? MigrateIcon
                : transfer.type === ActivityType.CLAIM
                ? ClaimIcon
                : transfer.type === ActivityType.BURN
                ? BurnIcon
                : TransferIcon
            }
            alt={transfer.type}
          />
        </>
      )}
      <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
        <a
          href={`${POAP_APP_URL}/token/${transfer.tokenId}`}
          target="_blank"
          style={{ margin: '.8rem 0', opacity: transfer.opacity }}
          className={`round-box ${transfer.opacity === 1 ? 'first' : ''}`}
          rel="noopener noreferrer"
        >
          <div className="round-box-image">
            <LazyImage
              src={transfer.eventImage}
              width={50}
              height={50}
              containerClasses="circle-container"
            />
          </div>
          <div className="round-box-content">
            <Pill
              text={transfer.type}
              className={transfer.type}
              tooltip={false}
            />
            {transfer.type === ActivityType.CLAIM ? (
              <span>
                {' '}
                POAP claimed on event{' '}
                <object>
                  <Link to={`/event/${transfer.eventId}`}>
                    #{transfer.eventId}
                  </Link>
                </object>{' '}
                on {transfer.chain}
              </span>
            ) : transfer.type === ActivityType.TRANSFER ? (
              <span>
                POAP transferred from
                <object>
                  <a
                    href={`${POAP_APP_URL}/scan/${transfer.from}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {' '}
                    {transfer.from.substring(0, 8) + '…'}{' '}
                  </a>
                </object>{' '}
                to
                <object>
                  <a
                    href={`${POAP_APP_URL}/scan/${transfer.to}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {' '}
                    {transfer.to.substring(0, 8) + '…'}{' '}
                  </a>
                </object>
                on {transfer.chain}
              </span>
            ) : transfer.type === ActivityType.MIGRATION ? (
              <span>
                {' '}
                POAP migrated to
                <object>
                  <a
                    href={`${POAP_APP_URL}/scan/${transfer.to}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {' '}
                    {transfer.to.substring(0, 16) + '…'}{' '}
                  </a>
                </object>
                from {transfer.chain} to Ethereum
              </span>
            ) : transfer.type === ActivityType.BURN ? (
              <span>
                POAP burned on event{' '}
                <Link to={`/event/${transfer.eventId}`}>
                  #{transfer.eventId}
                </Link>{' '}
                on {transfer.chain}
              </span>
            ) : null}
          </div>
          {width > 768 && (
            <div className="round-box-time">
              {utcDateFromNow(transfer.timestamp * 1000)}
            </div>
          )}
        </a>
      </div>
    </div>
  );
}

function Transfers({ transfers }) {
  const tfers = [];
  for (let i = 0; i < transfers.length; i++) {
    const t = transfers[i];
    const k = `${t.eventId}-${t.tokenId}`;
    t.opacity = i === 0 ? 1.0 : i === 1 ? 0.7 : 0.3;
    tfers.push(<Transfer key={k} transfer={t} />);
  }
  return tfers;
}
