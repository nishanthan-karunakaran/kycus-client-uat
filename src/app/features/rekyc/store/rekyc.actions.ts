import { createAction, props } from '@ngrx/store';
import { ReKycApplication } from 'src/app/features/rekyc/rekyc.model';
import { PaginationInfo } from './rekyc.state';

export const fetchReKycApplications = createAction(
  '[REKYC] Load Applications',
  props<{ applications?: ReKycApplication[]; error?: string }>(),
);

export const updateReKycApplications = createAction(
  '[REKYC] Update Applications',
  props<{ applications?: ReKycApplication[] }>(),
);

export const updateRekycPagination = createAction(
  '[REKYC] Update Pagination',
  props<Partial<PaginationInfo>>(),
);
