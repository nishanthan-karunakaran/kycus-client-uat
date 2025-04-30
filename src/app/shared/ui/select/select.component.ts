import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export interface SelectOption<T = unknown> {
  label: string;
  value: T;
}

@Component({
  selector: 'ui-select',
  template: `
    <select
      class="w-full rounded border bg-white p-2"
      [ngClass]="ngClass"
      (change)="onSelectChange($event)"
      [disabled]="disabled"
    >
      <option
        *ngFor="let option of options; trackBy: trackOption"
        [value]="option.value"
        [selected]="isSelected(option.value)"
      >
        {{ option.label }}
      </option>
    </select>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: SelectComponent,
      multi: true,
    },
  ],
})
export class SelectComponent<T = unknown> implements ControlValueAccessor, OnInit, OnChanges {
  @Input() options: Array<SelectOption<T>> = [];
  @Input() placeholder = '';
  @Input() class = '';
  @Input() optional = false;
  @Input() disabled = false;
  @Input() defaultValue: T | null = null;

  @Output() valueChange = new EventEmitter<T>();

  selectedValue: T | null = null;
  ngClass = {};

  private onChange: (value: T | null) => void = () => {};
  private onTouched: () => void = () => {};

  ngOnInit(): void {
    if (this.placeholder && this.optional) {
      this.options = [{ label: this.placeholder, value: null as T }, ...this.options];
    }

    this.applyDefaultValue();
  }

  ngOnChanges(): void {
    this.ngClass = {
      [this.class]: !!this.class,
    };

    this.applyDefaultValue(); // in case options or defaultValue changed dynamically
  }

  isSelected(value: T): boolean {
    return value === this.selectedValue;
  }

  onSelectChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value as unknown as T;
    this.selectedValue = value;
    this.onChange(value);
    this.onTouched();
    this.valueChange.emit(value);
  }

  writeValue(value: T | null): void {
    this.selectedValue = value;
  }

  registerOnChange(fn: (value: T | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  trackOption(_index: number, option: SelectOption<T>): unknown {
    return option.value;
  }

  private applyDefaultValue(): void {
    if (this.isValidDefaultValue(this.defaultValue)) {
      this.selectedValue = this.defaultValue;
      this.writeValue(this.defaultValue);
    }
  }

  private isValidDefaultValue(value: T | null): boolean {
    return (
      value !== null &&
      value !== ('' as unknown as T) &&
      this.options.some((opt) => opt.value === value)
    );
  }
}
