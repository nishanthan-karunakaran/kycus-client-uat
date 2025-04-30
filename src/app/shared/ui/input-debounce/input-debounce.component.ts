import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { InputFormat } from 'src/app/core/directives/input-format.directive';

@Component({
  selector: 'ui-input-debounce',
  template: `
    <ui-input
      [type]="type"
      [placeholder]="placeholder"
      [disabled]="disabled"
      [readonly]="readonly"
      [autofocus]="autofocus"
      [maxlength]="maxlength"
      [icon]="icon !== null ? icon : ''"
      [iconColor]="iconColor"
      [iconSize]="iconSize"
      (valueChange)="onInputChange($event)"
    ></ui-input>
  `,
})
export class InputDebounceComponent<T extends string | number | boolean> {
  @Input() type = 'text';
  @Input() id = '';
  @Input() name = '';
  @Input() label = '';
  @Input() placeholder = '';
  @Input() readonly = false;
  @Input() disabled = false;
  @Input() autofocus = false;
  @Input() required = false;
  @Input() maxlength?: number;
  @Input() max?: number;
  @Input() min?: number;
  @Input() pattern?: string | null = null;
  @Input() autocomplete?: 'on' | 'off' | null = 'on';
  @Input() errorMessage: string | null = null;
  @Input() icon: string | null = null;
  @Input() iconSize = 20;
  @Input() iconColor = '';
  @Input() iconPos: 'start' | 'end' = 'start';
  @Input() inputFormat: InputFormat = InputFormat.DEFAULT;
  @Input() class = '';
  @Input() debounceTime = 300;

  @Output() valueChange = new EventEmitter<T>();

  private inputSubject = new Subject<T>();

  constructor() {
    this.inputSubject
      .pipe(debounceTime(this.debounceTime), distinctUntilChanged())
      .subscribe((value) => this.valueChange.emit(value as T));
  }

  onInputChange(value: string | number | boolean) {
    this.inputSubject.next(value as T);
  }
}
