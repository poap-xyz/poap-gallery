export const XDAI_SUBGRAPH_URL = process.env.REACT_APP_XDAI_SUBGRAPH_URL;
export const MAINNET_SUBGRAPH_URL = process.env.REACT_APP_MAINNET_SUBGRAPH_URL;
export const POAP_API_URL = process.env.REACT_APP_POAP_API_URL;
export const POAP_APP_URL = process.env.REACT_APP_POAP_APP_URL;
export const PRYSM_APP_URL = process.env.REACT_APP_PRYSM_APP_URL;
export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
export const OrderType = {
  id: {
    name: 'Id',
    val: 'id'
  },
  tokenCount: {
    name: 'Supply',
    val: 'tokenCount'
  },
  transferCount: {
    name: 'Transfers',
    val: 'transferCount'
  },
  date: {
    name: 'Date',
    val: 'start_date'
  },
  city: {
    name: 'City',
    val: 'city'
  },
}
export const OrderDirection = {
  ascending: {
    name: 'Ascending',
    val: 'asc'
  },
  descending: {
    name: 'Descending',
    val: 'desc'
  },
}

export const PAGE_LIMIT = 20

export async function getPaginatedEvents({name = undefined, event_ids = undefined,
                                           offset = undefined, limit = undefined,
                                           orderBy = undefined, privateEvents = undefined}) {
  const url = new URL(`${POAP_API_URL}/paginated-events`)
  if (name) {
    url.searchParams.append('name', name)
  }
  if (event_ids && event_ids.length) {
    url.searchParams.append('event_ids', event_ids)
  }
  if (limit && limit > 0) {
    url.searchParams.append('limit', limit)
  }
  if (offset !== undefined && offset >= 0) {
    url.searchParams.append('offset', offset)
  }
  if (orderBy?.type && orderBy?.order) {
    url.searchParams.append('sort_field', orderBy.type)
    url.searchParams.append('sort_dir', orderBy.order)
  }
  if (privateEvents !== undefined) {
    url.searchParams.append('private_event', privateEvents)
  }
  const res = await fetch(url.href)
  return res.json()
}

export async function getEvent(id) {
  const res = await fetch(`${POAP_API_URL}/events/id/${id}`)
  return res.json()
}

export async function getLayerEvents(url, first, skip, orderBy) {
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: `
      {
        events(orderBy: ${orderBy.type}, orderDirection: ${orderBy.order}, first: ${first}, skip: ${skip}) {
          id
          tokenCount
          transferCount
        }
      }
      `
    })
  })

	return res.json()
}

export async function getLayerEventsByIds(url, ids, first = null) {
  const ids_str = ids.map(id => "\"" + id + "\"").join(',')
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: `
      {
        events(where:{id_in: [${ids_str}]}${first && first > 0 ? `, first: ${first}` : ''}) {
          id
          tokenCount
          transferCount
        }
      }
      `
    })
  })

  return res.json()
}

export async function getMainnetEventsByIds(ids, first = null) {
  return getLayerEventsByIds(MAINNET_SUBGRAPH_URL, ids, first);
}

export async function getxDaiEventsByIds(ids, first = null) {
  return getLayerEventsByIds(XDAI_SUBGRAPH_URL, ids, first);

}

export async function getMainnetEvents(first, skip, orderBy) {
  return getLayerEvents(MAINNET_SUBGRAPH_URL, first, skip, orderBy);
}

export async function getxDaiEvents(first, skip, orderBy) {
  return getLayerEvents(XDAI_SUBGRAPH_URL, first, skip, orderBy);

}

export async function getLayerTokens(eventId, first, skip, url) {
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },

    body: JSON.stringify({
      query: `
        {
          tokens(where:{ event: "${eventId}",  owner_not: "${ZERO_ADDRESS}"}, first: ${first}, skip: ${skip}) {
            id
            transferCount
            created
            owner {
              id
              tokensOwned
            }
          },
          event(id: "${eventId}"){
            tokenCount
            transferCount
          }
        }
        `
		})
	})
	return res.json()
}


export async function getxDaiTokens(eventId, first, skip) {
  return getLayerTokens(eventId, first, skip, XDAI_SUBGRAPH_URL);
}

export async function getMainnetTokens(eventId, first, skip) {
	return getLayerTokens(eventId, first, skip, MAINNET_SUBGRAPH_URL);
}

export async function getLayerOwners(owners, url) {
  const owners_id = owners.map(owner => "\"" + owner + "\"").join(',')
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: `
      {
        accounts(where:{id_in: [${owners_id}]}) {
          id
          tokensOwned
        }
      }
      `
      })
  })
  return res.json()
}

export async function getXDaiOwners(owner) {
  return getLayerOwners(owner, XDAI_SUBGRAPH_URL);
}

export async function getMainnetOwners(owner) {
  return getLayerOwners(owner, MAINNET_SUBGRAPH_URL);
}

export async function getLayerTransfers(amount, url) {
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },

    body: JSON.stringify({
      query: `
          {
            transfers(first: ${amount}, orderBy: timestamp, orderDirection: desc) {
              id
              token {
                id
                transferCount
                event {
                  id
                }
              }
              from {
                id
              }
              to {
                id
              }
              timestamp
            }
          }
          `
    })
  })
  return res.json()
}

export async function getxDaiTransfers(amount) {
  return getLayerTransfers(amount, XDAI_SUBGRAPH_URL);
}

export async function getMainnetTransfers(amount) {
  return getLayerTransfers(amount, MAINNET_SUBGRAPH_URL);
}

export async function getMigrations(amount) {
  // Step 1: get most recently minted tokens in mainnet (since POAP only mints on layer 2, it's safe to assume they were migrated)
  const res = await fetch(MAINNET_SUBGRAPH_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },

    body: JSON.stringify({
      query: `
          {
            tokens(first: ${amount}, orderBy: created, orderDirection: desc) {
              id
              owner {
                id
              }
              event {
                id
              }
              transfers {
                id
              }
              created
            }
          }
          `
    })
  })
  return res.json()
}

export async function validateMigrations(migrations) {
  // Step 2: Verify the minted tokens have a burned counterpart in layer 2
  // TODO(sebas): add polygon check when we implement POAPs in the polygon chain
  const ids = migrations.map(t => "\"" + t.id + "\"").join(',')
  const res2 = await fetch(XDAI_SUBGRAPH_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },

    body: JSON.stringify({
      query: `
          {
            tokens(where: {id_in: [${ids}]}) {
              id
              owner {
                id
              }
              event {
                id
              }
              transfers {
                id
              }
              created
            }
          }
          `
    })
  })
  return res2.json()
}

export async function getTop3Events() {
  const res = await fetch(`${POAP_API_URL}/top-3-events`)
  return res.json()
}
