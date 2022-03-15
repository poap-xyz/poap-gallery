import React from 'react'
import { ZERO_ADDRESS } from '../store/api';
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import relativeTime from "dayjs/plugin/relativeTime";
import { ReactComponent as Mazury } from "../assets/images/mazury.svg";
import { ReactComponent as Rainbow } from "../assets/images/rainbow.svg";
import { ReactComponent as Tally } from "../assets/images/tally.svg";
import { ReactComponent as CyberConnect } from "../assets/images/cyberConnect.svg";
import { ReactComponent as Poap } from "../assets/images/POAP.svg";
import { ReactComponent as Prysm } from "../assets/images/prysm.svg";
import { ReactComponent as Gm } from "../assets/images/gm.svg";
import { ReactComponent as Moca } from "../assets/images/moca.svg";
import { ReactComponent as Welook } from "../assets/images/welook.svg";
import { ReactComponent as Backdrop } from "../assets/images/backdrop.svg";
import { ReactComponent as Light } from "../assets/images/light.svg";

const PRYSM_APP_URL = 'https://beta.prysm.xyz'
const POAP_EXPLORE_APP_URL = 'https://explore.poap.xyz'
const RAINBOW_APP_URL = 'https://rainbow.me'
const MAZURY_APP_URL = 'https://app.mazury.xyz'
const CYBERCONNECT_APP_URL = 'https://app.cyberconnect.me'
const WITHTALLY_APP_URL = 'https://www.withtally.com'
const GM_APP_URL = 'https://gm.xyz'
const MOCA_APP_URL = 'https://app.museumofcryptoart.com'
const WELOOK_APP_URL = 'https://welook.io'
const BACKDROP_APP_URL = 'https://backdrop.so'
const LIGHT_APP_URL = 'https://light.so'

dayjs.extend(utc)
dayjs.extend(relativeTime)


export const shrinkAddress = (address, length) => {
  if (address.length < length) return address;
  return address.substr(0, length/2) + '…' + address.substr(address.length - (length/2-1))
}

export const debounce = (func, delay) => {
  let timer;
  return function() {
    let self = this;
    let args= arguments;
    clearTimeout(timer);
    timer = setTimeout(() => {
      func.apply(self, args)
    }, delay)
  }
}

export const transferType = (transfer) => {
  return (transfer.from?.id === ZERO_ADDRESS)
          ? (transfer.network === 'mainnet')
            ? 'Migration':'Claim'
          : (transfer.to?.id === ZERO_ADDRESS)
            ? 'Burn':'Transfer'
};

const utcTime = (value) => {
  return dayjs.utc(value)
}

export const utcDateFromNow = (value) => {
  return utcTime(value).fromNow()
}

export const utcDateFormatted = (value) => {
  return utcTime(value).format('D-MMM-YYYY').toUpperCase()
}

export const utcDateFull = (value) => {
  return dayjs.utc(value).toString()
}

export const dateCell = (cell, dateFormat) => {
  if (dateFormat === 'date') {
    return utcDateFormatted(cell);
  }
  return utcDateFromNow(cell)
}

export const sortInt = (e1, e2) => (Number.parseInt(e2.id) - Number.parseInt(e1.id))

export const onlyUnique = (value, index, self) => {
  return self.indexOf(value) === index;
}

export const toastInfoOptions = {
  icon: '',
  style: {
    backgroundColor: '#fff8e0'
  }
}

export const externalLinkSetter = (owner_id, name) => {
  const collectionLinks = {
    'PRYSM': `${PRYSM_APP_URL}/profile/${owner_id}/achievements`,
    'POAP_EXPLORE': `${POAP_EXPLORE_APP_URL}/${owner_id}`,
    'RAINBOW': `${RAINBOW_APP_URL}/${owner_id}`,
    'MAZURY': `${MAZURY_APP_URL}/people/${owner_id}`,
    'CYBERCONNECT': `${CYBERCONNECT_APP_URL}/address/${owner_id}`,
    'WITHTALLY': `${WITHTALLY_APP_URL}/voter/${owner_id}`,
    'GM': `${GM_APP_URL}/u/${owner_id}`,
    'MOCA': `${MOCA_APP_URL}/member/${owner_id}`,
    'WELOOK': `${WELOOK_APP_URL}/${owner_id}`,
    'BACKDROP': `${BACKDROP_APP_URL}/${owner_id}`,
    'LIGHT': `${LIGHT_APP_URL}/${owner_id}`,
    'default': ''
  };
  return collectionLinks[name] ||  collectionLinks['default']
}

export const collectionlLinks = [
  {
    id: 'POAP_EXPLORE',
    icon: (
      <Poap
        style={{
          margin: "0 5px",
          verticalAlign: "middle",
          width: "20px",
          height: "20px",
        }}
        alt={"Open external link"}
      />
    ),
    tooltipText: 'View Collection in Explore.poap.xyz'
  },
  {
    id: 'PRYSM',
    icon: (
      <Prysm
        style={{
          margin: "0 5px",
          verticalAlign: "middle",
          width: "20px",
          height: "20px",
        }}
        alt={"Open external link"}
      />
    ),
    tooltipText: 'View Collection in Prysm.xyz'
  },
  {
    id: 'RAINBOW',
    icon: (
      <Rainbow
        style={{
          margin: "0 5px",
          verticalAlign: "middle",
          width: "20px",
          height: "20px",
        }}
        alt={"Open external link"}
      />
    ),
    tooltipText: 'View Collection in Rainbow.me'
  },
  {
    id: 'MAZURY',
    icon: (
      <Mazury
        style={{
          margin: "0 5px",
          verticalAlign: "middle",
          width: "20px",
          height: "20px",
        }}
        alt={"Open external link"}
      />
    ),
    tooltipText: 'View Collection in Mazury.xyz'
  },
  {
    id: 'WITHTALLY',
    icon: (
      <Tally
        style={{
          margin: "0 5px",
          verticalAlign: "middle",
          width: "20px",
          height: "20px",
        }}
        alt={"Open external link"}
      />
    ),
    tooltipText: 'View Collection in Tally'
  },
  {
    id: 'CYBERCONNECT',
    icon: (
      <CyberConnect
        style={{
          margin: "0 5px",
          verticalAlign: "middle",
          width: "20px",
          height: "20px",
        }}
        alt={"Open external link"}
      />
    ),
    tooltipText: 'View Collection in Cyberconnect.me'
  },
  {
    id: 'GM',
    icon: (
      <Gm
        style={{
          margin: "0 5px",
          verticalAlign: "middle",
          width: "20px",
          height: "20px",
        }}
        alt={"Open external link"}
      />
    ),
    tooltipText: 'View Collection in Gm.xyz'
  },
  {
    id: 'MOCA',
    icon: (
      <Moca
        style={{
          margin: "0 5px",
          verticalAlign: "middle",
          width: "30px",
          height: "30px",
        }}
        alt={"Open external link"}
      />
    ),
    tooltipText: 'View Collection in Museumofcryptoart.com'
  },
  {
    id: 'WELOOK',
    icon: (
      <Welook
        style={{
          margin: "0 5px",
          verticalAlign: "middle",
          width: "40px",
          height: "40px",
        }}
        alt={"Open external link"}
      />
    ),
    tooltipText: 'View Collection in Welook.io'
  },
  {
    id: 'BACKDROP',
    icon: (
      <Backdrop
        style={{
          margin: "0 5px",
          verticalAlign: "middle",
          width: "20px",
          height: "20px",
        }}
        alt={"Open external link"}
      />
    ),
    tooltipText: 'View Collection in Backdrop.so'
  },
  {
    id: 'LIGHT',
    icon: (
      <Light
        style={{
          margin: "0 5px",
          verticalAlign: "middle",
          width: "20px",
          height: "20px",
        }}
        alt={"Open external link"}
      />
    ),
    tooltipText: 'View Collection in Light.so'
  },
]
