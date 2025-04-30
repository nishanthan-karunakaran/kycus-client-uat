import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnInit,
  signal,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { ApiStatus } from '@core/constants/api.response';
import { ToastService } from '@src/app/shared/ui/toast/toast.service';
import { RekycKycFormService } from './rekyc-kyc-form.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { Store } from '@ngrx/store';
import { selectEntityInfo } from '../entity-filledby/store/entity-info.selectors';

@Component({
  selector: 'rekyc-kyc-form',
  templateUrl: './rekyc-kyc-form.component.html',
  styleUrls: ['./rekyc-kyc-form.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RekycKycFormComponent implements OnInit {
  @ViewChild('pdfViewer', { static: false }) pdfViewer!: ElementRef<HTMLIFrameElement>;
  readonly entityInfo = toSignal(this.store.select(selectEntityInfo));
  formData = signal({});
  private isDataSent = false; // Flag to track if data has been sent already

  constructor(
    private rekycKycFormService: RekycKycFormService,
    private toast: ToastService,
    private store: Store,
  ) {}

  ngOnInit(): void {
    this.fetchFormData();
  }

  getIframeHtml(): string | null {
    const iframe = this.pdfViewer.nativeElement;
    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    return doc?.documentElement.outerHTML ?? null;
  }

  sendFormDataToIframe() {
    // Send data only once during initialization
    if (this.isDataSent) return;

    const iframe = this.pdfViewer.nativeElement;
    const data = this.formData();

    // eslint-disable-next-line no-console
    console.log('data sent', data);
    if (iframe?.contentWindow && Object.keys(data).length > 0) {
      // eslint-disable-next-line no-console
      console.log('data sent', data);
      iframe.contentWindow.postMessage({ type: 'SET_FORM_DATA', payload: data }, '*');
      this.isDataSent = true; // Set flag to true after data is sent
    }
  }

  fetchFormData() {
    const entityId = this.entityInfo()?.entityId as string;

    this.rekycKycFormService.fetchFormData(entityId).subscribe({
      next: (result) => {
        const { response } = result;

        if (!response) return;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { status, data } = response as { status: ApiStatus; data: any };

        // eslint-disable-next-line no-console
        console.log('data is fetched');
        if (status === ApiStatus.SUCCESS) {
          const obj = { ...data };
          this.formData.set(obj);
          this.sendFormDataToIframe(); // Send data only once
        }
      },
    });
  }

  onSave() {
    const iframe = this.pdfViewer.nativeElement;

    const entityId = this.entityInfo()?.entityId as string;
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'SAVE_DATA' && event.data?.source === 'kyc-form') {
        this.formData.set(event.data.payload);

        // eslint-disable-next-line no-console
        console.log('saving data', this.formData());

        this.rekycKycFormService.savePDF(this.formData(), entityId).subscribe({
          next: (result) => {
            const { response } = result;

            if (!response) return;

            const { status } = response;

            if (status === ApiStatus.SUCCESS) {
              this.toast.success('Form saved!');
            }
          },
        });

        window.removeEventListener('message', handleMessage);
      }
    };

    window.addEventListener('message', handleMessage);

    iframe.contentWindow?.postMessage({ type: 'TRIGGER_SAVE' }, '*');
  }
}
