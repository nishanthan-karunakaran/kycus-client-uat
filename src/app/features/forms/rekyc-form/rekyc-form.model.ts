import { EntityInfoState } from './components/entity-filledby/store/entity-info.reducer';
import { Director } from './components/rekyc-directors-form/store/declaration-directors.state';
import { AusInfoState } from './components/rekyc-personal-details/store/personal-details.reducer';

// export enum FormStep {
//   ENTITY_DETAILS,
//   DECLARATION,
//   PERSONAL_DETAILS,
//   KYC_FORM,
//   E_SIGN,
// }

export enum FormStep {
  ENTITY_DETAILS = 'entity-details',
  PERSONAL_DETAILS = 'personal-details',
  KYC_FORM = 'rekyc-form',
  E_SIGN = 'eSign',
}

export interface VerifyOtpResponse {
  entityInfo: EntityInfoState;
  ausInfo: AusInfoState;
  access_token: string;
}

export interface FormPage {
  label: string;
  step: FormStep;
  isCompleted: boolean;
  canShow: boolean;
}

export interface UploadFileProof {
  file: Blob;
  docType: string;
  entityId?: string;
  ausId?: string;
}

export interface UploadFileProofResponse {
  docName?: string;
  storedPath?: string;
}

export interface UploadFileProofErrorResponse {
  reason?: string;
}

export interface DeleteDocument {
  entityId?: string;
  ausId?: string;
  docType: string;
}

export type EntityDetailsFileType = 'pan' | 'gstin' | 'addressProof' | 'coi' | 'moa' | 'aoa';

export interface SaveDirectorsDraft {
  form32: File;
  data: {
    ausId: string;
    directorsList: Director[];
  };
}

export interface BoDetail {
  name: string;
  addressLine: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
}

export interface SaveBODetails {
  ausId: string;
  boList: BoDetail[];
}
