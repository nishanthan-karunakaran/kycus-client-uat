import { EntityInfoState } from './entity-info.reducer';
import { createAction, props } from '@ngrx/store';

export const setEntityInfo = createAction(
  '[Entity Info] Set Entity Info',
  props<EntityInfoState>(),
);

export const updateEntityFilledBy = createAction(
  '[Entity Info] Update Entity Filled By',
  props<{ entityFilledBy: EntityInfoState['entityFilledBy'] }>(),
);
