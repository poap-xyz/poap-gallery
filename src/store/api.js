import { PoapCompass } from '@poap-xyz/providers';
import {
  PAGINATED_DROPS_QUERY,
  SEARCH_PAGINATED_DROPS_QUERY,
} from './compass/queries/paginatedDrops';
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
export const isBlockchainOrderByType = (orderBy) =>
  orderBy.type === OrderType.tokenCount.val ||
  orderBy.type === OrderType.transferCount.val;

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

  let graphqlDrops = [];
  if (name) {
    const response = await compass.request(
      SEARCH_PAGINATED_DROPS_QUERY,
      variables
    );
    graphqlDrops = response.data.search_drops;
  } else {
    const response = await compass.request(PAGINATED_DROPS_QUERY, variables);
    graphqlDrops = response.data.drops;
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

  return { items: drops, total: 1000000 };
}

export async function getBlockchainPaginatedEvents({
  offset = undefined,
  limit = undefined,
  orderBy = undefined,
}) {
  let queryParams = {
    limit,
    offset,
  };

  if (orderBy?.type && orderBy?.order) {
    queryParams = {
      ...queryParams,
      sort_field: orderBy.type,
      sort_dir: orderBy.order,
    };
  }

  return await fetchPOAPApi('/blockchain-events', queryParams);
}

export async function getEvent(id) {
  return await fetchPOAPApi(`/events/id/${id}`);
}

export async function getEventTokens(id, limit, offset) {
  return await fetchPOAPApi(
    `/event/${id}/poaps?limit=${limit}&offset=${offset}`
  );
}

export async function getLastTransfers(limit = 10) {
  return await fetchPOAPApi('/activity', { limit });
}

export const ActivityType = {
  CLAIM: 'CLAIM',
  MIGRATION: 'MIGRATION',
  TRANSFER: 'TRANSFER',
  BURN: 'BURN',
};

export async function getTop3Events() {
  return await fetchPOAPApi('/top-3-events');
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
