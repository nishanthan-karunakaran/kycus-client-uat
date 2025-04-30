import { createReducer, on } from '@ngrx/store';
import {
  setAusInfo,
  setPersonalDetails,
  updateAccessibleSteps,
  updateAusInfo,
  updatePartialPersonalDetails,
  updatePersonalDetails,
} from './personal-details.actions';
import { initialPersonalDetails } from './personal-details.state';

export interface AccessibleSteps {
  entityDetails: boolean;
  ausDetails: boolean;
  rekycForm: boolean;
  eSign: boolean;
}

export interface AusInfoState {
  ausId: null | string;
  ausName: null | string;
  ausEmail: null | string;
  ausType: null | string;
  isAuthenticated: boolean;
  accessibleSteps: AccessibleSteps;
}

const getInitialAccessibleSteps = () => {
  const obj = localStorage.getItem('rekyc');
  const currentRekyc: Record<string, AccessibleSteps> = obj ? JSON.parse(obj) : {};
  return (
    currentRekyc['accessibleSteps'] || {
      entityDetails: false,
      ausDetails: true,
      rekycForm: false,
      eSign: true,
    }
  );
};

const getInitialAusInfo = (): AusInfoState => {
  const obj = localStorage.getItem('rekyc');
  const parsed = obj ? JSON.parse(obj) : {};

  const ausInfoPartial = (parsed.ausInfo as Partial<AusInfoState>) || {};
  const accessibleSteps =
    (parsed.accessibleSteps as AccessibleSteps) || getInitialAccessibleSteps();

  const isAuthenticated = localStorage.getItem('access_token') !== null;

  return {
    ...initialAusInfoState,
    ...ausInfoPartial,
    isAuthenticated,
    accessibleSteps,
  };
};

export const initialAusInfoState: AusInfoState = {
  ausId: '',
  ausName: '',
  ausEmail: '',
  ausType: 'aus',
  isAuthenticated: true,
  // isAuthenticated: localStorage.getItem('access_token') !== null,
  accessibleSteps: getInitialAccessibleSteps(),
};

export const ausInfoReducer = createReducer(
  getInitialAusInfo(),
  on(setAusInfo, (state, payload) => ({
    ...state,
    ...payload,
  })),
  on(updateAusInfo, (state, payload) => ({
    ...state,
    ...payload,
  })),
  on(updateAccessibleSteps, (state, { accessibleSteps }) => ({
    ...state,
    accessibleSteps,
  })),
);

export const personalDetailsReducer = createReducer(
  initialPersonalDetails,
  on(setPersonalDetails, (state, payload) => {
    return { ...state, ...payload };
  }),
  on(updatePersonalDetails, (state, { key, data }) => {
    return {
      ...state,
      [key]: {
        ...state[key],
        ...data,
      },
    };
  }),
  on(updatePartialPersonalDetails, (state, { partialData }) => ({
    ...state,
    ...partialData,
  })),
);
