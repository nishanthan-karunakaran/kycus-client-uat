import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ReKycState } from './rekyc.state';

const reKycState = createFeatureSelector<ReKycState>('rekyc');

const selectReKycApplications = createSelector(reKycState, (state) => state.reKycApplications);

const selectReKycPaginationInfo = createSelector(reKycState, (state) => state.paginationInfo);

export const rekycSelectors = {
  selectReKycApplications,
  selectReKycPaginationInfo,
};
