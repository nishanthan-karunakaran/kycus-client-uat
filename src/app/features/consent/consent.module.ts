import { NgModule } from '@angular/core';
import { SharedModule } from 'src/app/shared/shared.module';
import { ConsentComponent } from './consent.component';
import { ConsentRoutingModule } from './consent-routing.module';

@NgModule({
  imports: [SharedModule, ConsentRoutingModule],
  declarations: [ConsentComponent],
})
export class ConsentModule {}
