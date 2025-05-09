import { HelperService } from '@core/services/helpers.service';
import { Component, EventEmitter, Input, OnChanges, Output, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ApiStatus } from '@core/constants/api.response';
import { selectEntityInfo } from '@features/forms/rekyc-form/components/entity-filledby/store/entity-info.selectors';
import { Store } from '@ngrx/store';
import { EntityDetailsService } from '../entity-details/entity-details.service';

@Component({
  selector: 'rekyc-preview-entitydet',
  templateUrl: './preview-entitydet.component.html',
})
export class PreviewEntitydetComponent implements OnChanges {
  @Input() openSheet = false;
  @Output() closeSheet = new EventEmitter(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data = signal<any[]>([]);
  entityInfo = toSignal(this.store.select(selectEntityInfo));
  isLoading = signal(true);
  // helperService = HelperService;

  constructor(
    private store: Store,
    private entityDetailService: EntityDetailsService,
    public helperService: HelperService,
  ) {}

  ngOnChanges() {
    if (this.openSheet) {
      this.previewEntityDetails();
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

  previewEntityDetails() {
    const entityId = this.entityInfo()?.entityId as string;

    this.entityDetailService.previewEntityDetails(entityId).subscribe({
      next: (result) => {
        const { loading, response } = result;
        this.isLoading.set(loading);

        if (!response) return;

        const { status } = response;

        if (status === ApiStatus.SUCCESS) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const { data } = response as any;

          const customOrder = ['pan', 'gstin', 'addressProof', 'cin', 'moa', 'aoa'];

          interface PreviewDoc {
            docType: string;
          }

          // Sort the documents array
          const sortedDocuments = data.sort((a: PreviewDoc, b: PreviewDoc) => {
            return customOrder.indexOf(a.docType) - customOrder.indexOf(b.docType);
          });

          // eslint-disable-next-line no-console
          console.log('sortedDocuments', sortedDocuments);

          this.data.set(sortedDocuments);
        }
      },
    });
  }
}
