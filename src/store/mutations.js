import { getPaginatedEvents, getTop3Events, PAGE_LIMIT } from './api';

export async function getIndexPageData(orderBy, reset, nameFilter, state) {
  let page, apiSkip;
  if (reset) {
    page = 0;
    apiSkip = 0;
  } else {
    page = state.events.page;
    apiSkip = state.events.apiSkip;
  }

  let events = [],
    loopLimit = 10,
    total = 0;
  while (events.length < PAGE_LIMIT && loopLimit > 0) {
    const batchSize =
      events.length > 0 ? PAGE_LIMIT - events.length : PAGE_LIMIT;

    const paginatedResults = await getPaginatedEvents({
      name: nameFilter,
      offset: apiSkip,
      limit: batchSize,
      orderBy,
    });
    if (paginatedResults) {
      if (paginatedResults.items && paginatedResults.items.length > 0) {
        events = events.concat(paginatedResults.items);
      } else {
        break;
      }
      if (paginatedResults.total > 0) {
        total = paginatedResults.total;
      } else {
        break;
      }
    }
    apiSkip += batchSize;
    loopLimit--;
  }

  return {
    poapEvents: events,
    apiSkip: apiSkip,
    total: total,
    page: page,
  };
}

export async function getActivityPageData() {
  const { upcoming, mostRecent, mostClaimed } = await getTop3Events();

  if (mostRecent) mostRecent.heading = 'Most Recent';
  if (upcoming) upcoming.heading = 'Upcoming Event';
  if (mostClaimed) mostClaimed.heading = 'Most Minted Token';

  return {
    mostRecent: mostRecent,
    mostClaimed: mostClaimed,
    upcoming: upcoming,
  };
}
