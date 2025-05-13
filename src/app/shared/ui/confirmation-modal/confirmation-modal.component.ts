import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
  ViewChild,
} from '@angular/core';
import { ButtonComponent } from '../button/button.component';
import { ModalComponent } from '../modal/modal.component';

@Component({
  selector: 'ui-confirmation-modal',
  standalone: true,
  templateUrl: './confirmation-modal.component.html',
  imports: [CommonModule, ModalComponent, ButtonComponent],
})
export class ConfirmationModalComponent implements AfterViewInit, OnDestroy {
  @Input() isOpen = false;
  @Input() headerText = 'Confirmation';
  @Input() contentText = 'Are you sure you want to proceed?';
  @Input() cancelText = 'Cancel';
  @Input() confirmText = 'Confirm';
  @Input() showClose = true;
  @Input() isCustomContent = false; // Flag to allow full DOM customization

  // eslint-disable-next-line @angular-eslint/no-output-native
  @Output() cancel = new EventEmitter<void>();
  @Output() confirm = new EventEmitter<void>();

  @ViewChild('confirmButton') confirmButton!: ElementRef<HTMLButtonElement>;
  @ViewChild('cancelButton') cancelButton!: ElementRef<HTMLButtonElement>;

  private focusListener!: (event: KeyboardEvent) => void;

  ngAfterViewInit(): void {
    if (this.isOpen) {
      this.focusConfirmButton();
      this.trapFocus();
    }
  }

  focusConfirmButton(): void {
    this.confirmButton?.nativeElement.focus();
  }

  trapFocus(): void {
    this.focusListener = (event: KeyboardEvent) => {
      const focusableElements = [this.confirmButton.nativeElement, this.cancelButton.nativeElement];
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.key === 'Tab') {
        if (event.shiftKey) {
          // Shift + Tab: Move focus backward
          if (document.activeElement === firstElement) {
            event.preventDefault();
            lastElement.focus();
          }
        } else {
          // Tab: Move focus forward
          if (document.activeElement === lastElement) {
            event.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    document.addEventListener('keydown', this.focusListener);
  }

  removeFocusTrap(): void {
    if (this.focusListener) {
      document.removeEventListener('keydown', this.focusListener);
    }
  }

  handleCancel() {
    this.cancel.emit();
  }

  handleConfirm() {
    this.confirm.emit();
  }

  ngOnDestroy(): void {
    this.removeFocusTrap();
  }
}
