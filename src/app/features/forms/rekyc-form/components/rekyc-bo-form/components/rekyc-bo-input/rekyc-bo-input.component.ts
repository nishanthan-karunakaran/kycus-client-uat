import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { AbstractControl, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiStatus } from '@core/constants/api.response';
import { RekycBoService } from '@features/forms/rekyc-form/components/rekyc-bo-form/rekyc-bo.service';
import { selectAusInfo } from '@features/forms/rekyc-form/components/rekyc-personal-details/store/personal-details.selectors';
import { BoDetail, SaveBODetails } from '@features/forms/rekyc-form/rekyc-form.model';
import { RekycFormService } from '@features/forms/rekyc-form/rekyc-form.service';
import { updateRekycStepStatus } from '@features/forms/rekyc-form/store/rekyc-form.action';
import { selectRekycStepStatus } from '@features/forms/rekyc-form/store/rekyc-form.selectors';
import { Store } from '@ngrx/store';
import { ToastService } from '@src/app/shared/ui/toast/toast.service';
import { selectEntityInfo } from '@features/forms/rekyc-form/components/entity-filledby/store/entity-info.selectors';

@Component({
  selector: 'rekyc-bo-input',
  templateUrl: './rekyc-bo-input.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RekycBoInputComponent implements OnInit {
  form = this.fb.group({
    boDetails: this.fb.array([]),
  });
  isLoading = signal(false);
  readonly ausInfo = toSignal(this.store.select(selectAusInfo));
  readonly entityInfo = toSignal(this.store.select(selectEntityInfo));
  readonly formStepStatus = toSignal(this.store.select(selectRekycStepStatus));
  isFormSubmitted = signal(false);
  showDeleteConfimation = signal(false);
  selectedBOToRemove = signal<number | null>(null);

  constructor(
    private fb: FormBuilder,
    private boService: RekycBoService,
    private rekycFormService: RekycFormService,
    private toast: ToastService,
    private store: Store,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.getBODetails();
    // Add two initial BO entries
    //   this.addBoDetail();
    //   this.addBoDetail();
  }

  setSeletedBOToRemove(index: number) {
    this.selectedBOToRemove.set(index);
    this.handleShowDeleteConfirmation();
  }

  handleShowDeleteConfirmation(boIndex: number | null = null) {
    if (boIndex) {
      this.selectedBOToRemove.set(boIndex);
    } else {
      this.selectedBOToRemove.set(null);
    }
    this.showDeleteConfimation.set(!this.showDeleteConfimation());
  }

  trackBO(index: number, group: AbstractControl): number | string {
    const boId = group.get('boId')?.value;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return boId ?? index; // If `id` is `null` or `undefined`, fall back to `index`
  }

  get boDetails(): FormArray {
    return this.form.get('boDetails') as FormArray;
  }

  get isFormValid(): boolean {
    const formArray = this.form.get('boDetails') as FormArray;
    // eslint-disable-next-line no-console
    console.log(
      'bo submit',
      formArray && formArray.length > 0,
      formArray.controls.every((control) => control.valid),
    );
    return (
      formArray && formArray.length > 0 && formArray.controls.every((control) => control.valid)
    );
  }

  createBoDetail(): FormGroup {
    return this.fb.group({
      boId: new Date(),
      boName: ['', Validators.required],
      addressLine: ['', Validators.required],
      city: ['', Validators.required],
      state: ['', Validators.required],
      country: ['', Validators.required],
      pin: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],
    });
  }

  updateBoDetail(index: number, field: string, value: string | number | boolean): void {
    const control = this.boDetails.at(index);
    if (control) {
      control.get(field)?.setValue(value, { emitEvent: false });
    }
  }

  addBoDetail() {
    this.boDetails.push(this.createBoDetail());
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  addBOFromData(data: any) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data.forEach((bo: any) => {
      this.boDetails.push(
        this.fb.group({
          boId: [bo.boId],
          boName: [bo.boName, Validators.required],
          addressLine: [bo.addressLine, Validators.required],
          city: [bo.city, Validators.required],
          state: [bo.state, Validators.required],
          country: [bo.country, Validators.required],
          pin: [bo.pin, [Validators.required, Validators.pattern(/^\d{6}$/)]],
        }),
      );
    });
    this.cdr.markForCheck();
  }

  removeBoDetail(): void {
    const index = this.selectedBOToRemove() as number;
    this.boDetails.removeAt(index);
    this.handleShowDeleteConfirmation();
  }

  submit(action: 'save' | 'submit') {
    if (!this.isFormValid) {
      this.isFormSubmitted.set(true);
      return;
    }

    if (action === 'submit') {
      const boList = this.form.value.boDetails as BoDetail[];

      const payload: SaveBODetails = {
        ausId: this.ausInfo()?.ausId as string,
        boList,
      };
      this.boService.saveBODetails(payload).subscribe({
        next: (result) => {
          const { loading, response } = result;
          this.isLoading.set(loading);

          if (!response) return;

          const { status } = response;

          if (status === ApiStatus.SUCCESS) {
            this.toast.success('Beneficairy Owners saved!');
            this.store.dispatch(updateRekycStepStatus({ boDetails: true }));
            this.rekycFormService.updatRekycFormStep('bo');
          } else {
            this.toast.error(response.message || 'Something went wrong!');
          }
        },
      });
    }
  }

  getBODetails() {
    const entityId = this.entityInfo()?.entityId as string;

    this.boService.getBODetails(entityId).subscribe({
      next: (result) => {
        const { loading, response } = result;

        if (!loading && response) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const { status, data } = response as any;

          if (status === ApiStatus.SUCCESS) {
            if (data.length > 0) {
              this.addBOFromData(data);
            } else {
              // Add two initial BO entries
              this.addBoDetail();
              this.addBoDetail();
              this.cdr.markForCheck();
            }
          }
        }
      },
    });
  }
}
