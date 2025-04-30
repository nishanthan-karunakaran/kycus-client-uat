import { NgModule } from '@angular/core';
import { SharedModule } from 'src/app/shared/shared.module';
import { WalletRoutingModule } from './wallet-routing.module';
import { WalletComponent } from './wallet.component';

@NgModule({
  imports: [SharedModule, WalletRoutingModule],
  declarations: [WalletComponent],
})
export class WalletModule {}
