import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AuthService } from 'src/app/features/auth/auth.service';
import { environment } from 'src/environments/environment';

@Injectable()
export class ApiInterceptor implements HttpInterceptor {
  private cancelRequests$ = new Subject<string>(); // Subject to cancel specific requests

  constructor(private authService: AuthService) {}

  intercept<T>(req: HttpRequest<T>, next: HttpHandler): Observable<HttpEvent<T>> {
    // const token = this.authService.getAuthToken();
    const access_token = localStorage.getItem('access_token');
    const apiBaseUrl = environment.apiBaseUrl;
    const fullUrl = apiBaseUrl + req.url;

    // Cancel previous requests with the same URL
    this.cancelRequests$.next(fullUrl);

    // Clone the request and attach headers
    const clonedRequest = req.clone({
      url: fullUrl,
      setHeaders: {
        // Authorization: token ? `Bearer ${token}` : '',
        Authorization: access_token ? `Bearer ${access_token}` : '',
      },
    });

    return next.handle(clonedRequest).pipe(
      takeUntil(this.cancelRequests$.asObservable()), // Cancel on duplicate requests
    );
  }
}
