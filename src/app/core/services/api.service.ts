import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { DestroyRef, inject, Injectable } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { updateAusInfo } from '@features/forms/rekyc-form/components/rekyc-personal-details/store/personal-details.actions';
import { Store } from '@ngrx/store';
import { BehaviorSubject, defer, of } from 'rxjs';
import { catchError, finalize, map, startWith } from 'rxjs/operators';
import { ApiResponse, ApiResult } from 'src/app/core/constants/api.response';

type BodyType = object | FormData;

@Injectable({ providedIn: 'root' })
export class ApiService {
  private globalLoadingSubject = new BehaviorSubject<boolean>(false);
  globalLoading$ = this.globalLoadingSubject.asObservable();

  private readonly destroyRef = inject(DestroyRef); // abortController

  constructor(
    private http: HttpClient,
    private store: Store,
  ) {}

  request<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    url: string,
    body?: BodyType,
    params?: HttpParams,
    headers?: HttpHeaders,
  ): ApiResult<T> {
    return defer(() =>
      this.http
        .request<ApiResponse<T>>(method, url, {
          body,
          params,
          headers,
        })
        .pipe(
          takeUntilDestroyed(this.destroyRef),
          map((response: ApiResponse<T>) => ({
            loading: false,
            response,
          })),
          startWith({ loading: true, response: null }),
          catchError((error) => {
            const errMsg = error?.error?.message || error.message;

            const rekycTokenError = errMsg.toLowerCase().includes('token');
            const rekycApplicationError = errMsg.toLowerCase().includes('rekyc record not found');
            errMsg.toLowerCase().includes('no rekyc');

            if (rekycTokenError || rekycApplicationError) {
              this.store.dispatch(updateAusInfo({ isAuthenticated: false }));
              localStorage.removeItem('access_token');
              localStorage.removeItem('rekyc');
            }

            return of({
              loading: false,
              response: error?.error ?? {
                status: 'error',
                message: errMsg || 'An unexpected error occurred',
                data: null,
                error: null,
              },
            });
          }),

          finalize(() => this.globalLoadingSubject.next(false)),
        ),
    );
  }

  get<T>(url: string, params?: HttpParams, headers?: HttpHeaders) {
    return this.request<T>('GET', url, undefined, params, headers);
  }

  post<T>(url: string, body?: BodyType, headers?: HttpHeaders) {
    return this.request<T>('POST', url, body, undefined, headers);
  }

  put<T>(url: string, body: BodyType, headers?: HttpHeaders) {
    return this.request<T>('PUT', url, body, undefined, headers);
  }

  delete<T>(url: string, headers?: HttpHeaders) {
    return this.request<T>('DELETE', url, undefined, undefined, headers);
  }
}
