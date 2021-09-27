import {
  getEvent,
  getEvents,
  getMainnetEvents,
  getMainnetOwners,
  getMainnetTokens,
  getxDaiEvents,
  getXDaiOwners,
  getxDaiTokens
} from './api'
import {ensABI} from './abis';
import _, {uniqBy} from 'lodash'
import {ethers} from 'ethers';
import namehash from 'eth-ens-namehash';

const {REACT_APP_RPC_PROVIDER_URL, REACT_APP_ENS_CONTRACT} = process.env;
const provider = new ethers.providers.StaticJsonRpcProvider(REACT_APP_RPC_PROVIDER_URL);
const ReverseRecords = new ethers.Contract(REACT_APP_ENS_CONTRACT, ensABI, provider)

// TODO: Refactor to render as it returns data rather than waiting all in batch
export async function getEnsData(ownerIds){
  const chunked = _.chunk(ownerIds, 50)
  let allnames = []
  for (let i = 0; i < chunked.length; i++) {
    const chunk = chunked[i];
    let names
    try{
      // TODO: Figure out why some call throws error
      names = await ReverseRecords.getNames(chunk)
    }catch(e){
      // Fallback to null if problem fetching Reverse record
      console.log(e)
      names = chunk.map(a => null)
    }
    const validNames = names.map(name => (namehash.normalize(name) === name && name !== '') && name )
    allnames = _.concat(allnames, validNames);
  }
  return allnames
}

export async function getIndexPageData() {
  let [poapEvents, graphEvents, xdaiEvents] = await Promise.all([getEvents(), getMainnetEvents(), getxDaiEvents()])

  if (graphEvents && graphEvents.data && graphEvents.data.events) {
    graphEvents = graphEvents.data.events
  } else {
    graphEvents = []
  }

  if (xdaiEvents && xdaiEvents.data && xdaiEvents.data.events) {
    xdaiEvents = xdaiEvents.data.events
    graphEvents = graphEvents.concat(xdaiEvents)
  }

    let mr = {}
    let up = {}
    let mC = {}
    let hPP = {}

    if(poapEvents && poapEvents.length) {
      mr = poapEvents[0]
      up = poapEvents[0]
      mC = poapEvents[0]
      hPP = poapEvents[0]
    }
    let isMostRecent = false

    for (let i = 0; i < poapEvents.length; i++) {
      const ev = poapEvents[i];
      ev.tokenCount = 0
      ev.transferCount = 0
      for (let j = 0; j < graphEvents.length; j++) {
        const gev = graphEvents[j];
        if(ev.id === parseInt(gev.id)) {
          ev.tokenCount += parseInt(gev.tokenCount)
          ev.transferCount += parseInt(gev.transferCount)
        }
      }
      let now = new Date().getTime()
      let evDate = new Date(ev.start_date.replace(/-/g, ' ')).getTime()

      if(evDate > now) {
        up = ev
      }

      if(evDate < now && isMostRecent === false) {
        isMostRecent = true
        mr = ev
      }

      if(ev.tokenCount > mC.tokenCount) {
        mC = ev
      }
    }

    mr.heading = "Most Recent"
    up.heading = "Upcoming Event"
    mC.heading = "Most Claimed Token"

    return {
      poapEvents: poapEvents,
      mostRecent: mr,
      mostClaimed: mC,
      upcoming: up,
      highestPoapPower: hPP,
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
    } else {
      console.log("NOT FOUND", tokens[j].owner.id, tokens[j].owner.tokensOwned)
    }
  }
  return { id: eventId, event, tokens: uniqBy(tokens, 'id').sort((a, b) => {
    return parseInt(a.id) - parseInt(b.id)
  }) }
}
