import { createSlice, combineReducers, configureStore, createAsyncThunk, current  } from '@reduxjs/toolkit';
import {getIndexPageData, getEventPageData, getActivityPageData} from './mutations';

export const FETCH_INFO_STATUS = {
  IDLE: 'IDLE',
  LOADING: 'LOADING',
  LOADING_MORE: 'LOADING_MORE',
  SUCCEEDED: 'SUCCEEDED',
  FAILED: 'FAILED'
}
export const FETCH_EVENT_PAGE_INFO_STATUS = {
  ...FETCH_INFO_STATUS
}
export const FETCH_INDEX_PAGE_INFO_STATUS = {
  ...FETCH_INFO_STATUS
}

const initialEventsState = {
  events: [],
  event: {},
  transfers: [],
  mostClaimed: undefined,
  upcoming: undefined,
  mostRecent: undefined,
  status: FETCH_INDEX_PAGE_INFO_STATUS.IDLE,
  eventStatus: FETCH_EVENT_PAGE_INFO_STATUS.IDLE,
  eventError: null,
  tokens: [],
  tokenId: null,
  apiSkip: 0,
  mainnetSkip: 0,
  xdaiSkip: 0,
  totalResults: 0,
  currentInvalidResults: 0,
  page: 0,
}

export const fetchIndexData = createAsyncThunk('events/fetchIndexEvents',
    async ({orderBy, reset, nameFilter, privateEvents = undefined}, thunkAPI) => getIndexPageData(orderBy, reset, nameFilter, privateEvents, thunkAPI.getState()))
export const fetchEventPageData = createAsyncThunk('events/fetchEventPageData', async ({eventId, first, skip}) => getEventPageData(eventId, first, skip))
export const fetchActivityPageData = createAsyncThunk('events/fetchActivityPageData', async () => getActivityPageData())


const eventsSlice = createSlice({
  name: 'events',
  initialState: initialEventsState,
  reducers: {},
  extraReducers: {
    [fetchIndexData.pending]: (state, action) => {
      const reset = action.meta.arg.reset
      if (reset) {
        state.status = FETCH_INDEX_PAGE_INFO_STATUS.LOADING
      } else {
        state.status = FETCH_INDEX_PAGE_INFO_STATUS.LOADING_MORE
      }
    },
    [fetchIndexData.fulfilled]: (state, action) => {
      const { poapEvents, apiSkip, mainnetSkip, xdaiSkip, page, total, invalid } = action.payload

      if (page === 0) {
        state.currentInvalidResults = invalid
        state.events = poapEvents
      } else {
        state.currentInvalidResults += invalid
        poapEvents.forEach(poapE => {
          const match = state.events.find(e => e.id === poapE.id)
          if (match) {
            match.tokenCount += poapE.tokenCount
            match.transferCount += poapE.transferCount
          } else {
            state.events.push(poapE)
          }
        })
      }
      state.page++

      state.apiSkip = apiSkip
      state.mainnetSkip = mainnetSkip
      state.xdaiSkip = xdaiSkip
      state.totalResults = total
      state.status = FETCH_INDEX_PAGE_INFO_STATUS.SUCCEEDED
    },
    [fetchIndexData.rejected]: (state, action) => {
      state.eventError = action.error.message
      state.status = FETCH_INDEX_PAGE_INFO_STATUS.FAILED
      console.warn(action.error)
    },
    [fetchEventPageData.pending]: (state, action) => {
      state.eventStatus = FETCH_EVENT_PAGE_INFO_STATUS.LOADING
    },
    [fetchEventPageData.fulfilled]: (state, action) => {
      if (state.tokenId === action.payload.id) {
        state.tokens = current(state.tokens).concat(action.payload.tokens)
      } else {
        state.tokens = action.payload.tokens
      }

      state.tokenId = action.payload.id
      state.event = action.payload.event
      state.eventStatus = FETCH_EVENT_PAGE_INFO_STATUS.SUCCEEDED
    },
    [fetchEventPageData.rejected]: (state, action) => {
      state.eventError = action.error.message
      state.eventStatus = FETCH_EVENT_PAGE_INFO_STATUS.FAILED
      console.warn(action.error)
    },
    [fetchActivityPageData.pending]: (state, action) => {
      // state.eventStatus = 'loading'
    },
    [fetchActivityPageData.fulfilled]: (state, action) => {
      const { mostRecent, mostClaimed, upcoming } = action.payload
      state.upcoming = upcoming
      state.mostRecent = mostRecent
      state.mostClaimed = mostClaimed
    },
    [fetchActivityPageData.rejected]: (state, action) => {
      // TODO: add activityStatus if necessary
      // state.eventError = action.error.message
      // state.eventStatus = 'failed'
      console.warn(action.error)
    }
  }
})

export const selectIndexFetchStatus = state => state.events.status

export const selectEvents = state => state.events.events
export const selectTotalResults = state => state.events.totalResults

export const selectMostRecent = state => state.events.mostRecent
export const selectMostClaimed = state => state.events.mostClaimed
export const selectUpcoming = state => state.events.upcoming

const rootReducer = combineReducers({
  events: eventsSlice.reducer,
})

const store = configureStore({
  reducer: rootReducer
})

if (process.env.NODE_ENV === 'development' && module.hot) {
  module.hot.accept(rootReducer, () => {
    const newRootReducer = rootReducer
    store.replaceReducer(newRootReducer)
  })
}

export default store
