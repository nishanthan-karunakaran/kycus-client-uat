import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Store } from '@ngrx/store';
import { selectAusInfo } from '../rekyc-personal-details/store/personal-details.selectors';

type Screens = 'directors' | 'bo';

interface ScreenHeader {
  label: string;
  value: string;
}

@Component({
  selector: 'rekyc-declaration-form',
  templateUrl: './rekyc-declaration-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RekycDeclarationFormComponent {
  currentScreen = signal<Screens>('directors');
  screenHeaders: ScreenHeader[] = [
    {
      label: 'Directors',
      value: 'directors',
    },
    {
      label: 'Beneficiary Owners',
      value: 'bo',
    },
  ];
  addBtnTrigger = false;
  ausInfo = toSignal(this.store.select(selectAusInfo));

  constructor(private store: Store) {}

  trackScreenHeader(_index: number, screen: ScreenHeader) {
    return screen.value;
  }

  handleAddBtn() {
    this.addBtnTrigger = !this.addBtnTrigger;
  }

  setCurrentScreen(value: string) {
    this.currentScreen.set(value as Screens);
  }

  tabNavigation() {
    if (this.currentScreen() === 'directors') {
      this.setCurrentScreen('bo');
    }
  }
}
