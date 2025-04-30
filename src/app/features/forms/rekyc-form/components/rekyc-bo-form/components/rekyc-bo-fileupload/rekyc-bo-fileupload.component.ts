import { ChangeDetectionStrategy, Component, OnInit, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiStatus } from '@core/constants/api.response';
import { selectEntityInfo } from '@features/forms/rekyc-form/components/entity-filledby/store/entity-info.selectors';
import { RekycBoService } from '@features/forms/rekyc-form/components/rekyc-bo-form/rekyc-bo.service';
import { selectBODetails } from '@features/forms/rekyc-form/components/rekyc-bo-form/store/rekyc-bo.selectors';
import { BODetails } from '@features/forms/rekyc-form/components/rekyc-bo-form/store/rekyc-bo.state';
import { RekycPersonalFormService } from '@features/forms/rekyc-form/components/rekyc-personal-details/rekyc-personal.service';
import { selectAusInfo } from '@features/forms/rekyc-form/components/rekyc-personal-details/store/personal-details.selectors';
import {
  BoDetail,
  SaveBODetails,
  UploadFileProof,
  UploadFileProofResponse,
} from '@features/forms/rekyc-form/rekyc-form.model';
import { Store } from '@ngrx/store';
import { ToastService } from '@src/app/shared/ui/toast/toast.service';
import { HelperService } from './../../../../../../../core/services/helpers.service';

@Component({
  selector: 'rekyc-bo-fileupload',
  templateUrl: './rekyc-bo-fileupload.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RekycBoFileuploadComponent implements OnInit {
  identityProofList = [
    {
      id: 1,
      label: 'Driving License',
      value: 'drivingLicense',
    },
    {
      id: 2,
      label: 'Aadhaar',
      value: 'aadhaar',
    },
    {
      id: 3,
      label: 'Voter ID',
      value: 'voterId',
    },
    {
      id: 4,
      label: 'Pan',
      value: 'pan',
    },
  ];
  addressProofList = [
    {
      id: 1,
      label: 'Driving License',
      value: 'drivingLicense',
    },
    {
      id: 2,
      label: 'Aadhaar',
      value: 'aadhaar',
    },
    {
      id: 3,
      label: 'Voter ID',
      value: 'voterId',
    },
    {
      id: 4,
      label: 'Pan',
      value: 'Pan',
    },
  ];
  form = this.fb.group({
    boDetails: this.fb.array([]),
  });
  entityInfo = toSignal(this.store.select(selectEntityInfo));
  ausInfo = toSignal(this.store.select(selectAusInfo));
  isLoading = signal(false);
  ausDocsList = toSignal(this.store.select(selectBODetails));
  documentKeys = ['identityProof', 'addressProof', 'photograph', 'signature'];

  proofDoc = (doc: string) => doc === 'identityProof' || doc === 'addressProof';

  constructor(
    private fb: FormBuilder,
    private boService: RekycBoService,
    private toast: ToastService,
    private store: Store,
    private personalFormService: RekycPersonalFormService,
    private helperService: HelperService,
  ) {}

  ngOnInit() {
    this.form = this.fb.group({
      boDetails: this.fb.array([]),
    });
    // Add two initial BO entries
    this.createBOSetup();
    // this.createBOSetup();
  }

  get boDetails(): FormArray {
    return this.form.get('boDetails') as FormArray;
  }

  get boDetailsArray(): FormArray {
    return this.form.get('boDetails') as FormArray;
  }

  getDocumentArray(index: number): FormArray {
    return this.boDetailsArray.at(index) as FormArray;
  }

  trackByIndex(index: number): number {
    return index;
  }

  onProofDocChange(i: number, j: number, selectedType: string): void {
    const boDetailsArray = this.form.get('boDetails') as FormArray;
    const innerArray = boDetailsArray.at(i) as FormArray;
    const group = innerArray.at(j) as FormGroup;

    if (group) {
      group.get('file.selectedType')?.setValue(selectedType);
      group.get('file.selectedType')?.markAsTouched();
    }
  }

  onFileSelection(i: number, j: number, file: File): void {
    const boDetailsArray = this.form.get('boDetails') as FormArray;
    const innerArray = boDetailsArray.at(i) as FormArray;
    const group = innerArray.at(j) as FormGroup;

    if (group && file) {
      group.get('file.name')?.setValue(file.name);
      group.get('file.link')?.setValue(''); // set actual link if you have one
      group.get('file.name')?.markAsTouched();
    }
  }

  removeFile(i: number, j: number): void {
    const boDetailsArray = this.form.get('boDetails') as FormArray;
    const innerArray = boDetailsArray.at(i) as FormArray;
    const group = innerArray.at(j) as FormGroup;

    group.get('file.name')?.reset();
    group.get('file.link')?.reset();
  }

  trackBO(index: number) {
    return index;
  }

  // onFileSelection(index: number, controlName: string, file: File): void {
  //   if (!file) return;

  //   this.uploadFileProof(index, controlName, file);
  // }

  uploadFileProof(index: number, type: string, file: File): void {
    if (!file || !type) return;

    const boGroup = this.boDetails.at(index);
    const fileGroup = boGroup.get(`${type}.file`) as FormGroup;

    if (!fileGroup) {
      // eslint-disable-next-line no-console
      console.warn(`No form group found for type: ${type} at index: ${index}`);
      return;
    }

    const docType = type === 'addressProof' || type === 'identityProof' ? type : type.toUpperCase();

    const formData = new FormData();
    formData.append('entityId', this.entityInfo()?.entityId as string);
    formData.append('ausId', this.ausInfo()?.ausId as string);
    formData.append('file', file);
    formData.append('docType', docType);
    formData.append('selectedType', fileGroup.get('selectedType')?.value);

    fileGroup.patchValue({
      name: file.name,
    });

    this.personalFormService.uploadProofDocument(formData as unknown as UploadFileProof).subscribe({
      next: (result) => {
        const { loading, response } = result;
        fileGroup.get('isLoading')?.setValue(loading);

        if (!response) return;

        const { status } = response;
        const fileType = this.helperService.toTitleCase(type);

        if (status === ApiStatus.SUCCESS) {
          const { data } = response as { data: UploadFileProofResponse };
          fileGroup.get('name')?.setValue(data?.docName);
          fileGroup.get('link')?.setValue(data?.storedPath);
          this.toast.success(`${fileType} uploaded successfully`);
        } else {
          this.toast.error(`Invalid document for ${fileType}`);
        }
      },
    });
  }

  get isFormValid(): boolean {
    const formArray = this.form.get('boDetails') as FormArray;
    return (
      formArray && formArray.length > 0 && formArray.controls.every((control) => control.valid)
    );
  }

  trackDoc(_index: number) {
    return _index;
  }

  createBOSetup() {
    const ausDocsList = this.ausDocsList();

    if (!ausDocsList) {
      // eslint-disable-next-line no-console
      console.warn('ausDocsList is undefined');
      return;
    }

    // Initialize a new FormArray for boDetails if it doesn't exist
    if (!(this.form.get('boDetails') instanceof FormArray)) {
      this.form.setControl('boDetails', this.fb.array([]));
    }

    const boDetailsArray = this.form.get('boDetails') as FormArray;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const newDocumentSet: any[] = []; // Array to hold the form groups for one set of documents

    this.documentKeys.forEach((key) => {
      const doc = ausDocsList[key as keyof BODetails];

      if (!doc) {
        return; // Skip if document is undefined
      }

      const fileGroupConfig: Record<string, unknown> = {
        name: [doc?.file?.name],
        link: [doc?.file?.link],
      };

      // Add 'selectedType' for specific document types
      if (doc?.type === 'identityProof' || doc?.type === 'addressProof') {
        fileGroupConfig['selectedType'] = [doc?.file?.selectedType || ''];
      }

      // Create the document form group
      const docFormGroup = this.fb.group({
        label: [doc?.label],
        type: [doc?.type],
        isRequired: [doc?.isRequired],
        file: this.fb.group(fileGroupConfig),
      });

      // Push the document form group into the current set
      newDocumentSet.push(docFormGroup);
    });

    // Push the entire set of document form groups into the boDetails FormArray
    boDetailsArray.push(this.fb.array(newDocumentSet));
  }

  createBoDetail(): FormGroup {
    return this.fb.group({
      name: ['', Validators.required],
      addressLine: ['', Validators.required],
      city: ['', Validators.required],
      state: ['', Validators.required],
      country: ['', Validators.required],
      pincode: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],
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

  removeLastBoDetail() {
    if (this.boDetails.length > 0) {
      this.boDetails.removeAt(this.boDetails.length - 1);
    }
  }

  submit(action: 'save' | 'submit') {
    if (!this.isFormValid) return;

    if (action === 'submit') {
      const boList = this.form.value.boDetails as BoDetail[];

      const payload: SaveBODetails = {
        ausId: 'ebitaus-CUS1234567-09042025-AUS3',
        boList,
      };
      this.boService.saveBODetails(payload).subscribe({
        next: (result) => {
          const { loading, response } = result;
          this.isLoading.set(loading);

          if (!response) return;

          const { status } = response;

          if (status === ApiStatus.SUCCESS) {
            this.toast.success('Beneficairy Owners details saved successfully!');
          } else {
            this.toast.error(response.message || 'Something went wrong!');
          }
        },
      });
    }
  }
}
