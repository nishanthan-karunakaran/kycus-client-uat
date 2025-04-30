import { createAction, props } from '@ngrx/store';
import { FormStatus } from './rekyc-form.reducer';
import { EntityDetTab } from './rekyc-form.state';
import { FormStep } from '../rekyc-form.model';

export const updateRekycStepStatus = createAction(
  '[FormStatus] Update FormStatus',
  props<Partial<FormStatus['steps']>>(),
);

export const updateRekycFormStatus = createAction(
  '[FormStatus] Update FormStatus',
  props<Partial<FormStatus['forms']>>(),
);

export const updateCurrentEntityDetTab = createAction(
  '[Current Entity Tab] updateCurrentEntityDetTab',
  props<{ tab: EntityDetTab }>(),
);

export const updateActiveRoute = createAction(
  '[Active Route] Update',
  props<{ activeRoute: FormStep }>(),
);
