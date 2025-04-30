import { Component, ElementRef, OnDestroy, OnInit, signal, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { interval, Subject, Subscription, takeUntil, takeWhile } from 'rxjs';
import { ApiStatus } from 'src/app/core/constants/api.response';
import { InputFormat } from 'src/app/core/directives/input-format.directive';
import { HelperService } from 'src/app/core/services/helpers.service';
import { ValidatorsService } from 'src/app/core/services/validators.service';
import { AccessTokens, AuthStep } from 'src/app/features/auth/auth.model';
import { AuthService } from 'src/app/features/auth/auth.service';
import { ToastService } from 'src/app/shared/ui/toast/toast.service';

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.scss'],
})
export class SigninComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  isSubmitted = false;
  isLoading = false;
  loginState = signal<AuthStep>({
    otpSent: false,
    otpVerified: false,
  });
  loginForm!: FormGroup;
  inputFormat: InputFormat = InputFormat.LOWERCASE;
  @ViewChild('otpInput') otpInput!: ElementRef<HTMLInputElement>;
  resendOTPTimer = 0;
  private intervalSubscription: Subscription | null = null;
  private readonly initialTime = 30;

  constructor(
    private fb: FormBuilder,
    private helperService: HelperService,
    private validatorsService: ValidatorsService,
    private authService: AuthService,
    private toast: ToastService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, this.validatorsService.emailValidator()]],
      otp: [''],
    });
  }

  getFormError(field: string): string | null {
    const control = this.loginForm.get(field);
    if (!control || (!this.isSubmitted && !control.touched)) return null;

    if (control.hasError('required')) {
      return field !== 'otp'
        ? this.helperService.toTitleCase(field) + ' is required'
        : field.toUpperCase() + ' is required';
    }

    if (control.hasError('email')) return 'Invalid email format';

    if (control.hasError('minlength')) {
      const minLength = control.errors?.['minlength']?.requiredLength;
      return `${field} must be at least ${minLength} characters`;
    }

    return null;
  }

  private updateOTPValidators() {
    this.loginForm.get('otp')?.setValidators([Validators.required, Validators.minLength(6)]);
    this.loginForm.get('otp')?.updateValueAndValidity();
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

  requestLoginOTP(isResend = false) {
    const canProceed = isResend ? this.resendOTPTimer <= 0 : true;

    if (canProceed) {
      this.authService
        .requestLoginOTP({ username: this.loginForm.value.email })
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (result) => {
            const { loading, response } = result;
            this.isLoading = loading;

            if (!response) return;

            const { status } = response;

            if (status === ApiStatus.SUCCESS) {
              this.loginState.mutate((state) => (state.otpSent = true));
              this.toast.success('OTP sent successfully!');
              this.startResendTimer();
              this.isSubmitted = false;
              this.updateOTPValidators();
            } else {
              this.toast.error(response.message || 'Something went wrong!');
            }
          },
        });
    }
  }

  signin() {
    const paylaod = {
      username: this.loginForm.value.email,
      otp: this.loginForm.value.otp,
    };

    this.authService.signin(paylaod).subscribe({
      next: (result) => {
        const { loading, response } = result;
        this.isLoading = loading;

        if (!response) return;

        const { status, data } = response;

        if (status === ApiStatus.SUCCESS) {
          this.stopResendTimer();
          this.authService.setAccessTokens(data as AccessTokens);
          this.router.navigate(['/']);
          this.toast.success('Logged in successfully!');
        } else {
          this.toast.error(response.message || 'Something went wrong!');
        }
      },
    });
  }

  submitLoginForm() {
    this.isSubmitted = true;

    if (this.loginForm.invalid) return; // Stop execution if form is invalid

    if (this.loginState().otpSent) {
      this.signin();
    } else {
      this.requestLoginOTP();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
