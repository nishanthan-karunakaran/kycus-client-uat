import { EntityDetails } from './store/entity-details.state';

export interface DocResponse {
  type: string;
  fileName: string;
  fileType: string;
  url: string;
  selectedType: string;
  timestamp: string;
  verifiedSource: string;
  isVerified: boolean;
}

export type EntityDocsListResponse = Record<keyof EntityDetails, DocResponse>;

export interface GetEntityResponse {
  status: string;
  data: {
    documents: EntityDocsListResponse;
  };
}
