export interface Aus {
  name: string;
  email: string;
}

export interface RekycData {
  id: number;
  companyName: string;
  companyType: string;
  custId: string;
  cinNumber: string;
  panNumber: string;
  ausDetails: Aus[];
  isDuplicate: boolean; // for ui only
}

export enum ReKycStatus {
  IN_PROGRESS = 'in-progress',
  SUBMITTED = 'submitted',
  PENDING = 'pending',
  EXPIRED = 'expired',
  COMPLETED = 'completed',
}

export interface ReKycApplication {
  _id: string;
  id: string;
  bankName: string;
  entityId: string;
  entityName: string;
  cin: string;
  reason: string;
  entityType: string;
  entityUrlToken: string;
  entityUrl: string;
  authorizedSignatoriesDetails: Aus[];
  status: ReKycStatus;
  requestedOn: string;
  uploadedBy: string;
}

export interface UploadReKycExcel {
  file: Blob;
  mode: 'preview';
}

export interface SubmitReKycExcel {
  mode: 'submit';
  uploadedBy: string;
  bankName: string;
  data: RekycData[];
}

export interface GetReKycApplicationsParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}

export interface GetReKycApplicationsResponse {
  results: ReKycApplication[];
  total: number;
  currentPage: number;
  totalPages: number;
}

export interface SubmitReKycApplicationResponse {
  count: number;
  data: ReKycApplication[];
}
