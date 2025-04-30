import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  computed,
  DoCheck,
  effect,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subject, takeUntil } from 'rxjs';
import { selectEntityInfo } from './components/entity-filledby/store/entity-info.selectors';
import { AccessibleSteps } from './components/rekyc-personal-details/store/personal-details.reducer';
import {
  selectAccessibleSteps,
  selectAusInfo,
} from './components/rekyc-personal-details/store/personal-details.selectors';
import { FormPage, FormStep } from './rekyc-form.model';
import { RekycFormService } from './rekyc-form.service';
import { updateActiveRoute } from './store/rekyc-form.action';
import {
  selectRekycActiveRoute,
  selectRekycFormStatus,
  selectRekycStatus,
} from './store/rekyc-form.selectors';

@Component({
  selector: 'app-rekyc-form',
  templateUrl: './rekyc-form.component.html',
  styleUrls: ['./rekyc-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RekycFormComponent implements OnInit, DoCheck, OnDestroy {
  currentForm = toSignal(this.store.select(selectRekycActiveRoute));
  formList = signal<FormPage[]>([
    { label: 'Entity Details', step: FormStep.ENTITY_DETAILS, isCompleted: false, canShow: true },
    {
      label: 'AUS Details',
      step: FormStep.PERSONAL_DETAILS,
      isCompleted: false,
      canShow: true,
    },
    { label: 'KYC Form', step: FormStep.KYC_FORM, isCompleted: false, canShow: true },
    // { label: 'E-Sign', step: FormStep.E_SIGN, isCompleted: false, canShow: true },
  ]);
  readonly FormStep = FormStep;
  applicationToken: string | null = null;
  readonly ausInfo = toSignal(this.store.select(selectAusInfo));
  accessibleSteps = toSignal(this.store.select(selectAccessibleSteps));
  readonly entityInfo = toSignal(this.store.select(selectEntityInfo));
  readonly isAuthenticated = computed(() => this.ausInfo()?.isAuthenticated);
  // readonly isAuthenticated = () => true;
  readonly formStatus = toSignal(this.store.select(selectRekycStatus));
  private destroy$ = new Subject<void>();
  readonly rekycFormStatus = toSignal(this.store.select(selectRekycFormStatus));

  constructor(
    private activatedRouter: ActivatedRoute,
    private router: Router,
    private store: Store,
    private rekycFormService: RekycFormService,
    private cdRef: ChangeDetectorRef,
  ) {
    effect(
      () => {
        const updatedDocs = this.accessibleSteps();
        if (updatedDocs) {
          this.handleInitialRoute();
        }
      },
      { allowSignalWrites: true },
    );
  }

  ngOnInit(): void {
    this.tabCompletionStatus();

    this.rekycFormService.triggerFn$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.handleInitialRoute();
      this.cdRef.markForCheck(); // Important with OnPush
    });

    this.updateFormList();

    this.handleInitialRoute();
    this.applicationToken = this.activatedRouter.snapshot.queryParamMap.get('token');
  }

  ngDoCheck(): void {
    this.updateFormList();
  }

  updateFormList(): void {
    const rekycFormStatus = this.rekycFormStatus();
    const accessibleSteps = this.accessibleSteps();

    if (!rekycFormStatus || !accessibleSteps) return;

    // Log to confirm that the state is updated

    // console.log('Updated rekycFormStatus:', rekycFormStatus);

    const updatedFormList = [
      {
        label: 'Entity Details',
        step: FormStep.ENTITY_DETAILS,
        isCompleted: rekycFormStatus.entityDetails, // Signal value
        canShow: accessibleSteps.entityDetails,
      },
      {
        label: 'AUS Details',
        step: FormStep.PERSONAL_DETAILS,
        isCompleted: rekycFormStatus.ausDetails, // Signal value
        canShow: accessibleSteps.ausDetails,
      },
      {
        label: 'KYC Form',
        step: FormStep.KYC_FORM,
        isCompleted: rekycFormStatus.rekycForm, // Signal value
        canShow: accessibleSteps.rekycForm,
      },
      {
        label: 'E-Sign',
        step: FormStep.E_SIGN,
        isCompleted: rekycFormStatus.eSign,
        canShow: accessibleSteps.eSign,
      },
    ];

    // Set the updated form list
    this.formList.set(updatedFormList);

    // Trigger change detection
    this.cdRef.markForCheck(); // Notify Angular to check the component again
  }

  handleInitialRoute() {
    const accessibleSteps = this.accessibleSteps();

    if (!accessibleSteps) return;

    const rekycData = localStorage.getItem('rekyc');
    let activeRoute = Object.keys(accessibleSteps).find(
      (step) => accessibleSteps[step as keyof AccessibleSteps],
    );

    const stepToRoute = {
      ausDetails: 'personal-details',
      entityDetails: 'entity-details',
      rekycForm: 'rekyc-form',
      eSign: 'eSign',
    };

    const parsed = rekycData ? JSON.parse(rekycData) : null;
    if (parsed?.activeRoute) {
      activeRoute = parsed.activeRoute;
    } else {
      activeRoute = stepToRoute[activeRoute as keyof typeof stepToRoute];
    }

    if (activeRoute) {
      this.rekycFormService.updateRekycLS('activeRoute', activeRoute);
    }

    // Construct the full path
    const basePath = '/application/rekyc/';
    const fullPath = basePath + activeRoute;

    // Get current query parameters from the activated route (preserve them)
    const currentParams = this.activatedRouter.snapshot.queryParams;

    // Perform the navigation
    this.router.navigate([fullPath], {
      queryParams: currentParams, // Preserve query params like token
      queryParamsHandling: 'preserve', // Ensure queryParams are retained
    });
  }

  trackStep(_index: number, step: FormPage) {
    return step.step;
  }

  isStepDisabled(step: FormStep, canShow: boolean): boolean {
    return !canShow || !this.rekycFormService.canAccessStep(step);
  }

  setCurrentForm(item: FormPage) {
    if (item.canShow && this.rekycFormService.canAccessStep(item.step)) {
      this.store.dispatch(updateActiveRoute({ activeRoute: item.step }));

      const rekycData = localStorage.getItem('rekyc');
      const currentRekyc = rekycData ? JSON.parse(rekycData) : { activeRoute: '' };

      currentRekyc.activeRoute = item.step; // Update only activeRoute
      localStorage.setItem('rekyc', JSON.stringify(currentRekyc));

      // Navigate to the new route, preserve query params (like token)
      this.router.navigate([item.step], {
        relativeTo: this.activatedRouter,
        queryParamsHandling: 'preserve', // keeps the token query param
      });
    }
  }

  tabCompletionStatus() {
    const ausId = this.ausInfo()?.ausId as string;

    this.rekycFormService.tabCompletionStatus(ausId).subscribe();
  }

  ngOnDestroy(): void {
    // this.subscription.unsubscribe();
    this.destroy$.next();
    this.destroy$.complete();
  }
}
