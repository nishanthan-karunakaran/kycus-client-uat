import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnInit,
  signal,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ApiStatus } from '@core/constants/api.response';
import { RekycService } from '@features/rekyc/rekyc.service';
import { Store } from '@ngrx/store';
import { ToastService } from '@src/app/shared/ui/toast/toast.service';
import { selectEntityInfo } from '../entity-filledby/store/entity-info.selectors';
import { RekycKycFormService } from './rekyc-kyc-form.service';
import { updateRekycFormStatus } from '@features/forms/rekyc-form/store/rekyc-form.action';
import { selectRekycFormStatus } from '@features/forms/rekyc-form/store/rekyc-form.selectors';

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
  isSaveBtnClicked = signal(false);
  isGettingReport = signal(false);
  isSubmitted = signal(false);
  isFetchingFormData = signal(false);
  formStatus = toSignal(this.store.select(selectRekycFormStatus));

  constructor(
    private rekycKycFormService: RekycKycFormService,
    private rekycService: RekycService,
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

    const sendMessage = () => {
      if (iframe?.contentWindow && Object.keys(data).length > 0) {
        iframe.contentWindow.postMessage({ type: 'SET_FORM_DATA', payload: data }, '*');
        this.isDataSent = true; // Set flag to true after data is sent
      }
    };

    // Wait for the iframe to load before sending the data
    if (iframe?.contentWindow?.document.readyState === 'complete') {
      sendMessage();
    } else {
      iframe.onload = () => {
        sendMessage();
      };
    }
  }

  fetchFormData() {
    const entityId = this.entityInfo()?.entityId as string;

    this.rekycKycFormService.fetchFormData(entityId).subscribe({
      next: (result) => {
        const { loading, response } = result;
        this.isFetchingFormData.set(loading);

        if (!response) return;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { status, data } = response as { status: ApiStatus; data: any };

        if (status === ApiStatus.SUCCESS) {
          const obj = { ...data };
          this.formData.set(obj);
          this.sendFormDataToIframe(); // Send data only once

          if (obj?.status === 'completed') {
            this.isSubmitted.set(true);
          }
        }
      },
    });
  }

  onSave(isSubmitting = false) {
    const iframe = this.pdfViewer.nativeElement;
    this.isSaveBtnClicked.set(true);

    const entityId = this.entityInfo()?.entityId as string;
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'SAVE_DATA' && event.data?.source === 'kyc-form') {
        let formData = event.data.payload;
        // if (isSubmitting) {
        formData = { ...formData, status: 'completed' };
        // }
        this.formData.set(formData);

        this.rekycKycFormService.savePDF(this.formData(), entityId).subscribe({
          next: (result) => {
            const { response } = result;

            if (!response) return;

            const { status } = response;

            if (status === ApiStatus.SUCCESS) {
              if (isSubmitting) {
                this.toast.success('Form submitted!');
              } else {
                this.store.dispatch(updateRekycFormStatus({ rekycForm: true }));
                this.toast.success('Form saved!');
              }
            }
          },
        });

        window.removeEventListener('message', handleMessage);
      }
    };

    window.addEventListener('message', handleMessage);

    iframe.contentWindow?.postMessage({ type: 'TRIGGER_SAVE' }, '*');
  }

  getReport() {
    const iframe = this.pdfViewer.nativeElement;

    if (iframe?.contentWindow) {
      iframe.contentWindow.postMessage({ type: 'CHECK_ALL_REQ_INPUT_FILLED' }, '*');
    }

    const handleMessage = (event: MessageEvent) => {
      if (
        event.data?.type === 'CHECK_ALL_REQ_INPUT_FILLED_RESPONSE' &&
        event.data?.source === 'kyc-form'
      ) {
        const isFilled = event.data.isFilled;

        if (isFilled) {
          this.rekycService.generateReport(this.entityInfo()?.entityId as string).subscribe({
            next: (result) => {
              const { loading, response } = result;
              this.isGettingReport.set(loading);
              if (!response) return;
              const { status } = response;
              if (status === ApiStatus.SUCCESS) {
                this.toast.success('Report successfully generated and sent to the Bank');
              } else {
                this.toast.error('Failed to generate report');
              }
            },
          });
        }

        window.removeEventListener('message', handleMessage);
      }
    };

    window.addEventListener('message', handleMessage);
    // return;
    // this.rekycKycFormService.getReport(this.entityInfo()?.entityId as string).subscribe({
    //   next: (result) => {
    //     const { loading, response } = result;
    //     this.isGettingReport.set(loading);

    //     if (response) {
    //       // eslint-disable-next-line @typescript-eslint/no-explicit-any
    //       const { status, data } = response as { status: ApiStatus; data: any };

    //       if (status === ApiStatus.SUCCESS) {
    //         const ausPending = data?.ausPending || [];

    //         if (ausPending.length > 0 || !data?.boPending || !data?.directorsPending) {
    //           this.toast.error(
    //             'Please complete all the previous steps and make sure all AUS are filled their details',
    //           );
    //         } else {
    //           this.rekycService.generateReport(this.entityInfo()?.entityId as string);
    //         }
    //       }
    //     }
    //   },
    // });
  }
}
