import { ChangeDetectionStrategy, Component, OnInit, signal } from '@angular/core';

interface CheckBoxItem {
  name: string;
  label: string;
  checked: boolean;
}

@Component({
  selector: 'rekyc-bo-form',
  templateUrl: './rekyc-bo-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RekycBoFormComponent implements OnInit {
  checkBoxList: CheckBoxItem[] = [
    {
      name: 'notListedInStockExchange',
      label: 'The entity is not listed on any recognized stock exchange',
      checked: false,
    },
    {
      name: 'managedByOtherEntity',
      label:
        'The entity is managed by another entity that is a depository institution, a custodial institution, a specified insurance company, or an investment entity and the gross income of the entity is primarily attributable to investing, reinvesting, or trading in financial assets.',
      checked: false,
    },
    {
      name: 'nfe',
      label: 'The entity is passive NFE (Non Financial Entity)',
      checked: false,
    },
    {
      name: 'none',
      label: 'None of the above',
      checked: true,
    },
  ];
  checkBoxResult = signal<null | string>(null);

  ngOnInit(): void {
    this.updateBOComp();
  }

  trackCheckBox(_index: number, checkbox: CheckBoxItem): string {
    return checkbox.name;
  }

  onCheckBoxChange(checkbox: CheckBoxItem): void {
    checkbox.checked = !checkbox.checked;

    const isNone = checkbox.name === 'none';

    if (isNone && checkbox.checked) {
      // Uncheck all others
      this.checkBoxList.forEach((cb) => {
        if (cb.name !== 'none') cb.checked = false;
      });
    } else if (!isNone && checkbox.checked) {
      // Uncheck "None of the above"
      const noneOption = this.checkBoxList.find((cb) => cb.name === 'none');
      if (noneOption) noneOption.checked = false;
    }

    this.updateBOComp();
  }

  updateBOComp() {
    const anySelected = this.checkBoxList.some((cb) => cb.checked);
    const isNoneSelected = this.checkBoxList.find((cb) => cb.name === 'none')?.checked;

    if (!anySelected) {
      this.checkBoxResult.set(null);
    } else if (isNoneSelected) {
      this.checkBoxResult.set('input');
    } else {
      this.checkBoxResult.set('fileupload');
    }
  }
}
