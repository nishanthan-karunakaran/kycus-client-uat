import { NgModule } from '@angular/core';
import { SharedModule } from 'src/app/shared/shared.module';
import { AuthLayoutRoutingModule } from './auth-layout-routing.module';
import { AuthLayoutComponent } from './auth-layout.component';
import { AuthSidebarComponent } from './components/auth-sidebar/auth-sidebar.component';

@NgModule({
  imports: [SharedModule, AuthLayoutRoutingModule],
  declarations: [AuthLayoutComponent, AuthSidebarComponent],
})
export class AuthLayoutModule {}
