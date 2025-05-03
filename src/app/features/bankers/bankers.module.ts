import { NgModule } from '@angular/core';
import { SharedModule } from '@src/app/shared/shared.module';
import { BankersRoutingModule } from './bankers-routing.module';
import { BankersComponent } from './bankers.component';
import { RekycBankersLoginComponent } from './pages/bankers-login/bankers-login.component';

@NgModule({
  imports: [SharedModule, BankersRoutingModule],
  declarations: [BankersComponent, RekycBankersLoginComponent],
})
export class BankersModule {}
