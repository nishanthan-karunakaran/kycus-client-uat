import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'rekyc-preview-entitydet',
  templateUrl: './preview-entitydet.component.html',
})
export class PreviewEntitydetComponent {
  @Input() openSheet = false;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @Input() data: any[] = [];
  @Output() closeSheet = new EventEmitter(false);

  handleReKycSheet() {
    this.closeSheet.emit(true);
  }

  trackDoc(_index: number, doc: string) {
    return doc;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  trackByKey(_index: number, item: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return item[0]; // the key
  }
}
