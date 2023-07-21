import { OrderType } from '../../api';

export function createFilter(key, value) {
  return value ? { [key]: { _ilike: `%${value}%` } } : {};
}

export function creatUndefinedOrder(key, value) {
  if (key == OrderType.tokenCount.val || key == OrderType.transferCount.val) {
    return { stats_by_chain_aggregate: { sum: { [key]: value } } };
  }
  return key && value ? { [key]: value } : {};
}
