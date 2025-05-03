import { ChangeDetectionStrategy, Component, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { InputFormat } from 'src/app/core/directives/input-format.directive';
import { ValidatorsService } from 'src/app/core/services/validators.service';
import { EmailValidationService } from './email-validation.service';
import { ApiStatus } from 'src/app/core/constants/api.response';
import { ToastService } from 'src/app/shared/ui/toast/toast.service';

@Component({
  selector: 'app-email-validation',
  templateUrl: './email-validation.component.html',
  styleUrls: ['./email-validation.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmailValidationComponent implements OnInit {
  isSubmitted = false;
  isLoading = false;
  loginForm!: FormGroup;
  inputFormat: InputFormat = InputFormat.LOWERCASE;
  isEmailVerified = signal(false);
  isOTPValidated = signal(false);

  constructor(
    private fb: FormBuilder,
    private validatorsService: ValidatorsService,
    // private helperService: HelperService,
    private emailValidationService: EmailValidationService,
    private toast: ToastService,
    // private router: Router,
  ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: [
        'venkatesh@gmail.com',
        [Validators.required, this.validatorsService.emailValidator()],
      ],
      otp: [''],
    });
  }

  requestOTP() {
    const payload = {
      token: '****',
      email: this.loginForm.value.email,
    };

    this.emailValidationService.requestOTP(payload).subscribe({
      next: (result) => {
        const { loading, response } = result;
        this.isLoading = loading;

        if (!response) return;

        const { status, message } = response;

        if (status === ApiStatus.SUCCESS) {
          this.toast.success(message as string);
        } else {
          this.toast.success(message as string);
        }
      },
    });
  }

  submitForm() {
    if (this.loginForm.valid) {
      if (!this.isEmailVerified()) {
        this.requestOTP();
      }
    }
  }
}
