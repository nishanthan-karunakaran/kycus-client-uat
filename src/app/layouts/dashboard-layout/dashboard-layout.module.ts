import { NgModule } from '@angular/core';
import { SharedModule } from 'src/app/shared/shared.module';
import { DashboardLayoutRoutingModule } from './dashboard-layout-routing.module';
import { DashboardLayoutComponent } from './dashboard-layout.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { HeaderComponent } from './components/header/header.component';

@NgModule({
  imports: [SharedModule, DashboardLayoutRoutingModule],
  declarations: [DashboardLayoutComponent, SidebarComponent, HeaderComponent],
})
export class DashboardLayoutModule {}
