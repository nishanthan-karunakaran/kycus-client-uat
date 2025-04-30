import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class RekycGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const accessToken = localStorage.getItem('access_token');

    if (accessToken) {
      return true;
    } else {
      const currentParams = route.queryParams;
      const fullPath = '/application/rekyc/login';

      this.router.navigate([fullPath], {
        queryParams: currentParams, // carry forward ?token=...
      });

      return false;
    }
  }
}
