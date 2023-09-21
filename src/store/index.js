import {
  createSlice,
  combineReducers,
  configureStore,
  createAsyncThunk,
} from '@reduxjs/toolkit';
import { getIndexPageData, getActivityPageData } from './mutations';

export const FETCH_INFO_STATUS = {
  IDLE: 'IDLE',
  LOADING: 'LOADING',
  LOADING_MORE: 'LOADING_MORE',
  SUCCEEDED: 'SUCCEEDED',
  FAILED: 'FAILED',
};
export const FETCH_EVENT_PAGE_INFO_STATUS = {
  ...FETCH_INFO_STATUS,
};
export const FETCH_INDEX_PAGE_INFO_STATUS = {
  ...FETCH_INFO_STATUS,
};

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
  eventId: null,
  apiSkip: 0,
  totalResults: 0,
  page: 0,
};

export const fetchIndexData = createAsyncThunk(
  'events/fetchIndexEvents',
  async ({ orderBy, reset, nameFilter }, thunkAPI) =>
    getIndexPageData(orderBy, reset, nameFilter, thunkAPI.getState())
);
export const fetchActivityPageData = createAsyncThunk(
  'events/fetchActivityPageData',
  async () => getActivityPageData()
);

const eventsSlice = createSlice({
  name: 'events',
  initialState: initialEventsState,
  reducers: {},
  extraReducers: {
    [fetchIndexData.pending]: (state, action) => {
      const reset = action.meta.arg.reset;
      if (reset) {
        state.status = FETCH_INDEX_PAGE_INFO_STATUS.LOADING;
      } else {
        state.status = FETCH_INDEX_PAGE_INFO_STATUS.LOADING_MORE;
      }
    },
    [fetchIndexData.fulfilled]: (state, action) => {
      const { poapEvents, apiSkip, page, total } = action.payload;

      if (page === 0) {
        state.events = poapEvents;
      } else {
        state.events = [...state.events, ...poapEvents];
      }
      state.page++;

      state.apiSkip = apiSkip;
      state.totalResults = total;
      state.status = FETCH_INDEX_PAGE_INFO_STATUS.SUCCEEDED;
    },
    [fetchIndexData.rejected]: (state, action) => {
      state.eventError = action.error.message;
      state.status = FETCH_INDEX_PAGE_INFO_STATUS.FAILED;
      console.warn(action.error);
    },
    [fetchActivityPageData.pending]: () => {
      // state.eventStatus = 'loading'
    },
    [fetchActivityPageData.fulfilled]: (state, action) => {
      const { mostRecent, mostClaimed, upcoming } = action.payload;
      state.upcoming = upcoming;
      state.mostRecent = mostRecent;
      state.mostClaimed = mostClaimed;
    },
    [fetchActivityPageData.rejected]: (state, action) => {
      // TODO: add activityStatus if necessary
      // state.eventError = action.error.message
      // state.eventStatus = 'failed'
      console.warn(action.error);
    },
  },
});

export const selectIndexFetchStatus = (state) => state.events.status;

export const selectEvents = (state) => state.events.events;
export const selectTotalResults = (state) => state.events.totalResults;

export const selectMostRecent = (state) => state.events.mostRecent;
export const selectMostClaimed = (state) => state.events.mostClaimed;
export const selectUpcoming = (state) => state.events.upcoming;

const rootReducer = combineReducers({
  events: eventsSlice.reducer,
});

const store = configureStore({
  reducer: rootReducer,
});

if (process.env.NODE_ENV === 'development' && module.hot) {
  module.hot.accept(rootReducer, () => {
    const newRootReducer = rootReducer;
    store.replaceReducer(newRootReducer);
  });
}

export default store;
