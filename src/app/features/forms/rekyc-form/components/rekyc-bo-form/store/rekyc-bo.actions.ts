import { createAction, props } from '@ngrx/store';
import { BODetails } from './rekyc-bo.state';

export const setBODetails = createAction(
  '[BO Details] Set BO Details',
  props<{ boDetails: BODetails[] }>(),
);
