import { NgModule } from '@angular/core';

import { SharedModule } from 'src/app/shared/shared.module';
import { AuthRoutingModule } from './auth-routing.module';
import { SigninComponent } from './pages/signin/signin.component';
import { SignupComponent } from './pages/signup/signup.component';

@NgModule({
  declarations: [SigninComponent, SignupComponent],
  imports: [AuthRoutingModule, SharedModule],
})
export class AuthModule {}
