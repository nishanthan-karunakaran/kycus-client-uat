import { selectRekycFormState } from '@features/forms/rekyc-form/store/rekyc-form.selectors';
import { ReKYCFormState } from '@features/forms/rekyc-form/store/rekyc-form.state';
import { createSelector } from '@ngrx/store';

export const selectBODetails = createSelector(
  selectRekycFormState,
  (state: ReKYCFormState) => state.bo,
);
