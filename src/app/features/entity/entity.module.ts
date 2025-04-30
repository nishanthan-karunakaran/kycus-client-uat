import { NgModule } from '@angular/core';
import { SharedModule } from 'src/app/shared/shared.module';
import { EntityRoutingModule } from './entity-routing.module';
import { EntityComponent } from './entity.component';

@NgModule({
  imports: [SharedModule, EntityRoutingModule],
  declarations: [EntityComponent],
})
export class EntityModule {}
