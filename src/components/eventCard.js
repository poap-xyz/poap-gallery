import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCalendar,
  faGlobe,
  faLaptop,
  faClock,
  faFire,
} from '@fortawesome/free-solid-svg-icons';
import React, { useEffect, useState } from 'react';
import { MultiLineEllipsis } from './multiLineEllipsis';
import { Pill } from './pill';
import { useWindowWidth } from '@react-hook/window-size/throttled';
import ReactModal from 'react-modal';
import Power from '../assets/images/power.svg';
import Transfers from '../assets/images/transfers.svg';
import Supply from '../assets/images/supply.svg';
import { LazyImage } from './LazyImage';
import { isEmptyString } from '../utilities/utilities';

export function EventCard({ event, size = 's', type = '', power = 0 }) {
  const width = useWindowWidth();
  const validateType = (type) => {
    if (size !== 'm') return '';
    if (
      type !== 'most-recent' &&
      type !== 'upcoming' &&
      type !== 'most-claimed'
    )
      return '';
    return type;
  };

  type = validateType(type);

  return (
    <Link
      to={'/event/' + event.id}
      className={`
      gallery-card
      ${size === 'l' ? 'large' : size === 'm' ? 'medium' : 'small'}`}
    >
      <Header event={event} type={type} />
      <Content
        event={event}
        type={type}
        width={width}
        size={size}
        power={power}
      />
    </Link>
  );
}

function Header({ type, event }) {
  const [isOpen, setOpen] = useState(false);
  const toggleModal = () => {
    setOpen(!isOpen);
  };

  return (
    <div className={`header ${type}`} onClick={toggleModal}>
      <span onClick={toggleModal}>
        <LazyImage
          src={event.image_url}
          width={120}
          height={120}
          alt="POAP"
          containerClasses="circle-container"
        />
      </span>
      <ReactModal
        isOpen={isOpen}
        contentLabel="Fullscreen event image"
        onRequestClose={toggleModal}
      >
        <LazyImage src={event.image_url} alt="POAP" />
      </ReactModal>
    </div>
  );
}

function renderLocation(event, size) {
  if (event.virtual_event) {
    return (
      <Pill
        className="ellipsis"
        icon={size === 's' ? null : faLaptop}
        text={'Virtual event '}
      />
    );
  }
  let inPersonLocation = 'In-person event ';
  if (!isEmptyString(event.city)) {
    inPersonLocation = event.city;
  } else if (!isEmptyString(event.country)) {
    inPersonLocation = event.country;
  }
  return (
    <Pill
      className="ellipsis"
      icon={size === 's' ? null : faGlobe}
      text={inPersonLocation}
    />
  );
}

function Content({ type, width, size, event, power }) {
  const [tokenCount, setTokenCount] = useState(0);
  const [transferCount, setTransferCount] = useState(0);

  useEffect(() => {
    if (event.tokenCount && event.tokenCount > tokenCount) {
      setTokenCount(event.tokenCount);
    }
  }, [event, tokenCount]);
  useEffect(() => {
    if (event.transferCount && event.transferCount > transferCount) {
      setTransferCount(event.transferCount);
    }
  }, [event, transferCount]);

  const nl2br = (text) =>
    text?.split(/\r?\n|\r|\n/g)?.map((item) => {
      return (
        <>
          <p className={'discreet-paragraph'} key={item.toString()}>
            {item}
          </p>
        </>
      );
    });

  return (
    <div className="content">
      <div
        className="content-first"
        style={{
          overflow: 'hidden',
          width: '100%',
          padding: '1rem',
        }}
      >
        {/* event type */}
        <div
          className={`${type === '' ? 'hidden' : 'pill event-type'} ${type}`}
        >
          {type === 'most-recent' ? (
            <div>
              <FontAwesomeIcon
                style={{ width: '1rem', marginRight: '.2rem' }}
                icon={size === 's' ? null : faClock}
              />
              Most recent
            </div>
          ) : type === 'upcoming' ? (
            <div>
              <FontAwesomeIcon
                style={{ width: '1rem', marginRight: '.2rem' }}
                icon={size === 's' ? null : faCalendar}
              />
              Upcoming
            </div>
          ) : type === 'most-claimed' ? (
            <div>
              <FontAwesomeIcon
                style={{ width: '1rem', marginRight: '.2rem' }}
                icon={size === 's' ? null : faFire}
              />
              Most minted
            </div>
          ) : (
            ''
          )}
        </div>

        {/* title */}
        <h3
          className="h4 content-title"
          style={{
            fontSize: '1rem',
            textAlign: 'center',
            overflowWrap: 'anywhere',
          }}
        >
          <MultiLineEllipsis
            text={event.name}
            lines={2}
            maxLengthPerLine={
              size === 'l'
                ? width >= 768
                  ? 403
                  : width >= 480
                  ? 303
                  : 203
                : size === 'm'
                ? 262
                : 229
            }
          />
        </h3>

        {/* description */}
        {size === 'l' ? (
          <div className="content-description">
            <div className="content-description-main">
              {nl2br(event.description)}
            </div>
            <span
              onClick={() => window.open(event.event_url, '_blank')}
              className="content-description-url ellipsis"
              target="_blank"
              rel="noopener noreferrer"
            >
              {event.event_url}
            </span>
          </div>
        ) : (
          /* id */
          <div className="content-id">
            {'#'}
            {event.id}
          </div>
        )}

        {/* time and place */}
        <div className="content-time-place">
          <Pill
            style={{ minWidth: size === 's' ? 'none' : '100px' }}
            text={event.start_date}
            icon={size === 's' ? null : faCalendar}
          />
          {event.start_date !== event.end_date && (
            <>
              -
              <Pill
                style={{ minWidth: size === 's' ? 'none' : '100px' }}
                text={event.end_date}
                icon={size === 's' ? null : faCalendar}
              />
            </>
          )}
          {renderLocation(event, size)}
        </div>
      </div>

      {size !== 'l' && <hr />}

      <div
        className="content-second"
        style={{
          overflow: 'hidden',
          width: '100%',
          padding: '1rem',
        }}
      >
        {/* supply y transfers */}
        <div>
          <div className="title">
            {size === 's' ? null : (
              <img
                style={{ width: '0.7rem', marginRight: '.4rem' }}
                src={Supply}
                alt="Supply"
              />
            )}
            {'SUPPLY'}
          </div>
          <span className="supply-content" style={{ width: 'fit-content' }}>
            {tokenCount === undefined
              ? ' -'
              : tokenCount === 0
              ? ' None Minted'
              : tokenCount}
          </span>
        </div>
        {size === 'l' && (
          <div>
            <div className="title">
              <img
                style={{ width: '0.7rem', marginRight: '.4rem' }}
                src={Power}
                alt="Power"
              />
              {'POWER'}
            </div>
            {power}
          </div>
        )}
        <div>
          <div className="title">
            {size === 's' ? null : (
              <img
                style={{ width: '0.7rem', marginRight: '.4rem' }}
                src={Transfers}
                alt="Transfers"
              />
            )}
            {'TRANSFERS'}
          </div>
          {transferCount}
        </div>
      </div>
    </div>
  );
}
