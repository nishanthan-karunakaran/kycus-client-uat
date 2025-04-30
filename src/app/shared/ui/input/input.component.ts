import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  forwardRef,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { InputFormat } from 'src/app/core/directives/input-format.directive';

@Component({
  selector: 'ui-input',
  templateUrl: './input.component.html',
  // styleUrls: ['./input.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
      multi: true,
    },
  ],
})
export class InputComponent implements OnChanges, AfterViewInit, ControlValueAccessor {
  @Input() type = 'text';
  @Input() id = '';
  @Input() name = '';
  @Input() label = '';
  @Input() placeholder = '';
  @Input() readonly = false;
  @Input() disabled = false;
  @Input() autofocus = false;
  @Input() required = false;
  @Input() maxlength?: number;
  @Input() max?: number;
  @Input() min?: number;
  @Input() pattern?: string | null = null;
  @Input() autocomplete?: 'on' | 'off' | null = 'on';
  @Input() errorMessage: string | null = null;
  @Input() icon: string | null = null;
  @Input() iconSize = 20;
  @Input() iconColor = '';
  @Input() iconPos: 'start' | 'end' = 'start';
  @Input() inputFormat: InputFormat = InputFormat.DEFAULT;
  @Input() class = '';
  @Output() valueChange = new EventEmitter<string | number | boolean>();

  value: string | number | boolean = '';
  @ViewChild('inputElement') inputRef!: ElementRef<HTMLInputElement>;

  onChange: (value: string | number | null) => void = () => {};
  onTouched = () => {};

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnChanges(changes: SimpleChanges): void {
    for (const propName in changes) {
      if (Object.prototype.hasOwnProperty.call(changes, propName)) {
        const change = changes[propName];

        // Handle autofocus and set focus if true
        if (propName === 'autofocus' && change.currentValue) {
          this.focusInput();
        }

        // Handle disabled state dynamically
        if (propName === 'disabled') {
          this.setDisabledState(change.currentValue);
        }

        // Handle readonly state dynamically
        if (propName === 'readonly') {
          this.setReadonlyState(change.currentValue);
        }

        // Update other properties if necessary
        if (this.inputRef) {
          if (propName === 'maxlength') {
            this.inputRef.nativeElement.maxLength = this.maxlength || -1;
          }

          if (propName === 'min') {
            this.inputRef.nativeElement.min = this.min ? String(this.min) : '';
          }

          if (propName === 'max') {
            this.inputRef.nativeElement.max = this.max ? String(this.max) : '';
          }

          if (propName === 'pattern') {
            this.inputRef.nativeElement.pattern = this.pattern || '';
          }

          if (propName === 'autocomplete') {
            this.inputRef.nativeElement.autocomplete = this.autocomplete || 'off';
          }
        }
      }
    }

    // Trigger change detection to ensure input reflects changes immediately
    this.cdr.detectChanges();
  }

  ngAfterViewInit(): void {
    if (this.autofocus) {
      setTimeout(() => this.inputRef?.nativeElement?.focus(), 0);
    }
  }

  focusInput(): void {
    setTimeout(() => this.inputRef?.nativeElement?.focus(), 0);
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    if (this.inputRef) {
      this.inputRef.nativeElement.disabled = isDisabled;
    }
  }

  setReadonlyState(isReadonly: boolean): void {
    this.readonly = isReadonly;
    if (this.inputRef) {
      this.inputRef.nativeElement.readOnly = isReadonly;
    }
  }

  writeValue(value: string | number | boolean): void {
    this.value = value;
  }

  registerOnChange(fn: (value: string | number | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: (value: string | number | null) => void): void {
    this.onChange = fn;
  }

  handleInput(event: Event): void {
    const target = event.target as HTMLInputElement;

    let inputValue = target.value;

    // Apply maxlength validation for all input types
    if (this.maxlength !== undefined && inputValue.length > this.maxlength) {
      inputValue = inputValue.slice(0, this.maxlength); // Trim input to maxlength
      target.value = inputValue; // Update input field with trimmed value
    }

    if (this.type === 'number') {
      // Remove non-numeric characters except for decimal and minus sign
      let cleanedValue = inputValue.replace(/[^0-9.-]/g, '');

      // Ensure only one decimal point is allowed
      const decimalCount = (cleanedValue.match(/\./g) || []).length;
      if (decimalCount > 1) {
        cleanedValue = cleanedValue.slice(0, cleanedValue.lastIndexOf('.'));
      }

      if (cleanedValue !== '' && !isNaN(Number(cleanedValue))) {
        let numericValue = Number(cleanedValue);

        // Ensure min/max constraints are applied, if defined
        if (this.min !== undefined && numericValue < this.min) {
          numericValue = this.min;
        }
        if (this.max !== undefined && numericValue > this.max) {
          numericValue = this.max;
        }

        this.value = numericValue;
        target.value = String(numericValue); // Update input field with the valid numeric value
      } else {
        this.value = ''; // Reset value if invalid
        target.value = ''; // Clear input if value is not valid
      }
    } else {
      // For other types, just update the value based on input (text, etc.)
      this.value = inputValue;
      target.value = inputValue; // Update input field with value
    }

    this.onChange(this.value);
    this.onTouched();
    this.valueChange.emit(this.value);
  }
}
