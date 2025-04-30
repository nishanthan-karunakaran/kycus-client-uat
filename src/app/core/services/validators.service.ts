import { Injectable } from '@angular/core';
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

@Injectable({
  providedIn: 'root',
})
export class ValidatorsService {
  emailValidator(customMessage?: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      const valid = emailRegex.test(control.value);
      return valid
        ? null
        : {
            email: true,
            validationError: customMessage || 'Invalid email format',
          };
    };
  }

  panValidator(customMessage?: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
      const valid = panRegex.test(control.value?.toUpperCase());
      return valid
        ? null
        : { pan: true, validationError: customMessage || 'Invalid PAN format' };
    };
  }

  aadhaarValidator(customMessage?: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const aadhaarRegex = /^[2-9]{1}[0-9]{11}$/;
      const valid = aadhaarRegex.test(control.value);
      return valid
        ? null
        : {
            aadhaar: true,
            validationError: customMessage || 'Invalid Aadhaar number',
          };
    };
  }

  mobileNumberValidator(customMessage?: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const mobileRegex = /^[6-9]{1}[0-9]{9}$/;
      const valid = mobileRegex.test(control.value);
      return valid
        ? null
        : {
            mobileNumber: true,
            validationError: customMessage || 'Invalid mobile number',
          };
    };
  }
}
