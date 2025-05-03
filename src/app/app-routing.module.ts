import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '@core/guards/auth.guard';

const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.module').then((m) => m.AuthModule),
  },
  {
    path: 'v2/auth',
    loadChildren: () =>
      import('./layouts/auth-layout/auth-layout.module').then((m) => m.AuthLayoutModule),
  },
  {
    path: 'bankers',
    loadChildren: () => import('./features/bankers/bankers.module').then((m) => m.BankersModule),
  },
  {
    path: 'application',
    loadChildren: () =>
      import('./features/application/application.module').then((m) => m.ApplicationModule),
  },
  {
    path: '',
    loadChildren: () =>
      import('./layouts/dashboard-layout/dashboard-layout.module').then(
        (m) => m.DashboardLayoutModule,
      ),
    canActivate: [AuthGuard],
  },
  {
    path: '**',
    redirectTo: 'auth',
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
