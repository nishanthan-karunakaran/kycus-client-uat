import {
  BasicDoc,
  createInitialDoc,
  createInitialProofDoc,
  ProofDoc,
} from '@features/forms/rekyc-form/components/entity-details-form/store/entity-details.state';

export type PersonalDetailsFileType = 'identityProof' | 'addressProof' | 'photograph' | 'signature';

export interface PersonalDetails {
  identityProof: ProofDoc;
  addressProof: ProofDoc;
  photograph: BasicDoc;
  signature: BasicDoc;
}

export const initialPersonalDetails: PersonalDetails = {
  identityProof: createInitialProofDoc('Select Proof of Identity', 'identityProof', 'pan', true),
  addressProof: createInitialProofDoc('Select Proof of Address', 'addressProof', 'aadhaar', true),
  photograph: createInitialDoc('Upload Photograph', 'photograph', true),
  signature: createInitialDoc('Upload Signature', 'signature', true),
};
