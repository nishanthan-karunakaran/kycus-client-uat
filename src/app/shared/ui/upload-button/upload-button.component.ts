import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
} from '@angular/core';

@Component({
  selector: 'ui-upload-button',
  template: `
    <button
      type="button"
      class="flex items-center gap-1 border-2 border-dashed border-info bg-transparent px-3 py-2 text-xs focus:ring-0"
      [ngClass]="btnClass"
      (click)="fileInput.click()"
      [disabled]="disabled || loading"
    >
      <ng-container *ngIf="!loading">
        <lucide-icon name="cloud-upload" color="#2A4BD0" size="16" />
        <span class="text-info">{{ label }}</span>
      </ng-container>
      <div *ngIf="loading" class="loader"></div>
    </button>
    <input #fileInput type="file" hidden (change)="handleChange($event)" [accept]="accept" />
  `,
  styles: [
    `
      .loader {
        @apply relative flex w-14 items-center justify-center px-3 py-2 text-transparent;
      }

      .loader::before {
        content: '';
        @apply absolute h-5 w-5 animate-spin rounded-full border-[3px] border-secondaryBlue border-t-transparent;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UploadButtonComponent implements OnChanges {
  @Input() label = 'Upload';
  @Input() accept = '.xlsx';
  @Input() class = '';
  @Input() ngClass = {};
  @Input() disabled = false;
  @Input() loading = false;
  @Output() selectedFile = new EventEmitter<File>();

  btnClass = {};

  // loader: this.loading,
  ngOnChanges() {
    this.btnClass = {
      [this.class]: !!this.class,
      ...this.ngClass,
    };
  }

  handleChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input?.files?.[0]) {
      this.selectedFile.emit(input.files[0]);
    }
  }
}
