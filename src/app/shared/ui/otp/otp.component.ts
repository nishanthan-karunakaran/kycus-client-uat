import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnInit,
  QueryList,
  SimpleChanges,
  ViewChildren,
  forwardRef,
} from '@angular/core';
import {
  FormArray,
  FormControl,
  FormGroup,
  NG_VALUE_ACCESSOR,
} from '@angular/forms';

@Component({
  selector: 'ui-otp',
  templateUrl: './otp.component.html',
  styleUrls: ['./otp.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => OtpComponent),
      multi: true,
    },
  ],
})
export class OtpComponent implements OnInit, OnChanges, AfterViewInit {
  @Input() length = 6;
  @Input() onlyNumeric = true;
  @Input() disabled = false;
  @Input() autofocus = false;
  @Input() required = false;
  @Input() label = '';
  @Input() errorMessage: string | null = '';
  @Input() defaultValue = '';

  @Input() inputProps: Record<string, string | boolean> = {};

  otpForm!: FormGroup;
  otpControls!: FormControl[]; // Store controls separately for easy access

  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  get otpArray(): FormArray {
    return this.otpForm.get('otpValues') as FormArray;
  }

  @ViewChildren('otpInput') otpInputs!: QueryList<ElementRef>;

  ngOnInit(): void {
    this.initializeForm();
    if (this.defaultValue) {
      this.writeValue(this.defaultValue);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['defaultValue'] && this.defaultValue) {
      this.writeValue(this.defaultValue);
    }
  }

  ngAfterViewInit(): void {
    if (this.autofocus && this.otpInputs) {
      this.handleAutoFocus();
    }
  }

  private initializeForm(): void {
    this.otpControls = Array(this.length)
      .fill(null)
      .map(() => new FormControl({ value: '', disabled: this.disabled }));

    this.otpForm = new FormGroup({
      otpValues: new FormArray(this.otpControls),
    });

    // Automatically notify parent form if value changes
    this.otpForm.valueChanges.subscribe((value) => {
      const otpValue = value.otpValues.join(''); // Join the OTP values together
      this.onChange(otpValue); // Notify parent form of changes
    });
  }

  private fillOtpInputs(value: string): void {
    value.split('').forEach((char, index) => {
      if (index < this.length) {
        this.otpControls[index].setValue(char);
      }
    });
  }

  private handleAutoFocus() {
    const firstInput = this.otpInputs.toArray()[0];
    if (firstInput) {
      firstInput.nativeElement.focus();
    }
  }

  onInputChange(index: number, event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.value;

    if (this.onlyNumeric && !/^\d$/.test(value)) {
      this.otpControls[index].setValue('');
      return;
    }

    this.otpControls[index].setValue(value);

    if (index < this.length - 1 && value) {
      this.otpInputs.toArray()[index + 1].nativeElement.focus();
    }
  }

  handleBackspace(index: number, event: KeyboardEvent): void {
    if (event.key === 'Backspace') {
      if (this.otpControls[index].value !== '') {
        this.otpControls[index].setValue('');
      } else if (index > 0) {
        this.otpControls[index - 1].setValue('');
        this.otpInputs.toArray()[index - 1].nativeElement.focus();
      }
      event.preventDefault();
    }
  }

  onPaste(event: ClipboardEvent): void {
    event.preventDefault();
    const pastedValue = event.clipboardData?.getData('text') || '';
    const valueToPaste = this.onlyNumeric
      ? pastedValue.replace(/\D/g, '')
      : pastedValue;

    valueToPaste.split('').forEach((char, i) => {
      if (i < this.length) {
        this.otpControls[i].setValue(char);
      }
    });
  }

  writeValue(value: string): void {
    if (value) {
      this.fillOtpInputs(value); // Update OTP fields from parent value
    }
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    this.otpControls.forEach((control) => {
      if (isDisabled) {
        control.disable();
      } else {
        control.enable();
      }
    });
  }

  trackOTP(index: number) {
    return index;
  }
}
