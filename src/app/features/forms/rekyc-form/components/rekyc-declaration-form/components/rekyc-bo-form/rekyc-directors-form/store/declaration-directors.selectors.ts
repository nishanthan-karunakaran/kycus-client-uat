import { selectRekycFormState } from '@features/forms/rekyc-form/store/rekyc-form.selectors';
import { ReKYCFormState } from '@features/forms/rekyc-form/store/rekyc-form.state';
import { createSelector } from '@ngrx/store';

export const selectDeclaration = createSelector(
  selectRekycFormState,
  (state: ReKYCFormState) => state.director,
);

export const selectDeclarationDirectors = createSelector(
  selectRekycFormState,
  (state: ReKYCFormState) => state.director.directorList,
);

export const selectReKycDirectors = createSelector(
  selectRekycFormState,
  (state: ReKYCFormState) => state.director.directorList,
);

export const selectDeclarationIsDirectorsModified = createSelector(
  selectRekycFormState,
  (state: ReKYCFormState) => state.director.isDirectorModified,
);
