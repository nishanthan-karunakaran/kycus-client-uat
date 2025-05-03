/* eslint-disable @typescript-eslint/no-explicit-any */
import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { RekycFormService } from '@features/forms/rekyc-form/rekyc-form.service';
import { Store } from '@ngrx/store';
import { interval, Subscription, takeWhile } from 'rxjs';
import { ApiStatus } from 'src/app/core/constants/api.response';
import { InputFormat } from 'src/app/core/directives/input-format.directive';
import { ValidatorsService } from 'src/app/core/services/validators.service';
import { ToastService } from 'src/app/shared/ui/toast/toast.service';
import { BankersLoginService } from './bankers-login.service';

@Component({
  selector: 'rekyc-email-validation',
  templateUrl: './bankers-login.component.html',
  styleUrls: ['./bankers-login.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RekycBankersLoginComponent implements OnInit, OnDestroy {
  isSubmitted = false;
  isLoading = signal(false);
  loginForm!: FormGroup;
  otpForm!: FormGroup;
  inputFormat: InputFormat = InputFormat.LOWERCASE;
  isOTPSent = signal(false);
  isOTPValidated = signal(false);
  ausId = '';
  resendOTPTimer = signal(0);

  private intervalSubscription: Subscription | null = null;
  private readonly initialTime = 30;

  constructor(
    private fb: FormBuilder,
    private validatorsService: ValidatorsService,
    private bankersLoginService: BankersLoginService,
    private rekycFormService: RekycFormService,
    private toast: ToastService,
    private store: Store,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, this.validatorsService.emailValidator()]],
    });

    this.otpForm = this.fb.group({
      otp: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  ngOnDestroy(): void {
    this.stopResendTimer();
  }

  startResendTimer(): void {
    this.resendOTPTimer.set(this.initialTime);

    this.intervalSubscription = interval(1000)
      .pipe(takeWhile(() => this.resendOTPTimer() > 0))
      .subscribe(() => {
        this.resendOTPTimer.update((time) => time - 1);
      });
  }

  stopResendTimer(): void {
    if (this.intervalSubscription) {
      this.intervalSubscription.unsubscribe();
      this.intervalSubscription = null;
    }
    this.resendOTPTimer.set(0);
  }

  changeEmail(): void {
    this.isOTPSent.set(false);
    this.stopResendTimer();
  }

  verifyOTP(): void {
    const payload = {
      email: this.loginForm.value.email,
      otp: this.otpForm.value.otp,
    };

    this.bankersLoginService.verifyOTP(payload).subscribe({
      next: (result) => {
        const { loading, response } = result;
        this.isLoading.set(loading);

        if (!response) return;

        const { status, message, success } = response as any;

        if (status === ApiStatus.SUCCESS || success) {
          localStorage.setItem('authEmail', this.loginForm.value.email);
          this.isOTPValidated.set(true);
          this.router.navigate(['/']);
          this.toast.success('Logged in successfully!');
        } else {
          this.toast.error((message as string) || 'Something went wrong');
        }
      },
    });
  }

  requestOTP(): void {
    if (this.resendOTPTimer() <= 0) {
      const payload = {
        email: this.loginForm.value.email,
      };

      this.bankersLoginService.requestOTP(payload).subscribe({
        next: (result) => {
          const { loading, response } = result;
          this.isLoading.set(loading);

          if (!response) return;

          const { status, message, success } = response as any;

          if (status === ApiStatus.SUCCESS || success) {
            this.toast.success('OTP sent to your email');
            this.isOTPSent.set(true);
            this.startResendTimer();
          } else {
            this.toast.error((message as string) || 'Something went wrong');
          }
        },
      });
    }
  }
}
