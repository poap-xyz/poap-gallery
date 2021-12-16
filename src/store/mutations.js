import {
  getEvent,
  getMainnetEvents, getMainnetEventsByIds,
  getMainnetOwners,
  getMainnetTokens, getPaginatedEvents, getTop3Events,
  getxDaiEvents, getxDaiEventsByIds,
  getXDaiOwners,
  getxDaiTokens, OrderDirection, OrderType, PAGE_LIMIT
} from './api'
import {ensABI} from './abis';
import _, {parseInt, uniqBy} from 'lodash'
import {ethers} from 'ethers';
import namehash from 'eth-ens-namehash';
import {toast} from "react-hot-toast";
import {toastInfoOptions} from "../utilities/utilities";

const {REACT_APP_RPC_PROVIDER_URL, REACT_APP_ENS_CONTRACT} = process.env;
const provider = new ethers.providers.StaticJsonRpcProvider(REACT_APP_RPC_PROVIDER_URL);
const ReverseRecords = new ethers.Contract(REACT_APP_ENS_CONTRACT, ensABI, provider)

// TODO: Refactor to render as it returns data rather than waiting all in batch
export async function getEnsData(ownerIds){
  const chunked = _.chunk(ownerIds, 1200)
  let allnames = []
  for (let i = 0; i < chunked.length; i++) {
    const chunk = chunked[i];
    let names = await ReverseRecords.getNames(chunk)
    const validNames = names.map(name => {
      try {
        return (namehash.normalize(name) === name && name !== '') && name
      } catch (e) {
        if (name && name.length) {
          toast.error(`Couldn't parse ENS name '${name}'.`, toastInfoOptions)
        }
        return false
      }
    } )
    allnames = _.concat(allnames, validNames);
  }
  return allnames
}

function isValidSubgraphEvent(subgraphEvent) {
  return subgraphEvent.tokenCount && subgraphEvent.transferCount
}

function normalizeSubgraphEvents(subgraphEvents) {
  subgraphEvents.forEach(m => {
    m.id = parseInt(m.id)
    m.tokenCount = parseInt(m.tokenCount)
    m.transferCount = parseInt(m.transferCount)
  })
}

/**
 * Utility function that simplifies the process of making a list of valid events from the subgraphs
 * @param events list for event to be pushed into
 * @param event event to test for validity and push into events
 * @param chainId identifier that marks which chain it comes from
 * @returns true if pushing was successful, false if not
 */
function pushEvent(events, event, chainId) {
  if (!isValidSubgraphEvent(event)) {
    return false
  }
  const sameEvent = events.find(e => e.id === event.id)
  if (sameEvent) {
    sameEvent.tokenCount += event.tokenCount
    sameEvent.transferCount += event.transferCount
    sameEvent.chainId += `-${chainId}`
  } else {
    event.chainId = chainId
    events.push(event)
  }

  return true
}

function reduceSubgraphEvents(mainnetEvents, xdaiEvents, orderBy) {
  mainnetEvents = mainnetEvents.data.events
  xdaiEvents = xdaiEvents.data.events
  normalizeSubgraphEvents(mainnetEvents)
  normalizeSubgraphEvents(xdaiEvents)

  let subgraphEvents = [], mainnetIndex = 0, xdaiIndex = 0
  while (mainnetIndex < mainnetEvents.length || xdaiIndex < xdaiEvents.length) {
    const mainnetEvent = mainnetEvents[mainnetIndex]
    const xdaiEvent = xdaiEvents[xdaiIndex]
    if (mainnetEvent === undefined && xdaiEvent) {
      pushEvent(subgraphEvents, xdaiEvent, 'xdai')
      xdaiIndex++
    } else if (xdaiEvent === undefined && mainnetEvent) {
      pushEvent(subgraphEvents, mainnetEvent, 'mainnet')
      mainnetIndex++
    } else {
      const mainnetNext =
          (mainnetEvent[orderBy.type] < xdaiEvent[orderBy.type] && orderBy.order === OrderDirection.ascending.val) ||
          (mainnetEvent[orderBy.type] > xdaiEvent[orderBy.type] && orderBy.order === OrderDirection.descending.val)
      if ( mainnetNext ) {
        pushEvent(subgraphEvents, mainnetEvent, 'mainnet')
        mainnetIndex++
      } else {
        pushEvent(subgraphEvents, xdaiEvent, 'xdai')
        xdaiIndex++
      }
    }
  }
  return {
    subgraphEvents
  }
}

function aggregateEventsData(events, subgraphEvents) {
  subgraphEvents.forEach(sEvent => {
    const eventMatch = events.find(e => parseInt(sEvent.id) === e.id)
    if (eventMatch) {
      if (eventMatch.tokenCount && eventMatch.transferCount) {
        eventMatch.tokenCount += sEvent.tokenCount
        eventMatch.transferCount += sEvent.transferCount
      } else {
        eventMatch.tokenCount = sEvent.tokenCount
        eventMatch.transferCount = sEvent.transferCount
      }
    }
  })
}

function aggregateSubgraphEventsData(events, subgraphEvents) {
  events.forEach(event => {
    const sEventMatch = subgraphEvents.find(e => parseInt(event.id) === e.id)
    if (sEventMatch) {
      Object.assign(sEventMatch, event)
    }
  })
}

function limitApiEvents(events, limit) {
  if (!events || events.length === 0) {
    return {
      limitedEvents: [],
      _apiIndex: 0
    }
  }

  const limitedEvents = []
  let _apiIndex, _invalidEventsAmount = 0
  for (let i = 0; i < events.length; i++) {
    const e = events[i]
    if (e.tokenCount && e.transferCount) {
      if (limitedEvents.length < limit) {
        limitedEvents.push(e)
      } else if (limitedEvents.length === limit) {
        _apiIndex = i
        break
      }
    } else {
      _invalidEventsAmount++
    }
  }
  if (_apiIndex === undefined) {
    _apiIndex = events.length - 1
  }
  return {
    limitedEvents,
    _apiIndex,
    _invalidEventsAmount
  }
}

function limitSubgraphEvents(events, limit) {
  if (!events || events.length === 0) {
    return {
      limitedEvents: [],
      _mainnetIndex: 0,
      _xdaiIndex: 0
    }
  }

  const limitedEvents = []
  let _mainnetIndex, _xdaiIndex, lastUsedIdx
  for (let i = 0; i < events.length; i++) {
    const e = events[i]
    // Use start_date as a way to figure out if it was a valid event in the api fetch
    const isAValidApiEvent = e.start_date !== undefined
    if (isAValidApiEvent && isValidSubgraphEvent(e)) {
      if (limitedEvents.length < limit) {
        limitedEvents.push(e)
      } else if (limitedEvents.length === limit) {
        lastUsedIdx = i
        break
      }
    }
  }

  // Look for indexes
  for (let i = lastUsedIdx; i >= 0; i--) {
    const event = events[i]
    if (_mainnetIndex && _xdaiIndex) break
    if (_xdaiIndex === undefined && event.chainId.includes('xdai')) {
      _xdaiIndex = i
    }
    if (_mainnetIndex === undefined && event.chainId.includes('mainnet')) {
      _mainnetIndex = i
    }
  }

  return {
    limitedEvents,
    _mainnetIndex,
    _xdaiIndex
  }
}

async function getEventsBySubgraphFirst(mainnetSkip, xdaiSkip, orderBy, missingAmount) {
  let batchSize = PAGE_LIMIT*5
  let [mainnetEvents, xdaiEvents] = await Promise.all([getMainnetEvents(batchSize, mainnetSkip, orderBy), getxDaiEvents(batchSize, xdaiSkip, orderBy)])
  let {subgraphEvents} = reduceSubgraphEvents(mainnetEvents, xdaiEvents, orderBy)

  const eventIds = subgraphEvents.map(e => e.id)
  let events = []
  for (let i = 0; i < eventIds.length; i+=1000) {
    const eventIdsSlice = eventIds.slice(i, Math.min(i+1000, eventIds.length))
    const {items} = await getPaginatedEvents({event_ids: eventIdsSlice.join(','), limit: eventIdsSlice.length})
    events = events.concat(items)
  }
  aggregateSubgraphEventsData(events, subgraphEvents)
  let {limitedEvents, _mainnetIndex, _xdaiIndex} = limitSubgraphEvents(subgraphEvents, missingAmount)
  if (_mainnetIndex === undefined) {
    _mainnetIndex = batchSize
  }
  if (_xdaiIndex === undefined) {
    _xdaiIndex = batchSize
  }

  return {
    _events: limitedEvents,
    mainnetIndex: _mainnetIndex,
    xdaiIndex: _xdaiIndex
  }
}

async function getEventsByApiFirst(apiSkip, orderBy, privateEvents, nameFilter, missingAmount) {
  let batchSize = PAGE_LIMIT*5
  let paginatedResults = await getPaginatedEvents({
    name: nameFilter,
    offset: apiSkip,
    limit: batchSize,
    orderBy: orderBy,
    privateEvents: privateEvents
  })

  let apiEvents = paginatedResults.items
  if (!apiEvents || apiEvents.length === 0) {
    return {
      _events: [],
      apiIndex: batchSize,
      lessThanPageLimit: false
    }
  }

  const event_ids = apiEvents.map(e => e.id)
  let [mainnetEvents, xdaiEvents] = await Promise.all([getMainnetEventsByIds(event_ids), getxDaiEventsByIds(event_ids)])
  const subgraphEvents = _.concat(mainnetEvents.data.events, xdaiEvents.data.events)
  normalizeSubgraphEvents(subgraphEvents)
  aggregateEventsData(apiEvents, subgraphEvents)
  const {limitedEvents, _apiIndex, _invalidEventsAmount} = limitApiEvents(apiEvents, Math.min(missingAmount, paginatedResults.total))
  return {
    _events: limitedEvents,
    apiIndex: _apiIndex,
    lessThanPageLimit: paginatedResults.total < PAGE_LIMIT,
    _total: paginatedResults.total,
    _invalidEventsAmount: _invalidEventsAmount
  }
}

export async function getIndexPageData(orderBy, reset, nameFilter, privateEvents, state) {
  let apiSkip, mainnetSkip, xdaiSkip, page
  if (reset) {
    page = 0
    apiSkip = 0
    xdaiSkip = 0
    mainnetSkip = 0
  } else {
    page = state.events.page
    apiSkip = state.events.apiSkip
    xdaiSkip = state.events.xdaiSkip
    mainnetSkip = state.events.mainnetSkip
  }

  let events = [], loopLimit = 10, total = 0, invalidEventsAmount = 0
  while (events.length < PAGE_LIMIT && loopLimit > 0) {
    const missingAmount = PAGE_LIMIT - events.length
    if (orderBy.type === OrderType.id.val || orderBy.type === OrderType.date.val || orderBy.type === OrderType.city.val) {
      const {_events, apiIndex, lessThanPageLimit, _total, _invalidEventsAmount} = await getEventsByApiFirst(apiSkip, orderBy, privateEvents, nameFilter, missingAmount)
      apiSkip += apiIndex
      events = events.concat(_events)
      total = _total
      invalidEventsAmount = _invalidEventsAmount
      if (lessThanPageLimit) {
        loopLimit = 0 // break out
      }
    } else {
      let {_events, mainnetIndex, xdaiIndex} = await getEventsBySubgraphFirst(mainnetSkip, xdaiSkip, orderBy, missingAmount)
      mainnetSkip += mainnetIndex
      xdaiSkip += xdaiIndex
      events = events.concat(_events)
    }
    loopLimit--
  }

  return {
    poapEvents: events,
    apiSkip: apiSkip,
    mainnetSkip: mainnetSkip,
    xdaiSkip: xdaiSkip,
    total: total,
    invalid: invalidEventsAmount,
    page: page
  }
}

export async function getActivityPageData() {

  const {upcoming, mostRecent, mostClaimed} = await getTop3Events()

  if (mostRecent) mostRecent.heading = "Most Recent"
  if (upcoming) upcoming.heading = "Upcoming Event"
  if (mostClaimed) mostClaimed.heading = "Most Claimed Token"

  return {
    mostRecent: mostRecent,
    mostClaimed: mostClaimed,
    upcoming: upcoming,
  }
}


function processSubgraphEventData(subgraphEvent, apiEvent, owners, tokens) {
  if (subgraphEvent && subgraphEvent.data) {
    if(subgraphEvent.data.tokens && subgraphEvent.data.tokens.length)
      tokens = tokens.concat(subgraphEvent.data.tokens)

    if(subgraphEvent.data.event) {
      if (subgraphEvent.data.event.tokenCount)
        apiEvent.tokenCount += parseInt(subgraphEvent.data.event.tokenCount);
      if (subgraphEvent.data.event.transferCount)
        apiEvent.transferCount += parseInt(subgraphEvent.data.event.transferCount);
    }

    for (let i = 0; i < subgraphEvent.data.tokens.length; i++) {
      const owner = subgraphEvent.data.tokens[i].owner;
      owner.tokensOwned = parseInt(owner.tokensOwned)
      owners[owner.id] = owner;
    }
  }
  return tokens
}

function processCrossChainTokenOwned(chainOwner, crossChainOwner) {
  if (crossChainOwner && crossChainOwner.data && crossChainOwner.data.accounts) {
    for (let i = 0; i < crossChainOwner.data.accounts.length; i++) {
      const owner = crossChainOwner.data.accounts[i];
      chainOwner[owner.id].tokensOwned += parseInt(crossChainOwner.data.accounts.find(({id}) => id === owner.id).tokensOwned)
    }
  }
}


export async function getEventPageData(eventId, first, skip) {
  // Get the tokens info
  let [mainnet, xDai, event] = await Promise.all([getMainnetTokens(eventId, first, skip), getxDaiTokens(eventId, first, skip), getEvent(eventId)])
  let tokens = []
  const xDaiOwners = {};
  const mainnetOwners = {}
  event.tokenCount = 0;
  event.transferCount = 0;

  // Process the data tokens and the owners
  tokens = processSubgraphEventData(mainnet, event, mainnetOwners, tokens);
  tokens = processSubgraphEventData(xDai, event, xDaiOwners, tokens);

  // Get owner's data from the other chain (tokensOwned)
  let [mainnetCallOwners, xDaiCallOwners]  = await Promise.all([
    // Get mainnet data from the xdai owners
    getMainnetOwners(Object.keys(xDaiOwners)),
    // Get xDai data from the mainnet owners
    getXDaiOwners(Object.keys(mainnetOwners))
  ])

  //Sum the tokensOwned (power) for both chains from every owner
  processCrossChainTokenOwned(xDaiOwners, mainnetCallOwners);
  processCrossChainTokenOwned(mainnetOwners, xDaiCallOwners);

  // Add the power to the tokens
  for (let j = 0; j < tokens.length; j++) {
    if (mainnetOwners[tokens[j].owner.id] !== undefined) {
      tokens[j].owner.tokensOwned = mainnetOwners[tokens[j].owner.id].tokensOwned
    } else if (xDaiOwners[tokens[j].owner.id] !== undefined ) {
      tokens[j].owner.tokensOwned = xDaiOwners[tokens[j].owner.id].tokensOwned
    }
  }
  return { id: eventId, event, tokens: uniqBy(tokens, 'id').sort((a, b) => {
    return parseInt(a.id) - parseInt(b.id)
  }) }
}
