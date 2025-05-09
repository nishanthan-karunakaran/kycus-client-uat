import { ChangeDetectionStrategy, Component, OnInit, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { ApiStatus } from '@core/constants/api.response';
import { selectEntityInfo } from '@features/forms/rekyc-form/components/entity-filledby/store/entity-info.selectors';
import { RekycBoService } from '@features/forms/rekyc-form/components/rekyc-bo-form/rekyc-bo.service';
import { selectBODetails } from '@features/forms/rekyc-form/components/rekyc-bo-form/store/rekyc-bo.selectors';
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
      label: 'Aadhaar (Both Front & Back)',
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
    {
      id: 5,
      label: 'Passport (Both Front & Back)',
      value: 'passport',
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
      label: 'Aadhaar (Both Front & Back)',
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
    {
      id: 5,
      label: 'Passport (Both Front & Back)',
      value: 'passport',
    },
  ];
  form = this.fb.group({
    boDetails: this.fb.array([]),
  });
  entityInfo = toSignal(this.store.select(selectEntityInfo));
  ausInfo = toSignal(this.store.select(selectAusInfo));
  isLoading = signal(false);
  ausDocsList = toSignal(this.store.select(selectBODetails));
  documentKeys = ['identityProof', 'addressProof'];

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

    for (let i = 0; i < 2; i++) {
      this.addBoDetail();
    }
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

  // onProofDocChange(i: number, j: number, selectedType: string): void {
  //   const boDetailsArray = this.form.get('boDetails') as FormArray;
  //   const innerArray = boDetailsArray.at(i) as FormArray;
  //   const group = innerArray.at(j) as FormGroup;

  //   if (group) {
  //     group.get('file.selectedType')?.setValue(selectedType);
  //     group.get('file.selectedType')?.markAsTouched();
  //   }
  // }

  // onFileSelection(i: number, j: number, file: File): void {
  //   const boDetailsArray = this.form.get('boDetails') as FormArray;
  //   const innerArray = boDetailsArray.at(i) as FormArray;
  //   const group = innerArray.at(j) as FormGroup;

  //   if (group && file) {
  //     group.get('file.name')?.setValue(file.name);
  //     group.get('file.link')?.setValue(''); // set actual link if you have one
  //     group.get('file.name')?.markAsTouched();
  //   }
  // }

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

  addBoDetail() {
    this.boDetails.push(this.getBaseDocumentGroup());
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

  getBaseDocumentGroup(): FormGroup {
    return this.fb.group({
      identityProof: this.fb.group({
        label: ['Select Proof of Identity'],
        type: ['identityProof'],
        isRequired: [true],
        file: this.fb.group({
          name: [''],
          link: [''],
          selectedType: ['pan'],
        }),
      }),
      addressProof: this.fb.group({
        label: ['Select Proof of Address'],
        type: ['addressProof'],
        isRequired: [true],
        file: this.fb.group({
          name: [''],
          link: [''],
          selectedType: ['aadhaar'],
        }),
      }),
      // photograph: this.fb.group({
      //   label: ['Upload Photograph'],
      //   type: ['photograph'],
      //   isRequired: [true],
      //   file: this.fb.group({
      //     name: [''],
      //     link: [''],
      //   }),
      // }),
      // signature: this.fb.group({
      //   label: ['Upload Signature'],
      //   type: ['signature'],
      //   isRequired: [true],
      //   file: this.fb.group({
      //     name: [''],
      //     link: [''],
      //   }),
      // }),
    });
  }

  removePerson(index: number): void {
    const persons = this.boDetailsArray;
    if (persons.length > 2 && index >= 0 && index < persons.length) {
      persons.removeAt(index);
    }
  }

  onProofDocChange(personIndex: number, docType: string, selected: string) {
    const control = this.boDetailsArray.at(personIndex).get([docType, 'file', 'selectedType']);
    control?.setValue(selected);
  }

  // onFileSelection(personIndex: number, docType: string, fileData: any) {
  //   // const fileGroup = this.boDetailsArray.at(personIndex).get([docType, 'file']);
  //   // fileGroup?.patchValue({ name: fileData.name, link: fileData.link });
  //   uploadFileProof;
  // }

  onFileSelection(index: number, controlName: string, file: File): void {
    if (!file) return;

    this.uploadFileProof(index, controlName, file);
  }

  deleteDocument(personIndex: number, docType: string) {
    const fileGroup = this.boDetailsArray.at(personIndex).get([docType, 'file']);
    fileGroup?.patchValue({ name: '', link: '' });
  }
}
