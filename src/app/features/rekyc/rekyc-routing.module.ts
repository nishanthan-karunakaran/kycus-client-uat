import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RekycComponent } from './rekyc.component';

const routes: Routes = [
  {
    path: '',
    component: RekycComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RekycRoutingModule {}
