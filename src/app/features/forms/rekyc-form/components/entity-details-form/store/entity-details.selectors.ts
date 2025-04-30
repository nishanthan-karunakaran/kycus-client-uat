import { selectRekycFormState } from '@features/forms/rekyc-form/store/rekyc-form.selectors';
import { ReKYCFormState } from '@features/forms/rekyc-form/store/rekyc-form.state';
import { createSelector } from '@ngrx/store';

export const selectEntityDetails = createSelector(
  selectRekycFormState,
  (state: ReKYCFormState) => state.entityDetails,
);
