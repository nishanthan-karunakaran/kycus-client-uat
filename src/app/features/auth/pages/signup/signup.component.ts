import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { interval, Subscription, takeWhile } from 'rxjs';
import { ApiStatus } from 'src/app/core/constants/api.response';
import { InputFormat } from 'src/app/core/directives/input-format.directive';
import { HelperService } from 'src/app/core/services/helpers.service';
import { ValidatorsService } from 'src/app/core/services/validators.service';
import { AccessTokens, AuthStep } from 'src/app/features/auth/auth.model';
import { AuthService } from 'src/app/features/auth/auth.service';
import { ToastService } from 'src/app/shared/ui/toast/toast.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss'],
})
export class SignupComponent implements OnInit, OnDestroy {
  isLoading = false;
  isSubmitted = false;
  signupForm!: FormGroup;
  signupState = signal<AuthStep>({
    otpSent: false,
    otpVerified: false,
  });
  inputFormat: InputFormat = InputFormat.LOWERCASE;
  resendOTPTimer = 0;
  private intervalSubscription: Subscription | null = null;
  private readonly initialTime = 30;

  constructor(
    private fb: FormBuilder,
    private validatorService: ValidatorsService,
    private helperService: HelperService,
    private toast: ToastService,
    private authService: AuthService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.signupForm = this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, this.validatorService.emailValidator()]],
    });
  }

  addOTPField() {
    this.isSubmitted = false;
    this.signupForm.addControl(
      'otp',
      this.fb.control('', [Validators.required, Validators.minLength(6)]),
    );
  }

  addAllFields(): void {
    this.isSubmitted = false;

    const additionalFields: Record<string, [string, ValidatorFn | ValidatorFn[]]> = {
      cin: ['', Validators.required],
      companyName: ['', Validators.required],
      designation: ['', Validators.required],
      mobileNumber: ['', [Validators.required, this.validatorService.mobileNumberValidator()]],
    };

    Object.entries(additionalFields).forEach(
      ([key, config]: [string, [string, ValidatorFn | ValidatorFn[]]]) => {
        this.signupForm.addControl(key, new FormControl(config[0], config[1]));
      },
    );
  }
  getRequiredMessage(field: string): string {
    const capsErrorFields = ['aadhaar', 'pan', 'otp', 'companyName'];

    if (capsErrorFields.includes(field)) {
      return `${field.toUpperCase()} is required`;
    }

    if (field === 'mobileNumber') {
      return 'Mobile Number is required';
    }
    return `${this.helperService.toTitleCase(field)} is required`;
  }

  getFormError(field: string): string | null {
    if (!this.isSubmitted) return null;

    const control = this.signupForm.get(field);
    if (!control) return null;

    switch (true) {
      case control.hasError('required'):
        return this.getRequiredMessage(field);

      case control.hasError('email'):
        return 'Invalid email format';

      case control.hasError('minlength'):
        return `${this.helperService.toTitleCase(field)} must be at least ${control.errors?.['minlength']?.requiredLength} characters`;

      case control.hasError('validationError'):
        return control.errors?.['validationError'] as string;

      default:
        return null;
    }
  }

  isButtonDisabled(): boolean {
    if (this.isLoading) return true; // btn to be disabled if loading

    // Get all required fields
    const requiredFields = Object.keys(this.signupForm.controls).filter((key) =>
      this.signupForm.get(key)?.hasValidator(Validators.required),
    );

    // Check if any required field is empty
    const hasEmptyRequiredFields = requiredFields.some(
      (field) => !this.signupForm.get(field)?.value,
    );

    // Check OTP length if the field exists
    const otpField = this.signupForm.get('otp');
    const isOtpInvalid = otpField ? otpField.value?.length !== 6 : false;

    return hasEmptyRequiredFields || isOtpInvalid;
  }

  startResendTimer() {
    this.resendOTPTimer = this.initialTime;

    this.intervalSubscription = interval(1000)
      .pipe(takeWhile(() => this.resendOTPTimer > 0))
      .subscribe(() => {
        this.resendOTPTimer--;
      });
  }

  stopResendTimer() {
    if (this.intervalSubscription) {
      this.intervalSubscription.unsubscribe();
    }
    this.resendOTPTimer = 0;
  }

  sendEmailOTP(isResend = false) {
    const canProceed = isResend ? this.resendOTPTimer <= 0 : true;

    if (canProceed) {
      this.authService.sendEmailOTP({ email: this.signupForm.value.email }).subscribe({
        next: (result) => {
          const { loading, response } = result;
          this.isLoading = loading;

          if (!response) return;

          const { status } = response;

          if (status === ApiStatus.SUCCESS) {
            this.signupState.mutate((state) => (state.otpSent = true));
            this.startResendTimer();
            this.addOTPField();
            this.toast.success('OTP sent successfully!');
          } else {
            this.toast.error(response.message || 'Something went wrong!');
          }
        },
      });
    }
  }

  verifyEmailOTP() {
    const payload = {
      email: this.signupForm.value.email,
      otp: this.signupForm.value.otp,
    };

    this.authService.verifyEmailOTP(payload).subscribe({
      next: (result) => {
        const { loading, response } = result;
        this.isLoading = loading;

        if (!response) return;

        const { status } = response;

        if (status === ApiStatus.SUCCESS) {
          this.signupState.mutate((state) => (state.otpVerified = true));
          this.addAllFields();
          this.toast.success('OTP verified successfully!');
          this.stopResendTimer();
        } else {
          this.toast.error(response.message || 'Something went wrong!');
        }
      },
    });
  }

  signup() {
    const payload = {
      email: this.signupForm.value.email,
      username: this.signupForm.value.name,
      isAgree: true,
      companyName: this.signupForm.value.companyName,
      designation: this.signupForm.value.designation,
      mobileNumber: this.signupForm.value.mobileNumber,
      cin: '12231788938141',
    };

    this.authService.signup(payload).subscribe({
      next: (result) => {
        const { loading, response } = result;
        this.isLoading = loading;

        if (!response) return;

        const { status, data } = response;

        if (status === ApiStatus.SUCCESS) {
          this.authService.setAccessTokens(data as AccessTokens);
          this.router.navigate(['/']);
          this.toast.success('Account created successfully!');
        } else {
          this.toast.error(response.message || 'Something went wrong!');
        }
      },
    });
  }

  submitForm() {
    this.isSubmitted = true;

    if (this.signupForm.invalid) return;

    if (!this.signupState().otpSent) {
      this.sendEmailOTP();
    } else if (!this.signupState().otpVerified) {
      this.verifyEmailOTP();
    } else {
      this.signup();
    }

    // this.signupForm.get('mobileNumber')?.setErrors({ 'validationError': 'Vanakkam' });
  }

  ngOnDestroy() {
    if (this.intervalSubscription) {
      this.intervalSubscription.unsubscribe();
    }
  }
}
