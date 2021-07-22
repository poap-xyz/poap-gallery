import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendar, faCoins, faGlobe, faHashtag, faLaptop, faPaperPlane, faClock, faFire } from "@fortawesome/free-solid-svg-icons";
import React, { useEffect, useState } from "react";
import ReactTooltip from 'react-tooltip';
import { MultiLineEllipsis } from './multiLineEllipsis';
import { Pill } from './pill';
import { useWindowWidth } from '@react-hook/window-size/throttled';
import ReactModal from 'react-modal';

export function EventCard({ event, size = 's', type = '', power = 0}) {
  const [tokenCount, setTokenCount] = useState(0);
  const [transferCount, setTransferCount] = useState(0);

  const width = useWindowWidth();
  const validateType = (type) => {
    if (size !== 'm') return '';
    if (type !== 'most-recent' && type !== 'upcoming' && type !== 'most-claimed') return '';
    return type;
  }
  const openLink = (url) => {
    // event.preventDefault();
    window.open(url, '_blank');
    return false;
  }

  type = validateType(type);
  useEffect(() => {
    if (event.tokenCount && event.tokenCount > tokenCount) {
      setTokenCount(event.tokenCount)
    }
  }, [event, tokenCount])
  useEffect(() => {
    if (event.transferCount && event.transferCount > transferCount) {
      setTransferCount(event.transferCount)
    }
  }, [event, transferCount])

  const nl2br = (text) => (text.split('\n').map((item, key) => {
    return <>{item}<br/></>
  }));
  
  const [isOpen, setOpen] = useState(!true)
  const toggleModal = () => {
    setOpen(!isOpen)
  }
  const Header = () => {

    return <div className={`header ${type}`} onClick={toggleModal}>
      <span onClick={toggleModal}>
        <img
          src={event.image_url}
          alt="POAP" />
      </span>
      <ReactModal
        isOpen={isOpen}
        contentLabel="Fullscreen event image"
        onRequestClose={toggleModal}
        // shouldCloseOnOverlayClick={false}
        // shouldCloseOnEsc={true}
        >
        <img
          src={event.image_url}
          alt="POAP" />
      </ ReactModal>
    </div>
  };

  const Content = () => (
    <div className="content">
      <div
        className="content-first"
        style={{
          overflow: 'hidden',
          width: '100%',
          padding: '1rem'
        }}>

        {/* event type */}
        <div className={`${type === '' ? 'hidden' : 'pill event-type'} ${type}`}>
          {
            type === 'most-recent' ? <div><FontAwesomeIcon style={{ width: '1rem', marginRight: '.2rem' }} icon={faClock} />Most recent</div> :
            type === 'upcoming' ? <div><FontAwesomeIcon style={{ width: '1rem', marginRight: '.2rem' }} icon={faCalendar} />Upcoming</div> :
            type === 'most-claimed' ? <div><FontAwesomeIcon style={{ width: '1rem', marginRight: '.2rem' }} icon={faFire} />Most claimed</div> :
            ''
          }
        </div>

        {/* title */}
        <h3
          data-tip={event.name}
          className="h4 content-title"
          style={{
            fontSize: '1rem',
            textAlign: 'center',
            margin: '8px 0 0 0',
            overflowWrap: 'anywhere',
          }}>
          <MultiLineEllipsis text={event.name} lines={2} maxLength={(size === 'l' ? (width > 768 ? 403 : width > 480 ? 303 : 203) : size === 'm' ? 262 : 229)}/>
        </h3>{size === 'l' && <ReactTooltip effect='solid' />}

        {/* description */}
        {
        size === 'l' ?
        <div className='content-description'>
          <div className='content-description-main'>{nl2br(event.description)}</div>
          <span onClick={() => openLink(event.event_url)} className='content-description-url ellipsis' target="_blank"  rel="noopener noreferrer">{event.event_url}</span>
        </div>
        :
        /* id */
        <div className='content-id'>
          <FontAwesomeIcon style={{ width: '1rem', marginRight: '.2rem' }} icon={faHashtag} />
          {event.id}
        </div>
        }

        {/* time and place */}
        <div className="content-time-place">
          <Pill style={{ minWidth: '110px'}} text={event.start_date} icon={faCalendar} />
          <Pill className="ellipsis" style={{ minWidth: '110px'}} tooltip={true} 
            icon={event.city ? faGlobe : faLaptop}
            text={event.city ? event.city : 'Virtual event '}/>
        </div>
      </div>
      
      {size !== 'l' && <hr />}

      <div
        className="content-second"
        style={{
          overflow: 'hidden',
          width: '100%',
          padding: '1rem'
        }}>
        {/* supply y transfers */}
        <div>
          <div className="title">
            <FontAwesomeIcon style={{ width: '1rem', marginRight: '.4rem' }} icon={faCoins} />{'SUPPLY'}
          </div>
          {tokenCount === undefined ? ' -' : tokenCount === 0 ? ' None Claimed' : tokenCount}
        </div>
        {
        size === 'l' &&
        <div>
          <div className="title">
            <FontAwesomeIcon style={{ width: '1rem', marginRight: '.4rem' }} icon={faFire} />{'POWER'}
          </div>
          {power}
        </div>
        }
        <div>
          <div className="title">
            <FontAwesomeIcon style={{ width: '1rem', marginRight: '.4rem' }} icon={faPaperPlane} />{'TRANSFERS'}
          </div>
          {transferCount}
        </div>
      </div>
    </div>
  )

  return (
    <Link to={'/event/' + event.id} className={`
      gallery-card
      ${(size === 'l') ? 'large' : (size === 'm') ? 'medium' : 'small'}`}>
      <Header url={event.image_url} />
      <Content />
    </Link>
  );
}
