import { Observable } from 'rxjs';

export enum ApiStatus {
  SUCCESS = 'success',
  FAIL = 'fail',
  ERROR = 'error',
}

export interface FieldError {
  field: string;
  message: string;
}

export interface ApiResponse<T = unknown> {
  status: ApiStatus;
  message?: string;
  data?: T | T[] | Record<string, T>;
  errors?: T | T[] | Record<string, T>;
}

export type ApiResult<T = unknown> = Observable<{
  loading: boolean;
  response: ApiResponse<T> | null;
}>;
