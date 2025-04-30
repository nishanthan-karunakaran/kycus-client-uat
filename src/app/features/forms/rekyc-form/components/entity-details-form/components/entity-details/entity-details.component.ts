import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DoCheck,
  effect,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ApiStatus } from '@core/constants/api.response';
import { updatePartialEntityDetails } from '@features/forms/rekyc-form/components/entity-details-form/store/entity-details.actions';
import { selectEntityDetails } from '@features/forms/rekyc-form/components/entity-details-form/store/entity-details.selectors';
import {
  Doc,
  EntityDetails,
} from '@features/forms/rekyc-form/components/entity-details-form/store/entity-details.state';
import { initialEntityInfoState } from '@features/forms/rekyc-form/components/entity-filledby/store/entity-info.reducer';
import { selectEntityInfo } from '@features/forms/rekyc-form/components/entity-filledby/store/entity-info.selectors';
import { initialAusInfoState } from '@features/forms/rekyc-form/components/rekyc-personal-details/store/personal-details.reducer';
import { selectAusInfo } from '@features/forms/rekyc-form/components/rekyc-personal-details/store/personal-details.selectors';
import {
  DeleteDocument,
  EntityDetailsFileType,
  UploadFileProof,
  UploadFileProofResponse,
} from '@features/forms/rekyc-form/rekyc-form.model';
import { RekycFormService } from '@features/forms/rekyc-form/rekyc-form.service';
import { updateRekycStepStatus } from '@features/forms/rekyc-form/store/rekyc-form.action';
import { Store } from '@ngrx/store';
import { ToastService } from '@src/app/shared/ui/toast/toast.service';
import { HelperService } from 'src/app/core/services/helpers.service';
import { EntityDetailsService } from './entity-details.service';
import { GetEntityResponse } from '@features/forms/rekyc-form/components/entity-details-form/entity-details-form.model';

@Component({
  selector: 'rekyc-entity-details',
  templateUrl: './entity-details.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EntityDetailsComponent implements OnInit, DoCheck, OnDestroy {
  @Output() formNavigation = new EventEmitter<string>();
  form!: FormGroup;
  entityAddressProofList = [
    {
      id: 1,
      label: 'Shop and Establishment Certificate',
      value: 'shopAndEstablishment',
    },
    {
      id: 2,
      label: 'Udyam (MSME) Registration Certificate',
      value: 'udyam',
    },
    {
      id: 3,
      label: 'Lease/Rental Agreement (in Entity Name)',
      value: 'leaseRentalAgreement',
    },
    {
      id: 4,
      label: 'Electricity Bill (not more than 2 months old)',
      value: 'electricityBill',
    },
    {
      id: 5,
      label: 'Water Bill (not more than 2 months old)',
      value: 'waterBill',
    },
    {
      id: 6,
      label: 'Landline Bill (not more than 2 months old)',
      value: 'landlineBill',
    },
    {
      id: 7,
      label: 'Internet Bill (not more than 2 months old)',
      value: 'internetBill',
    },
  ];
  isFileLoading = signal({
    pan: false,
    gstin: false,
    addressProof: false,
    coi: false,
    moa: false,
    aoa: false,
  });
  entityDetails = toSignal(this.store.select(selectEntityDetails));
  readonly entityInfo = toSignal(this.store.select(selectEntityInfo), {
    initialValue: initialEntityInfoState,
  });
  readonly ausInfo = toSignal(this.store.select(selectAusInfo), {
    initialValue: initialAusInfoState,
  });
  documentKeys = Object.keys(this.entityDetails);
  showPreviewSheet = signal(false);
  previewData = signal([]);

  constructor(
    private fb: FormBuilder,
    private entityDetailService: EntityDetailsService,
    private rekycFormService: RekycFormService,
    private helperService: HelperService,
    private toast: ToastService,
    private store: Store,
    private cdr: ChangeDetectorRef,
  ) {
    effect(() => {
      const updatedDocs = this.entityDetails();
      if (updatedDocs) {
        this.patchFormWithDocs(updatedDocs);
      }
    });
  }

  ngOnInit(): void {
    this.updateFormFields();
    this.getEntityDetails();
  }

  ngDoCheck(): void {
    // eslint-disable-next-line no-console
    console.log('Entity details form rendeing');
  }

  patchFormWithDocs(docs: EntityDetails): void {
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
        console.log(`Skipping patch for ${key} due to type mismatch: ${typeFromForm}`);
        return;
      }

      const fileGroup = group.get('file') as FormGroup;
      if (!fileGroup) {
        // eslint-disable-next-line no-console
        console.warn(`No 'file' group found in ${key}`);
        return;
      }

      const filePatch: Partial<Doc> = {};

      // Check if the file object exists and then patch the name, link, and selectedType
      if (values.file) {
        const { name, link, selectedType } = values.file;

        // Patch name, link, and selectedType only if available
        if (name !== undefined) filePatch.name = name; // Check values.file.name
        if (link !== undefined) filePatch.link = link;
        if (selectedType !== undefined) filePatch.selectedType = selectedType;
      }

      if (Object.keys(filePatch).length > 0) {
        fileGroup.patchValue(filePatch);
      }
    });

    this.cdr.markForCheck();
  }

  updateFormFields() {
    const group: Record<string, FormGroup> = {};
    const entityDetails = this.entityDetails();

    if (!entityDetails) {
      // eslint-disable-next-line no-console
      console.error('Entity details are not available.');
      return;
    }

    this.documentKeys = Object.keys(entityDetails);

    this.documentKeys.forEach((key) => {
      const doc = entityDetails[key as keyof EntityDetails];

      group[key] = this.fb.group({
        label: [doc?.label],
        type: [doc?.type],
        isRequired: [doc?.isRequired],
        file: this.fb.group({
          name: [doc?.file?.name],
          link: [doc?.file?.link],
          selectedType: [doc?.file?.selectedType ?? ''],
        }),
      });
    });

    this.form = this.fb.group(group);
  }

  handlePreviewSheet() {
    this.showPreviewSheet.set(!this.showPreviewSheet());
    this.previewEntityDetails();
  }

  trackDoc(_index: number, doc: string): string {
    return doc;
  }

  get documents(): FormArray {
    return this.form.get('documents') as FormArray;
  }

  get addressProofTypeControl(): FormControl<string> {
    return this.form.get('addressProof.type') as FormControl<string>;
  }

  isFileLoadingType(doc: string): boolean {
    const type = doc as EntityDetailsFileType;
    return this.isFileLoading()[type];
  }

  setIsFileLoading(key: EntityDetailsFileType, value: boolean) {
    const obj = this.isFileLoading();
    obj[key] = value;
    this.isFileLoading.set(obj);
  }

  get isFormValid(): boolean {
    return this.documentKeys.every((key) => {
      const isRequired = this.form.get(`${key}.isRequired`)?.value;
      const name = this.form.get(`${key}.file.name`)?.value;
      return !isRequired || !!name;
    });
  }

  getErrorMessage(controlName: EntityDetailsFileType): string {
    const controlGroup = this.form.get(controlName) as FormGroup;

    if (!controlGroup) return '';

    const isRequired = controlGroup.get('isRequired')?.value;
    const nameControl = controlGroup.get('file.name');

    if (isRequired && !nameControl?.value) {
      nameControl?.setErrors({ required: true });
      return 'This document is required';
    }

    return '';
  }

  updateErrorMessages(): void {
    Object.values(this.form.controls).forEach((control) => {
      if (control instanceof FormGroup) {
        const isRequired = control.get('isRequired')?.value;
        const nameControl = control.get(['file', 'name']);

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

  onAddressProofChange(value: string): void {
    this.form.get(['addressProof', 'file', 'selectedType'])?.setValue(value);
  }

  onFileSelection(doc: string, file: File): void {
    const controlName = doc as EntityDetailsFileType;

    if (!file) return;

    this.uploadFileProof(controlName, file);
  }

  // this is for deleting the doc on db
  deleteDocument(doc: string): void {
    const payload: DeleteDocument = {
      entityId: this.entityInfo()?.entityId as string,
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

  uploadFileProof(type: EntityDetailsFileType, file: File): void {
    if (!file || !type) return;

    const fileGroup = this.form.get(`${type}.file`) as FormGroup;
    if (!fileGroup) {
      // eslint-disable-next-line no-console
      console.warn(`No form group found for type: ${type}`);
      return;
    }

    // const docType = type === 'addressProof' ? this.form.value.addressProof.file.selectedType : type;

    const formData = new FormData();
    formData.append('entityId', this.entityInfo()?.entityId);
    formData.append('file', file);
    formData.append('docType', type);
    formData.append('selectedType', fileGroup.get('selectedType')?.value);

    fileGroup.patchValue({
      name: file.name,
    });

    this.entityDetailService.uploadFileProof(formData as unknown as UploadFileProof).subscribe({
      next: (result) => {
        const { loading, response } = result;
        fileGroup.get('isLoading')?.setValue(loading);
        // this.setIsFileLoading(type, loading);

        if (!response) return;

        const { status } = response;

        // const entityDetailsFileTypeEntityDetailsFileType =
        //   type !== 'addressProof' ? type.toUpperCase() : this.helperService.toTitleCase(type);

        if (status === ApiStatus.SUCCESS) {
          const { data } = response as { data: UploadFileProofResponse };
          fileGroup.get('name')?.setValue(data?.docName);
          fileGroup.get('link')?.setValue(data?.storedPath);
          this.cdr.markForCheck();
          // this.toast.success(`${entityDetailsFileTypeEntityDetailsFileType} uploaded successfully`);
        } else {
          // this.toast.error(`Invalid document for ${entityDetailsFileTypeEntityDetailsFileType}`);
          // this.removeFile(type);
        }
      },
    });
  }

  removeFile(doc: string): void {
    const type = doc as EntityDetailsFileType;
    const fileGroup = this.form.get(`${type}.file`) as FormGroup;
    if (!fileGroup) {
      // eslint-disable-next-line no-console
      console.warn(`No form group found for type: ${type}`);
      return;
    }

    fileGroup.get('name')?.setValue('');
    fileGroup.get('link')?.setValue('');
    this.setIsFileLoading(type, false);
  }

  submit(action: 'submit' | 'save' = 'submit'): void {
    if (action === 'submit') {
      this.form.markAllAsTouched();
      this.updateErrorMessages();
      if (!this.isFormValid) {
        // this.toast.error('Something went wrong!');

        // eslint-disable-next-line no-console
        console.warn('Form is not valid');
        return;
      }

      this.toast.success('Entity Details submitted!');
      this.formNavigation.emit('next');
      this.store.dispatch(updateRekycStepStatus({ entityDocs: true }));
      this.rekycFormService.updatRekycFormStep('entity-details');
    } else {
      this.toast.info('Form saved successfully!');
    }
  }

  getEntityDetails() {
    const entityDetails = this.entityDetails();

    if (!entityDetails) return;

    const entityId = this.entityInfo()?.entityId as string;
    this.entityDetailService.getEntityDetails(entityId).subscribe({
      next: (result) => {
        const { response } = result;
        if (!response) return;

        const { status } = response;
        if (status === ApiStatus.SUCCESS) {
          const { data } = response as GetEntityResponse;

          if (!data || !data.documents) {
            // eslint-disable-next-line no-console
            console.warn('Documents data is missing or undefined');
            return;
          }

          // Proceed with transformation and dispatching the data
          const updatedEntityDetails = this.entityDetailService.transformToEntityDetails(
            data.documents,
            entityDetails,
          );

          this.store.dispatch(updatePartialEntityDetails({ partialData: updatedEntityDetails }));
        }
      },
    });
  }

  previewEntityDetails() {
    const entityId = this.entityInfo()?.entityId as string;

    this.entityDetailService.previewEntityDetails(entityId).subscribe({
      next: (result) => {
        const { response } = result;

        if (!response) return;

        const { status } = response;

        if (status === ApiStatus.SUCCESS) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const { data } = response as any;

          const customOrder = ['pan', 'gstin', 'addressProof', 'coi', 'moa', 'aoa'];

          interface PreviewDoc {
            docType: string;
          }

          // Sort the documents array
          const sortedDocuments = data.sort((a: PreviewDoc, b: PreviewDoc) => {
            return customOrder.indexOf(a.docType) - customOrder.indexOf(b.docType);
          });

          this.previewData.set(sortedDocuments);

          // this.previewData.set(data);
        }
      },
    });
  }

  ngOnDestroy(): void {
    this.store.dispatch(updatePartialEntityDetails({ partialData: this.form.value }));
  }
}
