import { NgModule } from '@angular/core';
import { StoreModule } from '@ngrx/store';
import { SharedModule } from 'src/app/shared/shared.module';
import { ReKycStatusClassPipe, ReKycStatusLabelPipe } from './common/rekyc.pipe';
import { ApplicationTableComponent } from './components/application-table/application-table.component';
import { FilemodalComponent } from './components/filemodal/filemodal.component';
import { RekycRoutingModule } from './rekyc-routing.module';
import { RekycComponent } from './rekyc.component';
import { rekycReducer } from './store/rekyc.reducers';

@NgModule({
  imports: [SharedModule, RekycRoutingModule, StoreModule.forFeature('rekyc', rekycReducer)],
  declarations: [
    RekycComponent,
    FilemodalComponent,
    ApplicationTableComponent,
    ReKycStatusLabelPipe,
    ReKycStatusClassPipe,
  ],
})
export class RekycModule {}
