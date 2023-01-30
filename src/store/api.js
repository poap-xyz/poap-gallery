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
    val: 'token_count',
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

export async function getPaginatedEvents({
  name = undefined,
  event_ids = undefined,
  offset = undefined,
  limit = undefined,
  orderBy = undefined,
  privateEvents = undefined,
}) {
  let queryParams = {
    name,
    event_ids,
    limit,
    offset,
    private_event: privateEvents,
    with_power: true,
  };

  if (orderBy?.type && orderBy?.order) {
    queryParams = {
      ...queryParams,
      sort_field: orderBy.type,
      sort_dir: orderBy.order,
    };
  }

  return await fetchPOAPApi('/paginated-events', queryParams);
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
