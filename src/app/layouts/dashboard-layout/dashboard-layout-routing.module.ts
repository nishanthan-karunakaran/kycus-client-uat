import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardLayoutComponent } from './dashboard-layout.component';

const routes: Routes = [
  {
    path: '',
    component: DashboardLayoutComponent,
    children: [
      {
        path: 'wallet',
        loadChildren: () =>
          import('../../features/wallet/wallet.module').then((m) => m.WalletModule),
      },
      {
        path: 'entity',
        loadChildren: () =>
          import('../../features/entity/entity.module').then((m) => m.EntityModule),
      },
      {
        path: 'consent',
        loadChildren: () =>
          import('../../features/consent/consent.module').then((m) => m.ConsentModule),
      },
      {
        path: 'rekyc',
        loadChildren: () => import('../../features/rekyc/rekyc.module').then((m) => m.RekycModule),
      },
      {
        path: '**',
        redirectTo: 'rekyc',
      },
      {
        path: '',
        redirectTo: 'rekyc',
        pathMatch: 'full',
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DashboardLayoutRoutingModule {}
