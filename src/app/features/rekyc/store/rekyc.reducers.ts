import { createReducer, on } from '@ngrx/store';
import * as ReKycActions from './rekyc.actions';
import { initialReKycState } from './rekyc.state';
import { deduplicateBy } from '@core/utils/helpers';

export const rekycReducer = createReducer(
  initialReKycState,

  on(ReKycActions.fetchReKycApplications, (state, { applications }) => ({
    ...state,
    reKycApplications: applications ?? [],
  })),

  on(ReKycActions.updateReKycApplications, (state, { applications }) => {
    const merged = [...(applications ?? []), ...state.reKycApplications];

    return {
      ...state,
      reKycApplications: deduplicateBy(merged),
    };
  }),

  on(ReKycActions.updateRekycPagination, (state, paginationData) => {
    return {
      ...state,
      paginationInfo: {
        ...state.paginationInfo,
        ...paginationData,
      },
    };
  }),
);
