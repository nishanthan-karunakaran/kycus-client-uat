import { selectAusInfo } from './../rekyc-personal-details/store/personal-details.selectors';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Store } from '@ngrx/store';
import { selectEntityInfo } from '../entity-filledby/store/entity-info.selectors';

@Component({
  selector: 'rekyc-form-header',
  templateUrl: './rekyc-form-header.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RekycFormHeaderComponent {
  readonly ausInfo = toSignal(this.store.select(selectAusInfo));
  readonly entityInfo = toSignal(this.store.select(selectEntityInfo));
  menuOptions = [
    {
      label: 'Logout',
      icon: 'log-out',
    },
  ];

  constructor(private store: Store) {}

  get getAusType() {
    switch (this.ausInfo()?.ausType?.toLowerCase()) {
      case 'aus':
        return 'Authorized Signatory';
      case 'other':
        return 'Other';
      default:
        return 'Authorized Signatory';
    }
  }
}
