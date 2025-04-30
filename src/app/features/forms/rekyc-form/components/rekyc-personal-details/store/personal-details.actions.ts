import { createAction, props } from '@ngrx/store';
import { AusInfoState } from './personal-details.reducer';
import { PersonalDetails, PersonalDetailsFileType } from './personal-details.state';

export const setAusInfo = createAction('[Aus Info] Set Aus Info', props<AusInfoState>());

export const updateAusInfo = createAction(
  '[Aus Info] Set Aus Info',
  props<Partial<AusInfoState>>(),
);

export const updateAccessibleSteps = createAction(
  '[Accessible Steps] Update Accessible Steps',
  props<{ accessibleSteps: AusInfoState['accessibleSteps'] }>(),
);

export const setPersonalDetails = createAction(
  '[Rekyc] Set Personal Details',
  props<PersonalDetails>(),
);

export const updatePersonalDetails = createAction(
  '[PersonalDetails] Update Personal Details',
  props<{ key: PersonalDetailsFileType; data: PersonalDetails[PersonalDetailsFileType] }>(),
);

export const updatePartialPersonalDetails = createAction(
  '[PersonalDetails] Update Partial Personal Details',
  props<{ partialData: Partial<PersonalDetails> }>(),
);
