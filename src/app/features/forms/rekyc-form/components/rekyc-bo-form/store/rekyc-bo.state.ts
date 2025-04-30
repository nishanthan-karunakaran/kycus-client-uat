import {
  BasicDoc,
  createInitialDoc,
  createInitialProofDoc,
  ProofDoc,
} from '@features/forms/rekyc-form/components/entity-details-form/store/entity-details.state';

export type BODetailsFileType = 'identityProof' | 'addressProof' | 'photograph' | 'signature';

export interface BODetails {
  identityProof: ProofDoc;
  addressProof: ProofDoc;
  photograph: BasicDoc;
  signature: BasicDoc;
}

export const initialBODetails: BODetails = {
  identityProof: createInitialProofDoc(
    'Select Proof of Identity',
    'identityProof',
    'driving_license',
    true,
  ),
  addressProof: createInitialProofDoc(
    'Select Proof of Address',
    'addressProof',
    'driving_license',
    true,
  ),
  photograph: createInitialDoc('Upload Photograph', 'photograph', true),
  signature: createInitialDoc('Upload Signature', 'signature', true),
};

export interface BOState {
  boProofs: BODetails[];
}
