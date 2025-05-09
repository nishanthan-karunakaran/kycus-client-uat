import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RekycEmailValidationComponent } from './components/email-validation/email-validation.component';
import { RekycEntityDetailsFormComponent } from './components/entity-details-form/entity-details-form.component';
import { RekycEsignComponent } from './components/rekyc-esign/rekyc-esign.component';
import { RekycKycFormComponent } from './components/rekyc-kyc-form/rekyc-kyc-form.component';
import { RekycPersonalDetailsComponent } from './components/rekyc-personal-details/rekyc-personal-details.component';
import { RekycFormComponent } from './rekyc-form.component';

const routes: Routes = [
  {
    path: '',
    component: RekycFormComponent,
    children: [
      {
        path: 'login',
        component: RekycEmailValidationComponent,
      },
      {
        path: 'entity-details',
        component: RekycEntityDetailsFormComponent,
        // canActivate: [RekycGuard],
      },
      {
        path: 'personal-details',
        component: RekycPersonalDetailsComponent,
        // canActivate: [RekycGuard],
      },
      {
        path: 'rekyc-form',
        component: RekycKycFormComponent,
        // canActivate: [RekycGuard],
      },
      {
        path: 'eSign',
        component: RekycEsignComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RekycFormRoutingModule {}
