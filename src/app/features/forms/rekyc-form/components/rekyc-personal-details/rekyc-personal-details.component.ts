import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  effect,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ApiStatus } from '@core/constants/api.response';
import { HelperService } from '@core/services/helpers.service';
import {
  DeleteDocument,
  UploadFileProof,
  UploadFileProofErrorResponse,
  UploadFileProofResponse,
} from '@features/forms/rekyc-form/rekyc-form.model';
import { RekycFormService } from '@features/forms/rekyc-form/rekyc-form.service';
import { updateRekycFormStatus } from '@features/forms/rekyc-form/store/rekyc-form.action';
import { Store } from '@ngrx/store';
import { ToastService } from '@src/app/shared/ui/toast/toast.service';
import { Doc } from '../entity-details-form/store/entity-details.state';
import { selectEntityInfo } from '../entity-filledby/store/entity-info.selectors';
import { RekycPersonalFormService } from './rekyc-personal.service';
import { updatePartialPersonalDetails } from './store/personal-details.actions';
import { selectAusInfo, selectPersonalDetails } from './store/personal-details.selectors';
import { PersonalDetails } from './store/personal-details.state';

type FileType = 'identityProof' | 'addressProof' | 'photograph' | 'signature';

@Component({
  selector: 'rekyc-personal-details',
  templateUrl: './rekyc-personal-details.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RekycPersonalDetailsComponent implements OnInit, OnDestroy {
  form!: FormGroup;
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
      label: 'PAN',
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
      label: 'Passport  (Both Front & Back)',
      value: 'passport',
    },
    {
      id: 5,
      label: 'Electricity Bill (not more than 2 months old)',
      value: 'electricityBill',
    },
    {
      id: 6,
      label: 'Water Bill (not more than 2 months old)',
      value: 'waterBill',
    },
    {
      id: 7,
      label: 'Landline Bill (not more than 2 months old)',
      value: 'landlineBill',
    },
    {
      id: 8,
      label: 'Gas Bill (not more than 2 months old)',
      value: 'gasBill',
    },
  ];
  isFileLoading = signal({
    identityProof: false,
    addressProof: false,
    photograph: false,
    signature: false,
  });
  entityInfo = toSignal(this.store.select(selectEntityInfo));
  ausInfo = toSignal(this.store.select(selectAusInfo));
  personalDetails = toSignal(this.store.select(selectPersonalDetails));
  ausDocsList = toSignal(this.store.select(selectPersonalDetails));
  documentKeys = ['identityProof', 'addressProof', 'photograph', 'signature'];
  showPreviewSheet = signal(false);
  showESignSheet = signal(false);
  showPopup = signal(false);

  proofDoc = (doc: string) => doc === 'identityProof' || doc === 'addressProof';

  constructor(
    private fb: FormBuilder,
    private personalFormService: RekycPersonalFormService,
    private helperService: HelperService,
    private toast: ToastService,
    private store: Store,
    private rekycFormService: RekycFormService,
    private cdr: ChangeDetectorRef,
  ) {
    effect(() => {
      const updatedDocs = this.ausDocsList();
      if (updatedDocs) {
        this.patchFormWithDocs(updatedDocs);
      }
    });
  }

  ngOnInit(): void {
    this.getPersonalDetails();
    this.updateFormFields();
  }

  patchFormWithDocs(docs: PersonalDetails): void {
    if (!this.form) return;

    Object.entries(docs).forEach(([key, values]) => {
      const group = this.form.get(key) as FormGroup;
      if (!group) {
        // eslint-disable-next-line no-console
        console.warn(`No form group found for key: ${key}`);
        return;
      }

      const typeFromForm = group.get('type')?.value;
      if (typeFromForm !== key) {
        // eslint-disable-next-line no-console
        console.warn(`Skipping patch for ${key} due to type mismatch: ${typeFromForm}`);
        return;
      }

      const fileGroup = group.get('file') as FormGroup;
      if (!fileGroup) {
        // eslint-disable-next-line no-console
        console.warn(`No 'file' group found in ${key}`);
        return;
      }

      const filePatch: Partial<Doc> = {};

      if ('fileName' in values && values.fileName) {
        filePatch.name = values.fileName;
      }

      if ('url' in values && values.url) {
        filePatch.link = values.url;
      }

      if ('selectedType' in values && values.selectedType) {
        filePatch.selectedType = values.selectedType;
      }

      if (Object.keys(filePatch).length > 0) {
        fileGroup.patchValue(filePatch);
      }
    });

    this.cdr.markForCheck();
  }

  updateFormFields() {
    const group: Record<string, FormGroup> = {};
    const ausDocsList = this.ausDocsList();

    if (!ausDocsList) {
      // eslint-disable-next-line no-console
      console.warn('ausDocsList is undefined');
      return;
    }

    this.documentKeys.forEach((key) => {
      const doc = ausDocsList[key as keyof PersonalDetails];
      const fileGroupConfig: Record<string, unknown> = {
        name: [doc?.file?.name],
        link: [doc?.file?.link],
      };

      if (doc?.type === 'identityProof' || doc?.type === 'addressProof') {
        fileGroupConfig['selectedType'] = [doc?.file?.selectedType || ''];
      }

      group[key] = this.fb.group({
        label: [doc?.label],
        type: [doc?.type],
        isRequired: [doc?.isRequired],
        file: this.fb.group(fileGroupConfig),
      });
    });

    this.form = this.fb.group(group);
  }

  handlePopup() {
    this.showPopup.set(!this.showPopup());
  }

  handlePreviewSheet() {
    this.showPreviewSheet.set(!this.showPreviewSheet());
  }

  handleESignSheet() {
    this.showESignSheet.set(!this.showESignSheet());
  }

  trackDoc(_index: number) {
    return _index;
  }

  get isFormValid(): boolean {
    return Object.keys(this.form.value).every((key) => {
      const link = this.form.get(`${key}.file.name`)?.value;
      return !!link;
    });
  }

  getDocAcceptedType(doc: string) {
    if (doc === 'photograph' || doc === 'signature') {
      return '.png,.jpg';
    }
    return '.jpg,.png,.pdf';
  }

  isFileLoadingType(doc: string): boolean {
    const type = doc as FileType;
    return this.isFileLoading()[type];
  }

  updateErrorMessages() {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    Object.entries(this.form.controls).forEach(([key, control]) => {
      if (control instanceof FormGroup) {
        const isRequired = control.get('isRequired')?.value;
        const nameControl = control.get('file.name');

        if (isRequired && !nameControl?.value) {
          nameControl?.setErrors({ required: true });
        } else {
          nameControl?.setErrors(null);
        }
      }
    });
  }

  getFileControl(doc: string, control: 'name' | 'link') {
    return this.form.get(`${doc}.file.${control}`);
  }

  onProofDocChange(doc: string, value: string) {
    this.form.get(`${doc}.file.selectedType`)?.setValue(value);
    // this.removeFile(doc);
  }

  onFileSelection(controlName: string, file: File): void {
    if (!file) return;

    this.uploadFileProof(controlName, file);
  }

  removeFile(controlName: string): void {
    const fileGroup = this.form.get(`${controlName}.file`) as FormGroup;
    if (!fileGroup) {
      // eslint-disable-next-line no-console
      console.warn(`No form group found for type: ${controlName}`);
      return;
    }

    fileGroup.patchValue({
      name: '',
      link: '',
    });
  }

  // this is for deleting the doc on db
  deleteDocument(doc: string): void {
    const payload: DeleteDocument = {
      entityId: this.entityInfo()?.entityId as string,
      ausId: this.ausInfo()?.ausId as string,
      docType: doc,
    };

    this.rekycFormService.deleteDocument(payload).subscribe({
      next: (result) => {
        const { loading, response } = result;

        if (!loading && response) {
          const { status } = response;

          if (status === ApiStatus.SUCCESS) {
            this.toast.success(`${this.helperService.toTitleCase(doc)} deleted`);
            const fileGroup = this.form.get(`${doc}.file`) as FormGroup;
            fileGroup.patchValue({
              name: '',
              link: '',
            });
            fileGroup.patchValue({ name: '', link: '' });
            this.cdr.markForCheck();
          }
        }
      },
    });
  }

  setIsFileLoading(key: FileType, value: boolean) {
    const obj = this.isFileLoading();
    obj[key] = value;
    this.isFileLoading.set(obj);
  }

  uploadFileProof(type: string, file: File): void {
    if (!file || !type) return;

    const fileGroup = this.form.get(`${type}.file`) as FormGroup;

    if (!fileGroup) {
      // eslint-disable-next-line no-console
      console.warn(`No form group found for type: ${type}`);
      return;
    }

    const docType = type === 'addressProof' || type === 'identityProof' ? type : type;

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
          const { error } = response as { error: UploadFileProofErrorResponse };
          const errMsg = error.reason
            ? `${this.helperService.toTitleCase(fileType)}: ${error.reason}`
            : `Invalid document for ${fileType}`;
          this.toast.error(errMsg, { duration: 5000 });
        }
      },
    });
  }

  submit(action: 'submit' | 'save' = 'submit'): void {
    if (action === 'submit') {
      this.form.markAllAsTouched();
      this.updateErrorMessages();

      if (!this.isFormValid) {
        // eslint-disable-next-line no-console
        console.warn('Form is not valid');
        return;
      }

      this.toast.success('Form sumitted successfully!');
      this.store.dispatch(updateRekycFormStatus({ ausDetails: true }));
      // this.rekycFormService.updatRekycFormStep('personal-details');
      const entityFilledBy = this.entityInfo()?.entityFilledBy;
      // const entityFilledByOthers = entityFilledBy && entityFilledBy.toLowerCase().includes('other');
      const entityFilledBySameLoggedInUser =
        entityFilledBy && entityFilledBy === this.ausInfo()?.ausId;

      if (!entityFilledBySameLoggedInUser) {
        this.handlePopup();
      }
      // if (entityFilledByOthers || entityFilledBySameLoggedInUser) {
      this.rekycFormService.updatRekycFormStep('personal-details');
      // }
    } else {
      this.toast.info('Form saved successfully!');
    }
  }

  getPersonalDetails() {
    const entityId = this.entityInfo()?.entityId as string;
    const ausId = this.ausInfo()?.ausId as string;
    this.personalFormService.getPersonalDetails(entityId, ausId).subscribe({
      next: (result) => {
        const { response } = result;

        if (!response) return;

        const { status } = response;

        if (status === ApiStatus.SUCCESS) {
          const { data } = response as { status: string; data: { documents: PersonalDetails } };

          this.store.dispatch(updatePartialPersonalDetails({ partialData: data.documents }));
        }
      },
    });
  }

  ngOnDestroy(): void {
    this.store.dispatch(updatePartialPersonalDetails({ partialData: this.form.value }));
  }
}
