import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'ui-circular-masked-loader',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ui-circular-masked-loader.component.html',
  styleUrls: ['./ui-circular-masked-loader.component.scss'],
})
export class UiCircularMaskedLoaderComponent {
  @Input() class = 'size-4';
}
