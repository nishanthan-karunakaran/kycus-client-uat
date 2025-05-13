import { Component, EventEmitter, Input, OnInit, Output, signal } from '@angular/core';
import { selectAusInfo } from '@features/forms/rekyc-form/components/rekyc-personal-details/store/personal-details.selectors';
import { selectEntityInfo } from '@features/forms/rekyc-form/components/entity-filledby/store/entity-info.selectors';
import { toSignal } from '@angular/core/rxjs-interop';
import { Store } from '@ngrx/store';
import {
  AusESignPreviewData,
  RekycPersonalFormService,
} from '@features/forms/rekyc-form/components/rekyc-personal-details/rekyc-personal.service';
import { ApiStatus } from '@core/constants/api.response';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HelperService } from '@core/services/helpers.service';

@Component({
  selector: 'rekyc-esign-personaldet',
  templateUrl: './esign-personaldet.component.html',
})
export class EsignPersonaldetComponent implements OnInit {
  @Input() openSheet = false;
  @Output() closeSheet = new EventEmitter(false);
  form!: FormGroup;
  isFormSubmitted = signal(false);
  entityInfo = toSignal(this.store.select(selectEntityInfo));
  ausInfo = toSignal(this.store.select(selectAusInfo));
  isLoading = signal(false);
  data = signal<AusESignPreviewData>({} as AusESignPreviewData);
  showSaveConfirmModal = signal(false);

  constructor(
    private fb: FormBuilder,
    private store: Store,
    private personalFormService: RekycPersonalFormService,
    private helperService: HelperService,
  ) {}

  ngOnInit(): void {
    if (this.openSheet) {
      this.getESignPreviewDetails();
    }

    this.form = this.fb.group({
      name: ['', [Validators.required]],
      fatherName: ['', [Validators.required]],
      proofOfIdentity: [{ fileName: '', url: '' }, [Validators.required]],
      proofOfAddress: [{ fileName: '', url: '' }, [Validators.required]],
      currentAddress: ['', [Validators.required]],
      city: ['', [Validators.required]],
      state: ['', [Validators.required]],
      country: ['', [Validators.required]],
      pinCode: ['', [Validators.required, Validators.maxLength(6), Validators.minLength(6)]],
      photographUrl: ['', [Validators.required]],
      signatureUrl: ['', [Validators.required]],
    });
  }

  handleSheet() {
    this.closeSheet.emit(true);
  }

  handleSaveConfimModal() {
    this.showSaveConfirmModal.set(!this.showSaveConfirmModal());
  }

  updateFormGroup() {
    const formData = this.data();

    if (!formData) return;

    this.form.patchValue({
      name: formData.name,
      fatherName: formData.fatherName,
      proofOfIdentity: formData.proofOfIdentity,
      proofOfAddress: formData.proofOfAddress,
      currentAddress: formData.currentAddress,
      city: formData.city,
      state: formData.state,
      country: formData.country,
      pinCode: formData.pinCode,
      photographUrl: formData.photographUrl,
      signatureUrl: formData.signatureUrl,
    });
  }

  getESignPreviewDetails() {
    const entityId = this.entityInfo()?.entityId as string;
    const ausId = this.ausInfo()?.ausId as string;

    this.personalFormService.esignAusPreview(entityId, ausId).subscribe({
      next: (result) => {
        const { loading, response } = result;
        this.isLoading.set(loading);

        if (!response) return;

        const { status } = response;

        if (status === ApiStatus.SUCCESS) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const { data } = response as any;
          this.data.set(data);
          this.updateFormGroup();
        }
      },
    });
  }

  updateValue(key: string, value: string | number | boolean) {
    const control = this.form.get(key);
    if (control) {
      control.setValue(value);
    }
  }

  getErrorMessage(formControlName: string): string {
    if (!this.isFormSubmitted()) {
      return '';
    }

    const controlName = this.helperService.toTitleCase(formControlName);

    const control = this.form.get(formControlName);
    if (control && control.errors) {
      // Loop through the errors object to handle all error cases
      for (const errorKey in control.errors) {
        if (Object.prototype.hasOwnProperty.call(control.errors, errorKey)) {
          const errorValue = control.errors[errorKey];

          // Handle the specific error types
          switch (errorKey) {
            case 'required':
              return `${controlName} is required`;
            case 'minlength':
              return `${controlName} must be at least ${errorValue.requiredLength} characters`;
            case 'maxlength':
              return `${controlName} must be at most ${errorValue.requiredLength} characters`;
            case 'pattern':
              return `${controlName} has an invalid format`;
            default:
              return `${controlName} is invalid`; // Default case for unknown errors
          }
        }
      }
    }
    return ''; // Return an empty string if no errors
  }

  onSubmit() {
    this.handleSaveConfimModal();
    this.isFormSubmitted.set(true);

    const entityId = this.entityInfo()?.entityId;
    const ausId = this.ausInfo()?.ausId;

    if (!entityId || !ausId || !this.form.valid) {
      return;
    }

    const payload = {
      entityId,
      ausId,
      data: this.form.value,
    };

    this.personalFormService.esignAusPreviewSave(payload).subscribe();
  }
}
