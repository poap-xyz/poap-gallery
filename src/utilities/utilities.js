import { ZERO_ADDRESS } from '../store/api';
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import relativeTime from "dayjs/plugin/relativeTime";
import CyberConnect from '../assets/images/cyberConnect.svg';
import Mazury from '../assets/images/mazury.png';
import Poap from '../assets/images/POAP.svg';
import Prysm from '../assets/images/prysm.svg';
import Rainbow from '../assets/images/rainbow.png';
import Tally from '../assets/images/tally.png';
import {CYBERCONNECT_APP_URL, MAZURY_APP_URL, POAP_EXPLORE_APP_URL,
   PRYSM_APP_URL, RAINBOW_APP_URL, WITHTALLY_APP_URL} from "../store/api";

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

const PrysmScanLink = (token) => {
  return (`${PRYSM_APP_URL}/profile/${token.owner.id}/achievements`);
};

const PoapExploreLink = (token) => {
  return (`${POAP_EXPLORE_APP_URL}/${token.owner.id}`);
};

const RainbowLink = (token) => {
  return (`${RAINBOW_APP_URL}/${token.owner.id}`);
};

const MazuryLink = (token) => {
  return (`${MAZURY_APP_URL}/people/${token.owner.id}`);
};

const WithTallyLink = (token) => {
  return (`${WITHTALLY_APP_URL}/voter/${token.owner.id}`)
}

const CyberconnectLink = (token) => {
  return (`${CYBERCONNECT_APP_URL}/address/${token.owner.id}`);
};

export const collectionlLinks = [
  {
    id: 'POAP_EXPLORE',
    getUrl: PoapExploreLink,
    icon: Poap,
    tooltipText: 'View Collection in Explore.poap.xyz'
  },
  {
    id: 'PRYSM',
    getUrl: PrysmScanLink,
    icon: Prysm,
    tooltipText: 'View Collection in Prysm.xyz'
  },
  {
    id: 'RAINBOW',
    getUrl: RainbowLink,
    icon: Rainbow,
    tooltipText: 'View Collection in Rainbow.me'
  },
  {
    id: 'MAZURY',
    getUrl: MazuryLink,
    icon: Mazury,
    tooltipText: 'View Collection in Mazury.xyz'
  },
  {
    id: 'WITHTALLY',
    getUrl: WithTallyLink,
    icon: Tally,
    tooltipText: 'View Collection in Tally'
  },
  {
    id: 'CYBERCONNECT',
    getUrl: CyberconnectLink,
    icon: CyberConnect,
    tooltipText: 'View Collection in Cyberconnect.me'
  },
]