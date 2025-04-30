import { Directive, ElementRef, HostListener, Input } from '@angular/core';
import { NgControl } from '@angular/forms';

export enum InputFormat {
  UPPERCASE = 'uppercase',
  LOWERCASE = 'lowercase',
  CAPITALIZE = 'capitalize',
  NUMBERS = 'numbers',
  DEFAULT = '',
}

@Directive({
  selector: '[inputFormat]',
  standalone: true,
})
export class InputFormatDirective {
  @Input('inputFormat') format: InputFormat = InputFormat.DEFAULT;

  constructor(
    private el: ElementRef,
    private control: NgControl,
  ) {}

  @HostListener('input', ['$event'])
  onInput(event: Event) {
    const input = event.target as HTMLInputElement;
    let transformedValue = input.value;

    switch (this.format) {
      case 'uppercase':
        transformedValue = transformedValue.toUpperCase();
        break;
      case 'lowercase':
        transformedValue = transformedValue.toLowerCase();
        break;
      case 'capitalize':
        transformedValue = this.capitalizeWords(transformedValue);
        break;
      case 'numbers':
        transformedValue = transformedValue.replace(/\D/g, ''); // Remove non-numeric characters
        break;
      default:
        break;
    }

    // Update form control without triggering unnecessary change events
    this.control.control?.setValue(transformedValue, { emitEvent: false });
  }

  private capitalizeWords(value: string): string {
    return value.replace(/\b\w/g, (char) => char.toUpperCase());
  }
}
