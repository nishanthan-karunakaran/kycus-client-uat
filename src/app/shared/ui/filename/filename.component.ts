import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'ui-filename',
  templateUrl: './filename.component.html',
})
export class FilenameComponent {
  @Input() fileName = '';
  @Input() fileLink: string | null = null;
  @Input() canRemove = true;
  @Output() removeFile = new EventEmitter<boolean>();

  openFileInNewTab(): void {
    if (this.fileLink) {
      window.open(this.fileLink, '_blank');
    }
  }

  deleteFile(): void {
    if (this.canRemove) {
      this.removeFile.emit(true);
    }
  }
}
