import { PoapCompass } from '@poap-xyz/providers';
import {
  DROPS_COUNT,
  PAGINATED_DROPS_QUERY,
  SEARCH_DROPS_COUNT,
  SEARCH_PAGINATED_DROPS_QUERY,
  TRANSFER_ACTIVITY_QUERY,
} from './compass/queries/drops';
import { creatUndefinedOrder, createSearchFilter } from './compass/utils';

export const POAP_API_URL = process.env.REACT_APP_POAP_API_URL;
export const POAP_API_API_KEY = process.env.REACT_APP_POAP_API_API_KEY;
export const POAP_APP_URL = process.env.REACT_APP_POAP_APP_URL;
export const OrderType = {
  id: {
    name: 'Id',
    val: 'id',
  },
  tokenCount: {
    name: 'Supply',
    val: 'poap_count',
  },
  transferCount: {
    name: 'Transfers',
    val: 'transfer_count',
  },
  date: {
    name: 'Date',
    val: 'start_date',
  },
  city: {
    name: 'City',
    val: 'city',
  },
};
export const OrderDirection = {
  ascending: {
    name: 'Ascending',
    val: 'asc',
  },
  descending: {
    name: 'Descending',
    val: 'desc',
  },
};

export const PAGE_LIMIT = 20;

const compass = new PoapCompass(
  'you_api_key',
  'https://public.compass.poap.tech/v1/graphql'
);

export async function getPaginatedEvents({
  name = undefined,
  offset = undefined,
  limit = undefined,
  orderBy = undefined,
}) {
  const variables = {
    limit,
    offset,
    where: {
      private: { _eq: 'false' },
      stats_by_chain: { poap_count: { _gte: 1 } },
    },
    orderBy: creatUndefinedOrder(orderBy.type, orderBy.order),
    ...createSearchFilter('name', name),
  };

  let graphqlDrops;
  let total;
  if (name) {
    const results = await Promise.all([
      compass.request(SEARCH_PAGINATED_DROPS_QUERY, variables),
      compass.request(SEARCH_DROPS_COUNT, variables),
    ]);
    graphqlDrops = results[0].data.search_drops;
    total = results[1].data.search_drops_aggregate.aggregate.count;
  } else {
    const results = await Promise.all([
      compass.request(PAGINATED_DROPS_QUERY, variables),
      compass.request(DROPS_COUNT, variables),
    ]);
    graphqlDrops = results[0].data.drops;
    total = results[1].data.drops_aggregate.aggregate.count;
  }

  const drops = graphqlDrops.map((drop) => {
    return {
      ...drop,
      tokenCount: drop.stats_by_chain_aggregate.aggregate.sum
        ? Number(drop.stats_by_chain_aggregate.aggregate.sum.poap_count)
        : 0,
      transferCount: drop.stats_by_chain_aggregate.aggregate.sum
        ? Number(drop.stats_by_chain_aggregate.aggregate.sum.transfer_count)
        : 0,
    };
  });

  return { items: drops, total };
}

export async function getDrop(id) {
  const paginatedResult = await compass.request(PAGINATED_DROPS_QUERY, {
    limit: 1,
    offset: 0,
    where: {
      id: { _eq: parseInt(id) },
    },
  });

  if (paginatedResult.data.drops.length === 0) return undefined;

  const drop = paginatedResult.data.drops[0];
  return {
    ...drop,
    tokenCount: drop.stats_by_chain_aggregate.aggregate.sum
      ? Number(drop.stats_by_chain_aggregate.aggregate.sum.poap_count)
      : 0,
    transferCount: drop.stats_by_chain_aggregate.aggregate.sum
      ? Number(drop.stats_by_chain_aggregate.aggregate.sum.transfer_count)
      : 0,
  };
}

export async function getEventTokens(id, limit, offset) {
  return await fetchPOAPApi(
    `/event/${id}/poaps?limit=${limit}&offset=${offset}`
  );
}

export async function getLastTransfers(limit = 10) {
  const getTransferActivityType = (transfer) => {
    if (
      transfer.from_address === '0x0000000000000000000000000000000000000000'
    ) {
      if (['xdai', 'chiado'].includes(transfer.chain)) {
        return ActivityType.CLAIM;
      } else {
        return ActivityType.MIGRATION;
      }
    }
    if (transfer.to_address === '0x0000000000000000000000000000000000000000') {
      return ActivityType.BURN;
    }
    return ActivityType.TRANSFER;
  };

  const transfersResponse = await compass.request(TRANSFER_ACTIVITY_QUERY, {
    limit: limit,
    orderBy: [{ timestamp: 'desc' }],
  });
  return transfersResponse.data.transfers.map((transfer) => {
    return {
      type: getTransferActivityType(transfer),
      to: transfer.to_address,
      from: transfer.from_address,
      owner: transfer.poap.collector_address,
      tokenId: transfer.poap.id,
      eventId: transfer.poap.drop.id,
      eventImage: transfer.poap.drop.image_url,
      transferCount: transfer.poap.transfer_count,
      timestamp: transfer.timestamp,
      chain: transfer.chain,
    };
  });
}

export const ActivityType = {
  CLAIM: 'CLAIM',
  MIGRATION: 'MIGRATION',
  TRANSFER: 'TRANSFER',
  BURN: 'BURN',
};

export function getActivityName(type) {
  return type !== ActivityType.CLAIM ? ActivityType.CLAIM : 'MINT';
}

export function getChainName(chain) {
  if (chain === 'xdai') {
    return 'gnosis';
  }
  return chain;
}

export async function getTop3Events() {
  const fromCompassDropToEventInfo = (compassDrop) => {
    return {
      ...compassDrop,
      tokenCount:
        compassDrop.stats_by_chain_aggregate.aggregate.sum.poap_count ?? 0,
      transferCount:
        compassDrop.stats_by_chain_aggregate.aggregate.sum.transfer_count ?? 0,
    };
  };

  const top3Events = await Promise.all([
    compass.request(PAGINATED_DROPS_QUERY, {
      limit: 1,
      offset: 0,
      orderBy: [
        {
          stats_by_chain_aggregate: { sum: { poap_count: 'desc_nulls_last' } },
        },
      ],
      where: {
        private: { _eq: 'false' },
      },
    }),
    // Upcoming
    compass.request(PAGINATED_DROPS_QUERY, {
      limit: 1,
      offset: 0,
      orderBy: [{ start_date: 'asc' }],
      where: {
        private: { _eq: 'false' },
        start_date: { _gt: 'now' },
        stats_by_chain: { poap_count: { _gte: 1 } },
      },
    }),
    // Most recent
    compass.request(PAGINATED_DROPS_QUERY, {
      limit: 1,
      offset: 0,
      orderBy: [{ start_date: 'desc' }],
      where: {
        private: { _eq: 'false' },
        start_date: { _lt: 'now' },
        stats_by_chain: { poap_count: { _gte: 1 } },
      },
    }),
  ]);
  return {
    mostClaimed: fromCompassDropToEventInfo(top3Events[0].data.drops[0]),
    upcoming: fromCompassDropToEventInfo(top3Events[1].data.drops[0]),
    mostRecent: fromCompassDropToEventInfo(top3Events[2].data.drops[0]),
  };
}

function setQueryParamsToUrl(url, queryParams) {
  if (!queryParams) {
    return;
  }

  for (const key in queryParams) {
    const value = queryParams[key];

    if (value === undefined) {
      continue;
    }

    url.searchParams.append(key, value);
  }
}

function buildPOAPApiHeaders(init) {
  const headers = { 'X-API-Key': POAP_API_API_KEY };

  if (!init || !init.headers) {
    return headers;
  }

  return { ...init.headers, ...headers };
}

async function fetchPOAPApi(path, queryParams, init) {
  const url = new URL(`${POAP_API_URL}${path}`);
  const headers = buildPOAPApiHeaders(init);

  setQueryParamsToUrl(url, queryParams);

  const res = await fetch(url, { headers });
  return res.json();
}
