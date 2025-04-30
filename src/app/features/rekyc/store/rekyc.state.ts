import { EntityState } from '@ngrx/entity';
import { createMongoEntityAdapter } from 'src/app/core/utils/ngrx.utils';
import { ReKycApplication } from 'src/app/features/rekyc/rekyc.model';

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  total: number;
}

export interface ReKycState extends EntityState<ReKycApplication> {
  reKycApplications: ReKycApplication[];
  paginationInfo: PaginationInfo;
}

export const rekycAdapter = createMongoEntityAdapter<ReKycApplication>();

export const initialReKycState: ReKycState = rekycAdapter.getInitialState({
  reKycApplications: [],
  paginationInfo: {
    currentPage: 1,
    totalPages: 1,
    total: 0,
  },
});
