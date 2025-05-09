import { HelperService } from '@core/services/helpers.service';
import { Component, EventEmitter, Input, OnChanges, Output, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ApiStatus } from '@core/constants/api.response';
import { Store } from '@ngrx/store';
import { RekycPersonalFormService } from '@features/forms/rekyc-form/components/rekyc-personal-details/rekyc-personal.service';
import { selectAusInfo } from '@features/forms/rekyc-form/components/rekyc-personal-details/store/personal-details.selectors';
import { selectEntityInfo } from '@features/forms/rekyc-form/components/entity-filledby/store/entity-info.selectors';

@Component({
  selector: 'rekyc-preview-personaldet',
  templateUrl: './preview-pesonaldet.component.html',
})
export class PreviewPersonaldetComponent implements OnChanges {
  @Input() openSheet = false;
  @Output() closeSheet = new EventEmitter(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data = signal<any[]>([]);
  entityInfo = toSignal(this.store.select(selectEntityInfo));
  ausInfo = toSignal(this.store.select(selectAusInfo));
  isLoading = signal(true);

  constructor(
    private store: Store,
    private personalFormService: RekycPersonalFormService,
    public helperService: HelperService,
  ) {}

  ngOnChanges() {
    if (this.openSheet) {
      this.fetchPreviewAusDetails();
    }
  }

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

  fetchPreviewAusDetails() {
    const entityId = this.entityInfo()?.entityId as string;
    const ausId = this.ausInfo()?.ausId as string;

    this.personalFormService.previewAusDetails(entityId, ausId).subscribe({
      next: (result) => {
        const { loading, response } = result;
        this.isLoading.set(loading);

        if (!response) return;

        const { status } = response;

        if (status === ApiStatus.SUCCESS) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const { data } = response as any;

          const customOrder = ['identityProof', 'addressProof', 'photograph', 'signature'];

          interface PreviewDoc {
            docType: string;
          }

          // Sort the documents array
          const sortedDocuments = data[0].documents.sort((a: PreviewDoc, b: PreviewDoc) => {
            return customOrder.indexOf(a.docType) - customOrder.indexOf(b.docType);
          });

          this.data.set(sortedDocuments);
        }
      },
    });
  }
}
