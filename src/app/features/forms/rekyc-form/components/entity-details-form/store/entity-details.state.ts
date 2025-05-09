// this function is also used at personal details
export interface Doc {
  name: string;
  link: string;
  selectedType?: string;
}

// this function is also used at personal details
export interface ProofDoc {
  label: string;
  type: string;
  docType: string;
  file: Doc;
  isRequired: boolean;
}

// this function is also used at personal details
export interface BasicDoc {
  label: string;
  type: string;
  file: Doc;
  isRequired: boolean;
}

export interface EntityDetails {
  pan: BasicDoc;
  gstin: BasicDoc;
  addressProof: ProofDoc;
  coi: BasicDoc;
  moa: BasicDoc;
  aoa: BasicDoc;
}

// this function is also used at personal details
export const createInitialDoc = (label = '', type = '', isRequired = true): BasicDoc => ({
  label,
  type,
  file: {
    name: '',
    link: '',
  },
  isRequired,
});

// this function is also used at personal details
export const createInitialProofDoc = (
  label = '',
  type = '',
  selectedType = '',
  isRequired = true,
): ProofDoc => ({
  label,
  type,
  docType: '',
  file: {
    name: '',
    link: '',
    selectedType,
  },
  isRequired,
});

export const initialEntityDetails: EntityDetails = {
  pan: createInitialDoc("Company's PAN", 'pan', true),
  gstin: createInitialDoc("Company's GSTIN", 'gstin', false),
  addressProof: createInitialProofDoc(
    'Select Proof of Address',
    'addressProof',
    'electricityBill',
    true,
  ),
  coi: createInitialDoc('COI (Certificate of Incoporation) ', 'coi', true),
  moa: createInitialDoc('MOA (Memorandum of Association) ', 'moa', false),
  aoa: createInitialDoc('AOA (Articles of Association) ', 'aoa', false),
};
