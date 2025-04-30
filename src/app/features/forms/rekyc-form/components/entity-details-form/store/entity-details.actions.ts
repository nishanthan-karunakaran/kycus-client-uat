import { createAction, props } from '@ngrx/store';
import { EntityDetails } from './entity-details.state';
import { EntityDetailsFileType } from '@features/forms/rekyc-form/rekyc-form.model';

export const setEntityDetails = createAction('[Rekyc] Set Entity Details', props<EntityDetails>());

export const updateEntityDetails = createAction(
  '[EntityDetails] Update Entity Details',
  props<{ key: EntityDetailsFileType; data: EntityDetails[EntityDetailsFileType] }>(),
);

export const updatePartialEntityDetails = createAction(
  '[EntityDetails] Update Partial Entity Details',
  props<{ partialData: Partial<EntityDetails> }>(),
);
