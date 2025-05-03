import { Component, Input, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ui-tooltip',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative inline-block" (mouseenter)="show = true" (mouseleave)="show = false">
      <ng-content></ng-content>

      <ng-container *ngIf="show">
        <div
          class="absolute z-50 whitespace-nowrap rounded bg-black px-2 py-1 text-xs text-white shadow"
          [ngClass]="positionClass"
        >
          <ng-container *ngIf="isTemplateRef(content); else plainText">
            <ng-container *ngTemplateOutlet="content"></ng-container>
          </ng-container>

          <ng-template #plainText>{{ content }}</ng-template>
        </div>

        <!-- Arrow -->
        <!-- <div class="absolute h-0 w-0" [ngClass]="arrowPositionClass"></div> -->
        <div class="absolute" [ngClass]="arrowClass"></div>
      </ng-container>
    </div>
  `,
})
export class TooltipComponent {
  @Input() content!: string | TemplateRef<unknown>;
  @Input() position: 'top' | 'bottom' | 'left' | 'right' = 'left';
  show = false;

  isTemplateRef(value: string | TemplateRef<unknown>): value is TemplateRef<unknown> {
    return value instanceof TemplateRef;
  }

  get positionClass(): string {
    switch (this.position) {
      case 'bottom':
        return 'top-full left-1/2 -translate-x-1/2 mt-2';
      case 'left':
        return 'right-full top-1/2 -translate-y-1/2 mr-2';
      case 'right':
        return 'left-full top-1/2 -translate-y-1/2 ml-2';
      case 'top':
      default:
        return 'bottom-full left-1/2 -translate-x-1/2 mb-2';
    }
  }

  get arrowPositionClass(): string {
    switch (this.position) {
      case 'bottom':
        return 'top-full left-1/2 -translate-x-1/2 border-[5px] border-transparent border-t-black';
      case 'left':
        return 'top-1/2 left-0 -translate-y-1/2 -translate-x-full border-[5px] border-transparent border-r-black';
      case 'right':
        return 'top-1/2 right-0 -translate-y-1/2 translate-x-full border-[5px] border-transparent border-l-black';
      case 'top':
      default:
        return 'bottom-full left-1/2 -translate-x-1/2 border-[5px] border-transparent border-b-black';
    }
  }

  private readonly _arrowClass =
    'bottom-[calc(100%-0rem)] left-1/2 -translate-x-1/2 border-x-4 border-x-transparent border-t-8 border-t-black';

  get arrowClass(): string {
    switch (this.position) {
      case 'top':
        return 'bottom-[calc(100%-0rem)] left-1/2 -translate-x-1/2 border-x-4 border-x-transparent border-t-8 border-t-danger';
      case 'left':
        return 'bottom-[calc(100%-0rem)] left-1/2 -translate-x-1/2 border-x-4 border-x-transparent border-t-8 border-t-success';
      case 'right':
        return 'bottom-[calc(100%-0rem)] left-1/2 -translate-x-1/2 border-x-4 border-x-transparent border-t-8 border-t-info';
      default:
        return 'bottom-[calc(100%-0rem)] left-1/2 -translate-x-1/2 border-x-4 border-x-transparent border-t-8 border-t-black';
    }
  }
}
