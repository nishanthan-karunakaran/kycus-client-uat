import { ChangeDetectionStrategy, Component, OnInit, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ApiStatus } from '@core/constants/api.response';
import { Store } from '@ngrx/store';
import { ToastService } from '@src/app/shared/ui/toast/toast.service';
import { selectAusInfo } from '../rekyc-personal-details/store/personal-details.selectors';
import { AusDropDownList, AusListDropDownResponse, EntityFilledBy } from './entity-filledby.model';
import { RekycEntityFilledbyService } from './entity-filledby.service';
import { updateEntityFilledBy } from './store/entity-info.actions';
import { selectEntityInfo } from './store/entity-info.selectors';
import {
  setAusInfo,
  updateAccessibleSteps,
} from '../rekyc-personal-details/store/personal-details.actions';
import { RekycFormService } from '@features/forms/rekyc-form/rekyc-form.service';
import { EntityInfoState } from './store/entity-info.reducer';

@Component({
  selector: 'rekyc-entity-filledby',
  templateUrl: './entity-filledby.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RekycEntityFilledbyComponent implements OnInit {
  showFlow = signal(false);
  selectedFilledBy = signal(1);
  ausList = signal<AusDropDownList[]>([]);
  selectedAusId = '';
  othersEmail = '';
  readonly ausInfo = toSignal(this.store.select(selectAusInfo));
  readonly entityInfo = toSignal(this.store.select(selectEntityInfo));
  isLoading = signal(false);
  isOpen = signal(true);

  constructor(
    private store: Store,
    private entityFilledByService: RekycEntityFilledbyService,
    private rekycFormService: RekycFormService,
    private toast: ToastService,
  ) {}

  ngOnInit(): void {
    this.fetchAusList();
  }

  handleEntityFilledBy() {
    this.isOpen.set(!this.isOpen());
  }

  updateShowFlow() {
    this.showFlow.set(true);
    this.fetchAusList();
  }

  setSelectedAusId(id: string) {
    this.selectedAusId = id;
  }

  setOthersEmail(event: string | number | boolean) {
    this.othersEmail = event as string;
  }

  updateEntityFilledBy() {
    const payload: EntityFilledBy = {
      ausId: this.ausInfo()?.ausId as string,
      type: 'AUS',
    };

    if (this.selectedFilledBy() === 2) {
      // if user directly check the checkbox without selecting an option
      // then mark first aus as selected
      payload.ausId = this.selectedAusId ? this.selectedAusId : this.ausList()[0].value;
    } else if (this.selectedFilledBy() === 3) {
      payload.email = this.othersEmail;
      delete payload.type;
    }

    this.entityFilledByService.updateEntityFilledBy(payload).subscribe({
      next: (result) => {
        const { loading, response } = result;
        this.isLoading.set(loading);

        if (response) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const { status, data } = response as any;

          if (status === ApiStatus.SUCCESS) {
            this.isOpen.set(false);
            this.toast.success('Entity filled by details saved successfully!');

            const { entityFilledBy } = data;
            const ausId = this.ausInfo()?.ausId as string;
            let accessibleSteps = {
              entityDetails: false,
              ausDetails: true,
              rekycForm: false,
              eSign: true,
            };

            if (entityFilledBy !== null) {
              if (ausId !== entityFilledBy) {
                accessibleSteps = {
                  entityDetails: false,
                  ausDetails: true,
                  rekycForm: false,
                  eSign: true,
                };
              } else if (ausId === entityFilledBy) {
                if (ausId.includes('OTHER')) {
                  accessibleSteps = {
                    entityDetails: true,
                    ausDetails: false,
                    rekycForm: true,
                    eSign: false,
                  };
                } else {
                  accessibleSteps = {
                    entityDetails: true,
                    ausDetails: true,
                    rekycForm: true,
                    eSign: true,
                  };
                }
              }
              this.rekycFormService.updateRekycLS('accessibleSteps', accessibleSteps);
              this.store.dispatch(updateAccessibleSteps({ accessibleSteps }));

              this.store.dispatch(updateEntityFilledBy({ entityFilledBy }));

              this.rekycFormService.updateRekycLS(
                'entityInfo',
                this.entityInfo() as EntityInfoState,
              );
            }
          } else {
            this.isOpen.set(false);
            this.toast.info(response.message || 'Something went wrong!');
            const accessibleSteps = {
              entityDetails: false,
              ausDetails: true,
              rekycForm: false,
              eSign: true,
            };
            this.rekycFormService.updateRekycLS('accessibleSteps', accessibleSteps);

            this.store.dispatch(updateAccessibleSteps({ accessibleSteps }));

            const entityInfo = { ...this.entityInfo() } as EntityInfoState;
            entityInfo.entityFilledBy = 'filled by diff aus / person';

            this.rekycFormService.updateRekycLS('entityInfo', entityInfo);

            this.store.dispatch(
              updateEntityFilledBy({ entityFilledBy: 'filled by diff aus / person' }),
            );
          }
        }
      },
    });
  }

  fetchAusList() {
    const ausInfo = this.ausInfo();

    if (!ausInfo) {
      // eslint-disable-next-line no-console
      console.warn('ausId not found to update entity filled by');
      return;
    }

    this.entityFilledByService.fetchAusList(ausInfo.ausId as string).subscribe({
      next: (result) => {
        const { response } = result;

        if (response) {
          const { status, data } = response as AusListDropDownResponse;

          if (status === ApiStatus.SUCCESS) {
            this.store.dispatch(setAusInfo({ ...ausInfo, ausEmail: data.email }));

            const ausDropDownList: AusDropDownList[] = data.authorizedSignatories
              .map((aus) => ({
                id: aus.ausId,
                label: aus.name,
                value: aus.ausId,
              }))
              .filter((aus) => aus.id !== ausInfo.ausId);
            this.ausList.set(ausDropDownList);
          }
        }
      },
    });
  }
}
