import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-sheet',
  templateUrl: './sheet.component.html',
  styleUrls: ['./sheet.component.scss'],
})
export class SheetComponent {
  @Input() isOpen = false;
  @Input() showClose = false;
  @Input() class = '';
  @Input() contentClass = '';
  @Input() position: 'left' | 'right' = 'right';
  @Output() closeSheet = new EventEmitter<void>();

  close() {
    this.isOpen = false;
    this.closeSheet.emit();
  }
}
