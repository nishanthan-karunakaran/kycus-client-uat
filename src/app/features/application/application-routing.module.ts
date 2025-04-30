import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'rekyc',
    loadChildren: () =>
      import('@features/forms/rekyc-form/rekyc-form.module').then((m) => m.RekycFormModule),
  },
  {
    path: '**',
    redirectTo: 'rekyc',
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ApplicationRoutingModule {}
