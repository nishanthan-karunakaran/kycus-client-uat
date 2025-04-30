import { ChangeDetectionStrategy, Component, DoCheck } from '@angular/core';

@Component({
  selector: 'app-rekyc',
  templateUrl: './rekyc.component.html',
  styleUrls: ['./rekyc.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RekycComponent implements DoCheck {
  ngDoCheck(): void {
    // eslint-disable-next-line no-console
    console.log('rendeing');
  }
}
