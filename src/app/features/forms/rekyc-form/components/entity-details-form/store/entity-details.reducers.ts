import { createReducer, on } from '@ngrx/store';
import { initialEntityDetails } from './entity-details.state';
import {
  setEntityDetails,
  updateEntityDetails,
  updatePartialEntityDetails,
} from './entity-details.actions';

export const entityDetailsReducer = createReducer(
  initialEntityDetails,
  on(setEntityDetails, (state, payload) => {
    return { ...state, ...payload };
  }),
  on(updateEntityDetails, (state, { key, data }) => {
    return {
      ...state,
      [key]: {
        ...state[key],
        ...data,
      },
    };
  }),
  on(updatePartialEntityDetails, (state, { partialData }) => ({
    ...state,
    ...partialData, // Merge the partial data into the current state
  })),
);
