import { NgModule } from '@angular/core';
import { SharedModule } from 'src/app/shared/shared.module';
import { RekycFormComponent } from './pages/rekyc-form/rekyc-form.component';
import { ApplicationRoutingModule } from './application-routing.module';
import { EmailValidationComponent } from './pages/email-validation/email-validation.component';

@NgModule({
  imports: [SharedModule, ApplicationRoutingModule],
  declarations: [RekycFormComponent, EmailValidationComponent],
})
export class ApplicationModule {}
