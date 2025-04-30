import { createReducer, on } from '@ngrx/store';
import { setEntityInfo, updateEntityFilledBy } from './entity-info.actions';

export interface EntityInfoState {
  entityId: string;
  entityName: string;
  entityFilledBy: null | string;
}

const getInitialEntityInfo = () => {
  const obj = localStorage.getItem('rekyc');
  const currentRekyc: Record<string, EntityInfoState> = obj ? JSON.parse(obj) : {};
  return currentRekyc['entityInfo'] || initialEntityInfoState;
};

export const initialEntityInfoState: EntityInfoState = {
  entityId: '',
  entityName: '',
  entityFilledBy: null,
};

export const entityInfoReducer = createReducer(
  getInitialEntityInfo(),
  on(setEntityInfo, (state, payload) => ({
    ...state,
    ...payload,
  })),
  on(updateEntityFilledBy, (state, payload) => ({
    ...state,
    ...payload,
  })),
);
