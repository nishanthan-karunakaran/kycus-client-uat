import { ActionReducerMap, createReducer, on } from '@ngrx/store';
import { entityDetailsReducer } from '../components/entity-details-form/store/entity-details.reducers';
import { entityInfoReducer } from '../components/entity-filledby/store/entity-info.reducer';
import { boReducer } from '../components/rekyc-bo-form/store/rekyc-bo.reducer';
import {
  ausInfoReducer,
  personalDetailsReducer,
} from '../components/rekyc-personal-details/store/personal-details.reducer';
import {
  updateActiveRoute,
  updateCurrentEntityDetTab,
  updateRekycFormStatus,
  updateRekycStepStatus,
} from './rekyc-form.action';
import { EntityDetTab, ReKYCFormState } from './rekyc-form.state';
import { FormStep } from '../rekyc-form.model';
import { rekycDirectorReducer } from '../components/rekyc-directors-form/store/declaration-directors.reducers';

export interface FormStatus {
  steps: {
    entityDocs: boolean;
    directorDetails: boolean;
    boDetails: boolean;
  };
  forms: {
    entityDetails: boolean;
    ausDetails: boolean;
    rekycForm: boolean;
    eSign: boolean;
  };
}

export const initialFormStatus: FormStatus = (() => {
  const steps = {
    entityDocs: false,
    directorDetails: false,
    boDetails: false,
  };

  const forms = {
    entityDetails: steps.entityDocs && steps.directorDetails && steps.boDetails,
    ausDetails: false,
    rekycForm: false,
    eSign: false,
  };

  return { steps, forms };
})();

const getInitialTab = (): EntityDetTab => {
  try {
    const tab = 'entity-details' as EntityDetTab;
    const obj = localStorage.getItem('rekyc');
    const currentRekyc: Record<string, string> = obj ? JSON.parse(obj) : {};
    return (currentRekyc['currentEntityDetTab'] as EntityDetTab) || tab;
  } catch {
    return 'entity-details';
  }
};

const getIntialActiveRoute = () => {
  const route = 'entity-details' as FormStep;
  try {
    const obj = localStorage.getItem('rekyc');
    const currentRekyc: Record<string, string> = obj ? JSON.parse(obj) : {};
    return (currentRekyc['activeRoute'] as FormStep) || route;
  } catch {
    return route;
  }
};

export const formStatusReducer = createReducer(
  initialFormStatus,
  on(updateRekycStepStatus, (state, payload) => {
    return {
      ...state,
      steps: {
        ...state.steps,
        ...payload,
      },
    };
  }),
  on(updateRekycFormStatus, (state, payload) => {
    return {
      ...state,
      forms: {
        ...state.forms,
        ...payload,
      },
    };
  }),
);

export const currentEntityDetTabReducer = createReducer(
  getInitialTab(),
  on(updateCurrentEntityDetTab, (_state, { tab }) => tab),
);

export const activeRouteReducer = createReducer(
  getIntialActiveRoute(),
  on(updateActiveRoute, (_state, { activeRoute }) => activeRoute),
);

export const rekycFormReducers: ActionReducerMap<ReKYCFormState> = {
  entityInfo: entityInfoReducer,
  ausInfo: ausInfoReducer,
  entityDetails: entityDetailsReducer,
  director: rekycDirectorReducer,
  bo: boReducer,
  personalDetails: personalDetailsReducer,
  formStatus: formStatusReducer,
  currentEntityDetTab: currentEntityDetTabReducer,
  activeRoute: activeRouteReducer,
};
