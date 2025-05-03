import { HttpBackend, HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { API_URL } from '@core/constants/apiurls';
import { ApiService } from '@core/services/api.service';
import {
  selectAccessibleSteps,
  selectAusInfo,
} from '@features/forms/rekyc-form/components/rekyc-personal-details/store/personal-details.selectors';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { DeleteDocument, FormStep } from './rekyc-form.model';
import {
  updateActiveRoute,
  updateCurrentEntityDetTab,
  updateRekycFormStatus,
  updateRekycStepStatus,
} from './store/rekyc-form.action';
import { FormStatus } from './store/rekyc-form.reducer';
import {
  selectRekycFormStatus,
  selectRekycStatus,
  selectRekycStepStatus,
} from './store/rekyc-form.selectors';
import { EntityDetTab } from './store/rekyc-form.state';
import { ApiStatus } from '@core/constants/api.response';
import { selectEntityInfo } from './components/entity-filledby/store/entity-info.selectors';

@Injectable({
  providedIn: 'root',
})
export class RekycFormService {
  readonly formStatus = toSignal(this.store.select(selectRekycStatus));
  private readonly stepOrder: Array<keyof FormStatus['forms']> = [
    'entityDetails',
    'ausDetails',
    'rekycForm',
    'eSign',
  ];
  private readonly stepFormKeyMap: Record<FormStep, keyof FormStatus['forms']> = {
    [FormStep.ENTITY_DETAILS]: 'entityDetails',
    [FormStep.PERSONAL_DETAILS]: 'ausDetails',
    [FormStep.KYC_FORM]: 'rekycForm',
    [FormStep.E_SIGN]: 'eSign',
  };
  readonly rekycFormStatus = toSignal(this.store.select(selectRekycFormStatus));
  readonly rekycStepStatus = toSignal(this.store.select(selectRekycStepStatus));
  readonly accessibleSteps = toSignal(this.store.select(selectAccessibleSteps));
  readonly ausInfo = toSignal(this.store.select(selectAusInfo));
  readonly entityInfo = toSignal(this.store.select(selectEntityInfo));

  private triggerFnSubject = new Subject<void>();
  triggerFn$ = this.triggerFnSubject.asObservable();
  private http: HttpClient;

  triggerRouteHandling() {
    this.triggerFnSubject.next();
  }

  constructor(
    private store: Store,
    private handler: HttpBackend,
    private api: ApiService,
  ) {
    this.http = new HttpClient(handler);
    this.triggerRouteHandling();
  }

  getRekycLS(key: string) {
    const obj = localStorage.getItem('rekyc');
    const currentRekyc: Record<string, string> = obj ? JSON.parse(obj) : {};
    return currentRekyc[key] || null;
  }

  updateRekycLS(key: string, value: string | object) {
    // Get the current object from localStorage or create an empty object if it doesn't exist
    const obj = localStorage.getItem('rekyc');
    const currentRekyc = obj ? JSON.parse(obj) : {};

    // Update the whole rekyc object with the new value
    if (typeof value === 'object' && value !== null) {
      currentRekyc[key] = value;
    } else {
      currentRekyc[key] = value;
    }

    if (key === 'entityInfo') {
      // eslint-disable-next-line no-console
      console.log('entityInfo', value, currentRekyc);
    }
    // Store the entire rekyc object back to localStorage as a string
    localStorage.setItem('rekyc', JSON.stringify(currentRekyc));

    // Handle specific keys for dispatching actions
    if (key === 'currentEntityDetTab') {
      this.store.dispatch(updateCurrentEntityDetTab({ tab: value as EntityDetTab }));
    } else if (key === 'activeRoute') {
      this.store.dispatch(updateActiveRoute({ activeRoute: value as FormStep }));
    }
  }

  isAnyTabMissed = () => {
    const accessibleSteps = this.accessibleSteps();
    const entityDocs = this.rekycStepStatus()?.entityDocs;
    const directorDetails = this.rekycStepStatus()?.directorDetails;
    const boDetails = this.rekycStepStatus()?.boDetails;
    const isAllCompleted = entityDocs && directorDetails && boDetails;

    if (!isAllCompleted) {
      if (!entityDocs) {
        return 'entity-details';
      } else if (!directorDetails) {
        return 'directors';
      } else if (!boDetails) {
        return 'bo';
      }
    }

    this.store.dispatch(updateRekycFormStatus({ entityDetails: true }));

    if (accessibleSteps?.ausDetails) {
      this.updateRekycLS('activeRoute', 'personal-details');
      this.triggerRouteHandling();
    }

    return null;
  };

  updatRekycFormStep(currentTab: string) {
    const formStatus = this.formStatus(); // toSignal() value
    const accessibleSteps = this.accessibleSteps();
    if (!formStatus) return;

    const entityTabs: EntityDetTab[] = ['entity-details', 'directors', 'bo'];

    // Step 1: If user is on one of the entity tabs
    if (entityTabs.includes(currentTab as EntityDetTab)) {
      const { entityDocs, directorDetails, boDetails } = formStatus.steps;

      if (!entityDocs) {
        this.store.dispatch(updateCurrentEntityDetTab({ tab: 'entity-details' }));
        return;
      }
      if (!directorDetails) {
        this.store.dispatch(updateCurrentEntityDetTab({ tab: 'directors' }));
        return;
      }
      if (!boDetails) {
        this.store.dispatch(updateCurrentEntityDetTab({ tab: 'bo' }));
        return;
      }

      if (!formStatus.forms.entityDetails) {
        this.store.dispatch(updateRekycFormStatus({ entityDetails: true }));
      }

      // All steps done, move to next major step
      if (accessibleSteps?.ausDetails) {
        this.updateRekycLS('activeRoute', 'personal-details');
        this.triggerRouteHandling();
      } else if (this.ausInfo()?.ausId?.toLowerCase().includes('other')) {
        this.updateRekycLS('activeRoute', 'rekyc-form');
        this.triggerRouteHandling();
      }
      return;
    }

    // Step 2: Non-entity tabs
    if (currentTab === 'bo') {
      const missed = this.isAnyTabMissed();
      if (missed) {
        this.store.dispatch(updateCurrentEntityDetTab({ tab: missed }));
        return;
      }
    }

    let next: string | null = null;

    if (!formStatus.forms.ausDetails && accessibleSteps?.ausDetails) {
      next = 'personal-details';
    } else if (!formStatus.forms.rekycForm && accessibleSteps?.rekycForm) {
      next = 'rekyc-form';
    }
    // else if (!formStatus.forms.eSign && accessibleSteps?.eSign) {
    //   next = 'eSign';
    // }

    if (next) {
      this.updateRekycLS('activeRoute', next);
      this.triggerRouteHandling();
    }
  }

  canAccessStep(step: FormStep): boolean {
    const status = this.rekycFormStatus();
    const accessibleSteps = this.accessibleSteps();

    if (!status || !accessibleSteps) return false;

    const targetFormKey = this.stepFormKeyMap[step];
    const targetIndex = this.stepOrder.indexOf(targetFormKey);

    if (!accessibleSteps[targetFormKey]) return false;

    // if (status[targetFormKey]) return status[targetFormKey];

    if (targetIndex === -1) return false;

    if (this.entityInfo()?.entityFilledBy === this.ausInfo()?.ausId) {
      for (let i = 0; i < targetIndex; i++) {
        if (!status[this.stepOrder[i]]) {
          return false;
        }
      }
    }

    return true;
  }

  deleteDocument(payload: DeleteDocument) {
    return this.api.post(API_URL.APPLICATION.REKYC.DELETE_DOCUMENT, payload);
  }

  tabCompletionStatus(ausId: string) {
    const access_token = localStorage.getItem('access_token');

    const headers = new HttpHeaders({
      Authorization: access_token ? `Bearer ${access_token}` : '',
    });

    // using http with HttpBackend handler, because of angular's api aborting
    // whenever the route changes angular will abort all the active requests

    this.http
      .get(
        'https://kycusuat.ebitaus.com' + API_URL.APPLICATION.REKYC.TAB_COMPLETION_STATUS(ausId),
        {
          headers,
        },
      )
      .subscribe({
        next: (response) => {
          if (response) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { status, data } = response as any;

            if (status === ApiStatus.SUCCESS) {
              const { ausDetails, boDetails, directorDetails, eSign, entityDocs, rekycForm } = data;

              const entityDetails = entityDocs && directorDetails && boDetails;

              this.store.dispatch(
                updateRekycStepStatus({ entityDocs, directorDetails, boDetails }),
              );
              this.store.dispatch(
                updateRekycFormStatus({ entityDetails, ausDetails, rekycForm, eSign }),
              );
            }
          }
        },
      });

    return this.http.get(
      'https://kycusuat.ebitaus.com' + API_URL.APPLICATION.REKYC.TAB_COMPLETION_STATUS(ausId),
      { headers },
    );
  }
}
