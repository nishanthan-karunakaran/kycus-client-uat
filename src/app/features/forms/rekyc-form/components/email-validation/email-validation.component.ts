import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { VerifyOtpResponse } from '@features/forms/rekyc-form/rekyc-form.model';
import { RekycFormService } from '@features/forms/rekyc-form/rekyc-form.service';
import { Store } from '@ngrx/store';
import { interval, Subscription, takeWhile } from 'rxjs';
import { ApiStatus } from 'src/app/core/constants/api.response';
import { InputFormat } from 'src/app/core/directives/input-format.directive';
import { ValidatorsService } from 'src/app/core/services/validators.service';
import { ToastService } from 'src/app/shared/ui/toast/toast.service';
import { setEntityInfo } from '../entity-filledby/store/entity-info.actions';
import {
  setAusInfo,
  updateAccessibleSteps,
} from '../rekyc-personal-details/store/personal-details.actions';
import { EmailValidationService } from './email-validation.service';

@Component({
  selector: 'rekyc-email-validation',
  templateUrl: './email-validation.component.html',
  styleUrls: ['./email-validation.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RekycEmailValidationComponent implements OnInit, OnDestroy {
  @Input() token: string | null = null;
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
    private emailValidationService: EmailValidationService,
    private rekycFormService: RekycFormService,
    private toast: ToastService,
    private store: Store,
  ) {}

  ngOnInit(): void {
    localStorage.removeItem('rekyc');
    localStorage.removeItem('access_token');

    if (this.token) {
      this.rekycFormService.updateRekycLS('applicationToken', this.token);
    }

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
      ausId: this.ausId,
      otp: this.otpForm.value.otp,
    };

    this.emailValidationService.verifyOTP(payload).subscribe({
      next: (result) => {
        const { loading, response } = result;
        this.isLoading.set(loading);

        if (!response) return;

        const { status, message } = response;

        if (status === ApiStatus.SUCCESS) {
          const { data } = response as { data: VerifyOtpResponse };
          data.ausInfo.isAuthenticated = true; // update the authenticated status
          data.ausInfo.ausName = data.ausInfo?.ausName || this.loginForm.value.email;
          data.ausInfo.ausType = data.ausInfo.ausId?.includes('OTHER') ? 'OTHER' : 'AUS';
          this.store.dispatch(setEntityInfo(data.entityInfo));
          this.store.dispatch(setAusInfo(data.ausInfo));
          this.toast.success('Email Verified!');
          this.isOTPSent.set(true);

          localStorage.setItem('access_token', data.access_token);

          this.rekycFormService.tabCompletionStatus(data.ausInfo.ausId as string);

          this.rekycFormService.updateRekycLS('ausInfo', data.ausInfo);
          this.rekycFormService.updateRekycLS('entityInfo', data.entityInfo);

          const ausId = data.ausInfo.ausId;
          const entityFilledBy = data.entityInfo.entityFilledBy;
          let accessibleSteps = {
            entityDetails: false,
            ausDetails: true,
            rekycForm: false,
            eSign: true,
          };

          if (entityFilledBy !== null) {
            if (ausId !== entityFilledBy) {
              accessibleSteps = {
                entityDetails: false,
                ausDetails: true,
                rekycForm: false,
                eSign: true,
              };
            } else if (ausId === entityFilledBy) {
              if (ausId.includes('OTHER')) {
                accessibleSteps = {
                  entityDetails: true,
                  ausDetails: false,
                  rekycForm: true,
                  eSign: false,
                };
              } else {
                accessibleSteps = {
                  entityDetails: true,
                  ausDetails: true,
                  rekycForm: true,
                  eSign: true,
                };
              }
            }
            this.rekycFormService.updateRekycLS('accessibleSteps', accessibleSteps);
            this.store.dispatch(updateAccessibleSteps({ accessibleSteps }));
          }
        } else {
          this.toast.error((message as string) || 'Something went wrong');
        }
      },
    });
  }

  requestOTP(): void {
    if (this.token && this.resendOTPTimer() <= 0) {
      const payload = {
        token: this.token,
        email: this.loginForm.value.email,
      };

      this.emailValidationService.requestOTP(payload).subscribe({
        next: (result) => {
          const { loading, response } = result;
          this.isLoading.set(loading);

          if (!response) return;

          const { status, message, data } = response;

          if (status === ApiStatus.SUCCESS) {
            const { ausId } = data as { ausId: string };
            this.ausId = ausId;
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
