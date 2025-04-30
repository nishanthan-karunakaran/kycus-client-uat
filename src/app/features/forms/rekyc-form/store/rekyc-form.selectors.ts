import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ReKYCFormState } from './rekyc-form.state';

export const selectRekycFormState = createFeatureSelector<ReKYCFormState>('rekycForm');

export const selectRekycStatus = createSelector(
  selectRekycFormState,
  (state: ReKYCFormState) => state.formStatus,
);

export const selectRekycStepStatus = createSelector(
  selectRekycFormState,
  (state: ReKYCFormState) => state.formStatus.steps,
);

export const selectRekycFormStatus = createSelector(
  selectRekycFormState,
  (state: ReKYCFormState) => state.formStatus.forms,
);

export const selectRekycCurrentEntityDetTab = createSelector(
  selectRekycFormState,
  (state: ReKYCFormState) => state.currentEntityDetTab,
);

export const selectRekycActiveRoute = createSelector(
  selectRekycFormState,
  (state: ReKYCFormState) => state.activeRoute,
);
