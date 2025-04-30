import { ChangeDetectionStrategy, Component } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RekycFormService } from '@features/forms/rekyc-form/rekyc-form.service';
import { selectRekycCurrentEntityDetTab } from '@features/forms/rekyc-form/store/rekyc-form.selectors';
import { Store } from '@ngrx/store';

interface ScreenHeader {
  label: string;
  value: string;
}

@Component({
  selector: 'rekyc-entity-details-form',
  templateUrl: './entity-details-form.component.html',
  // styleUrls: ['./entity-details-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RekycEntityDetailsFormComponent {
  currentScreen = toSignal(this.store.select(selectRekycCurrentEntityDetTab));
  screenHeaders: ScreenHeader[] = [
    {
      label: 'Entity Details',
      value: 'entity-details',
    },
    {
      label: 'List of Directors',
      value: 'directors',
    },
    {
      label: 'Beneficiary Owners',
      value: 'bo',
    },
  ];

  constructor(
    private rekycFormService: RekycFormService,
    private store: Store,
  ) {}

  trackScreenHeader(_index: number, screen: ScreenHeader) {
    return screen.value;
  }

  setCurrentScreen(value: string) {
    this.rekycFormService.updateRekycLS('currentEntityDetTab', value);
  }

  submit(value: string) {
    // eslint-disable-next-line no-console
    console.log(value);
  }
}
