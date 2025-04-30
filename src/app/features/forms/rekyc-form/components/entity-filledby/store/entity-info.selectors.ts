import { createSelector } from '@ngrx/store';
import { selectRekycFormState } from '@features/forms/rekyc-form/store/rekyc-form.selectors';
import { ReKYCFormState } from '@features/forms/rekyc-form/store/rekyc-form.state';

export const selectEntityInfo = createSelector(
  selectRekycFormState,
  (state: ReKYCFormState) => state.entityInfo,
);
