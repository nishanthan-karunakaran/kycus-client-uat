import { updateReKycApplications } from 'src/app/features/rekyc/store/rekyc.actions';
import {
  Component,
  computed,
  EventEmitter,
  Input,
  Output,
  signal,
  ChangeDetectionStrategy,
} from '@angular/core';
import { Store } from '@ngrx/store';
import { ApiStatus } from 'src/app/core/constants/api.response';
import {
  RekycData,
  SubmitReKycApplicationResponse,
  SubmitReKycExcel,
  UploadReKycExcel,
} from 'src/app/features/rekyc/rekyc.model';
import { RekycService } from 'src/app/features/rekyc/rekyc.service';
import { ToastService } from 'src/app/shared/ui/toast/toast.service';
import { API_URL } from '@core/constants/apiurls';

@Component({
  selector: 'app-filemodal',
  templateUrl: './filemodal.component.html',
  styleUrls: ['./filemodal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FilemodalComponent {
  @Input() isModalOpen = false;
  @Output() closeModal = new EventEmitter<boolean>();

  file: File | null = null;
  isOpenFilePreview = signal(false);
  isDataFetching = signal(false);
  isDataSubmitting = signal(false);
  rekycData = signal<RekycData[]>([]);
  duplicateRekycData: RekycData[] = [];
  activePage = signal(1);
  isDragging = signal(false);
  excelTemplate = `https://kycusuat.ebitaus.com${API_URL.REKYC.EXCEL_TEMPLATE}`;

  constructor(
    private toastService: ToastService,
    private rekycService: RekycService,
    private store: Store,
  ) {}

  handleModal() {
    this.closeModal.emit(false);
  }

  handlePreviewModal() {
    this.isOpenFilePreview.set(false);
    this.closeModal.emit(false);
  }

  handleFile(event: Event | DragEvent) {
    if (event instanceof Event && (event.target as HTMLInputElement)?.files) {
      this.file = (event.target as HTMLInputElement).files?.[0] ?? null;
    } else if (event instanceof DragEvent && event.dataTransfer) {
      this.file = event.dataTransfer.files?.[0] ?? null;
    }

    if (this.file) {
      if (this.file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
        if (this.file.size >= 20 * 1024 * 1024) {
          this.toastService.error('File size must be less than 20MB');
          return;
        }

        this.fileUpload();
      } else {
        this.toastService.error('Please select a valid Excel file.');
      }
    } else {
      this.toastService.error('Please select a valid Excel file.');
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragging.set(true);
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragging.set(false);
    this.handleFile(event);
  }

  onDragLeave() {
    this.isDragging.set(false);
  }

  fileUpload() {
    const formData = new FormData();
    formData.append('file', this.file as Blob);
    formData.append('mode', 'preview');

    this.isOpenFilePreview.set(true);

    this.rekycService.uploadExcel(formData as unknown as UploadReKycExcel).subscribe({
      next: (result) => {
        const { loading, response } = result;
        this.isDataFetching.set(loading);

        if (!response) return;

        const { status } = response;

        if (status === ApiStatus.SUCCESS) {
          const { data } = response;
          const { uniqueRows, duplicateRows } = data as {
            uniqueRows: RekycData[];
            duplicateRows: RekycData[];
          };
          this.rekycData.set(uniqueRows);
          this.duplicateRekycData = duplicateRows as RekycData[];

          if (duplicateRows.length > 0) {
            this.toastService.warning('Duplicate data found');
          }
        } else {
          this.handlePreviewModal();
          this.toastService.error('Failed to parse the data');
        }
      },
    });
  }

  submitReKycExcel() {
    const payload: SubmitReKycExcel = {
      mode: 'submit',
      uploadedBy: localStorage.getItem('authEmail') as string,
      bankName: 'HDFC Bank',
      data: this.rekycData(),
    };

    this.rekycService.submitExcel(payload).subscribe({
      next: (result) => {
        const { loading, response } = result;
        this.isDataSubmitting.set(loading);

        if (!response) return;

        const { status, data } = response;

        if (status === ApiStatus.SUCCESS) {
          const { data: results } = data as SubmitReKycApplicationResponse;
          this.store.dispatch(updateReKycApplications({ applications: results }));
          this.toastService.success('Data submitted successfully');
          this.handlePreviewModal();
        } else {
          this.toastService.error('Failed to submit the data');
        }
      },
    });
  }

  filteredData = computed(() => {
    return [
      ...this.rekycData().map((e) => ({ ...e, isDuplicate: false })),
      ...this.duplicateRekycData.map((e) => ({ ...e, isDuplicate: true })),
    ];
  });

  setActivePage(page: number): void {
    this.activePage.set(page);
  }

  trackRow(_: number, rekycDataRekycData: RekycData): number {
    return rekycDataRekycData.id;
  }

  trackAus(index: number): number {
    return index;
  }

  downloadSampleExcel() {
    const link = document.createElement('a');
    link.href = this.excelTemplate;
    link.download = 'SampleTemplate.xlsx';
    link.click();
  }
}
