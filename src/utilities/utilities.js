import { ZERO_ADDRESS } from '../store/api';
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import relativeTime from "dayjs/plugin/relativeTime";
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
