import React from 'react';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import relativeTime from 'dayjs/plugin/relativeTime';
import { ReactComponent as Rainbow } from '../assets/images/rainbow.svg';
import { ReactComponent as Poap } from '../assets/images/POAP.svg';
import { ReactComponent as PoapIn } from '../assets/images/poapin.svg';
import { ReactComponent as Welook } from '../assets/images/welook.svg';
import { ReactComponent as Zerion } from '../assets/images/zerion.svg';
import { ReactComponent as Zapper } from '../assets/images/zapper.svg';

//Partners
const POAP_EXPLORE_PARTNER = {
  name: 'POAP_EXPLORE',
  url: 'https://explore.poap.xyz',
};
const RAINBOW_PARTNER = { name: 'RAINBOW', url: 'https://rainbow.me' };
const WELOOK_PARTNER = { name: 'WELOOK', url: 'https://welook.io' };
const POAP_IN_PARTNER = { name: 'POAP_IN', url: 'https://poap.in/v' };
const ZERION_PARTNER = { name: 'ZERION', url: 'https://app.zerion.io' };
const ZAPPER_PARTNER = { name: 'ZAPPER', url: 'https://zapper.xyz' };

dayjs.extend(utc);
dayjs.extend(relativeTime);

export const shrinkAddress = (address, length) => {
  if (address.length < length) return address;
  return (
    address.substr(0, length / 2) +
    '…' +
    address.substr(address.length - (length / 2 - 1))
  );
};

export const debounce = (func, delay) => {
  let timer;
  return function () {
    let self = this;
    let args = arguments;
    clearTimeout(timer);
    timer = setTimeout(() => {
      func.apply(self, args);
    }, delay);
  };
};

export function isEmptyString(value) {
  return !value || !value.trim();
}

const utcTime = (value) => {
  return dayjs.utc(value);
};

export const utcDateFromNow = (value) => {
  return utcTime(value).fromNow();
};

export const utcDateFormatted = (value) => {
  return utcTime(value).format('D-MMM-YYYY').toUpperCase();
};

export const utcDateFull = (value) => {
  return dayjs.utc(value).toString();
};

export const dateCell = (cell, dateFormat) => {
  if (dateFormat === 'date') {
    return utcDateFormatted(cell);
  }
  return utcDateFromNow(cell);
};

export const sortInt = (e1, e2) =>
  Number.parseInt(e2.id) - Number.parseInt(e1.id);

export const toastInfoOptions = {
  icon: '',
  style: {
    backgroundColor: '#fff8e0',
  },
};

export const externalLinkSetter = (owner_id, name) => {
  const collectionLinks = {
    [POAP_EXPLORE_PARTNER.name]: `${POAP_EXPLORE_PARTNER.url}/${owner_id}`,
    [RAINBOW_PARTNER.name]: `${RAINBOW_PARTNER.url}/${owner_id}?family=POAP`,
    [WELOOK_PARTNER.name]: `${WELOOK_PARTNER.url}/${owner_id}`,
    [POAP_IN_PARTNER.name]: `${POAP_IN_PARTNER.url}/${owner_id}`,
    [ZERION_PARTNER.name]: `${ZERION_PARTNER.url}/${owner_id}/nfts?collections=41`,
    [ZAPPER_PARTNER.name]: `${ZAPPER_PARTNER.url}/nft/gnosis/0x22c1f6050e56d2876009903609a2cc3fef83b415?collectionOwners%5B%5D=${owner_id}`,
    default: '',
  };
  return collectionLinks[name] || collectionLinks['default'];
};
export const collectionlLinks = [
  {
    id: POAP_EXPLORE_PARTNER.name,
    icon: (
      <Poap
        style={{
          margin: '0 5px',
          verticalAlign: 'middle',
          width: '20px',
          height: '20px',
        }}
        alt={'Open external link'}
      />
    ),
    tooltipText: 'View Collection in Explore.poap.xyz',
  },
  {
    id: RAINBOW_PARTNER.name,
    icon: (
      <Rainbow
        style={{
          margin: '0 5px',
          verticalAlign: 'middle',
          width: '20px',
          height: '20px',
        }}
        alt={'Open external link'}
      />
    ),
    tooltipText: 'View Collection in Rainbow.me',
  },
  {
    id: ZERION_PARTNER.name,
    icon: (
      <Zerion
        style={{
          margin: '0 5px',
          verticalAlign: 'middle',
          width: '21px',
          height: '21px',
        }}
        alt={'Open external link'}
      />
    ),
    tooltipText: 'View Collection in Zerion.io',
  },
  {
    id: ZAPPER_PARTNER.name,
    icon: (
      <Zapper
        style={{
          margin: '0 5px',
          verticalAlign: 'middle',
          width: '21px',
          height: '21px',
        }}
        alt={'Open external link'}
      />
    ),
    tooltipText: 'View Collection in Zapper.xyz',
  },
  {
    id: WELOOK_PARTNER.name,
    icon: (
      <Welook
        style={{
          margin: '0 5px',
          verticalAlign: 'middle',
          width: '40px',
          height: '40px',
        }}
        alt={'Open external link'}
      />
    ),
    tooltipText: 'View Collection in Welook.io',
  },
  {
    id: POAP_IN_PARTNER.name,
    icon: (
      <PoapIn
        style={{
          margin: '0 5px',
          verticalAlign: 'middle',
          width: '20px',
          height: '20px',
        }}
        alt={'Open external link'}
      />
    ),
    tooltipText: 'View Collection in Poap.in',
  },
];
