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

//Partners
const PRYSM_PARTNER = { "name": 'PRYSM', "url": 'https://beta.prysm.xyz' }
const POAP_EXPLORE_PARTNER = { "name": 'POAP_EXPLORE', "url": 'https://explore.poap.xyz' }
const RAINBOW_PARTNER = { "name": 'RAINBOW', "url": 'https://rainbow.me' }
const MAZURY_PARTNER = { "name": 'MAZURY', "url": 'https://app.mazury.xyz' }
const CYBERCONNECT_PARTNER = { "name": 'CYBERCONNECT', "url": 'https://app.cyberconnect.me' }
const WITHTALLY_PARTNER = { "name": 'WITHTALLY', "url": 'https://www.withtally.com' }
const GM_PARTNER = { "name": 'GM', "url": 'https://gm.xyz' }
const MOCA_PARTNER = { "name": 'MOCA', "url": 'https://app.museumofcryptoart.com' }
const WELOOK_PARTNER = { "name": 'WELOOK', "url": 'https://welook.io' }
const BACKDROP_PARTNER = { "name": 'BACKDROP', "url": 'https://backdrop.so' }
const LIGHT_PARTNER = { "name": 'LIGHT', "url": 'https://light.so' }

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
    [PRYSM_PARTNER.name]: `${PRYSM_PARTNER.url}/profile/${owner_id}/achievements`,
    [POAP_EXPLORE_PARTNER.name]: `${POAP_EXPLORE_PARTNER.url}/${owner_id}`,
    [RAINBOW_PARTNER.name]: `${RAINBOW_PARTNER.url}/${owner_id}`,
    [MAZURY_PARTNER.name]: `${MAZURY_PARTNER.url}/people/${owner_id}`,
    [CYBERCONNECT_PARTNER.name]: `${CYBERCONNECT_PARTNER.url}/address/${owner_id}`,
    [WITHTALLY_PARTNER.name]: `${WITHTALLY_PARTNER.url}/voter/${owner_id}`,
    [GM_PARTNER.name]: `${GM_PARTNER.url}/u/${owner_id}`,
    [MOCA_PARTNER.name]: `${MOCA_PARTNER.url}/member/${owner_id}`,
    [WELOOK_PARTNER.name]: `${WELOOK_PARTNER.url}/${owner_id}`,
    [BACKDROP_PARTNER.name]: `${BACKDROP_PARTNER.url}/${owner_id}`,
    [LIGHT_PARTNER.name]: `${LIGHT_PARTNER.url}/${owner_id}`,
    'default': ''
  };
  return collectionLinks[name] ||  collectionLinks['default']
}

export const collectionlLinks = [
  {
    id: POAP_EXPLORE_PARTNER.name,
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
    id: PRYSM_PARTNER.name,
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
    id: RAINBOW_PARTNER.name,
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
    id: MAZURY_PARTNER.name,
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
    id: WITHTALLY_PARTNER.name,
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
    id: CYBERCONNECT_PARTNER.name,
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
    id: GM_PARTNER.name,
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
    id: MOCA_PARTNER.name,
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
    id: WELOOK_PARTNER.name,
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
    id: BACKDROP_PARTNER.name,
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
    id: LIGHT_PARTNER.name,
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
