import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BankersComponent } from './bankers.component';
import { RekycBankersLoginComponent } from './pages/bankers-login/bankers-login.component';

const routes: Routes = [
  {
    path: '',
    component: BankersComponent,
    children: [
      {
        path: 'login',
        component: RekycBankersLoginComponent,
      },
      {
        path: '**',
        redirectTo: 'login',
      },
      {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full',
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BankersRoutingModule {}
