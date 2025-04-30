import { createReducer, on } from '@ngrx/store';
import { setBODetails } from './rekyc-bo.actions';
import { initialBODetails } from './rekyc-bo.state';

export const boReducer = createReducer(
  initialBODetails,
  on(setBODetails, (state, payload) => {
    return { ...state, ...payload };
  }),
);
