/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  computed,
  OnInit,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Store } from '@ngrx/store';
import { ToastService } from '@src/app/shared/ui/toast/toast.service';
import { ApiStatus } from 'src/app/core/constants/api.response';
import {
  GetReKycApplicationsParams,
  GetReKycApplicationsResponse,
  ReKycApplication,
} from 'src/app/features/rekyc/rekyc.model';
import { RekycService } from 'src/app/features/rekyc/rekyc.service';
import * as ReKycActions from 'src/app/features/rekyc/store/rekyc.actions';
import { rekycSelectors } from 'src/app/features/rekyc/store/rekyc.selectors';

@Component({
  selector: 'rekyc-application-table',
  templateUrl: './application-table.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ApplicationTableComponent implements OnInit {
  searchInput = signal('');
  activePage = signal(1);
  isModalOpen = false;
  selectedReKycEntity: ReKycApplication | null = null;
  isApplicationsLoading = signal(false);
  isSendingReminder = signal<null | string>(null);
  reKycApplications = toSignal(this.store.select(rekycSelectors.selectReKycApplications));
  reKycPaginationInfo = toSignal(this.store.select(rekycSelectors.selectReKycPaginationInfo));
  readonly ROWS_PER_PAGE = 10;

  constructor(
    private store: Store,
    private rekycService: RekycService,
    private cdr: ChangeDetectorRef,
    private toast: ToastService,
  ) {}

  ngOnInit(): void {
    this.getReKycApplications();
  }

  filteredReKycApplications = computed(() => {
    const query = this.searchInput().toLowerCase();
    const start = this.activePage() * this.ROWS_PER_PAGE - this.ROWS_PER_PAGE;
    const end = this.activePage() * this.ROWS_PER_PAGE;

    return (
      this.reKycApplications()
        ?.filter((rekycApplication) => rekycApplication.entityName?.toLowerCase().includes(query))
        ?.slice(start, end) || []
    );
  });

  formatTo12HourDateTime(isoString: string) {
    const date = new Date(isoString);

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');

    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12; // Convert 0 to 12 for 12-hour format
    const paddedHours = String(hours).padStart(2, '0');

    return `${day}-${month}-${year} ${paddedHours}:${minutes} ${ampm}`;
  }

  handleSendReminder(entityId: string) {
    this.rekycService.sendReminder(entityId).subscribe({
      next: (result) => {
        const { loading, response } = result;

        if (loading) {
          this.isSendingReminder.set(entityId);
        } else {
          this.isSendingReminder.set(null);
        }

        if (loading || !response) return;

        const { status, success } = response as any;

        if (status === ApiStatus.SUCCESS || success) {
          this.toast.success('Reminder sent successfully');
        } else {
          this.toast.error('Failed to send reminder');
        }
      },
    });
  }

  handleDownloadReport(entityId: string) {
    this.rekycService.downloadReport(entityId);
  }

  handleViewReport(entityId: string) {
    this.rekycService.viewReport(entityId);
  }

  handleReKycSheet(data: ReKycApplication | null = null) {
    this.selectedReKycEntity = data;
  }

  onSearchInputChange(event: string): void {
    this.searchInput.set(event);
  }

  trackRow(_: number, rekycAppReKycApplication: ReKycApplication): string {
    return rekycAppReKycApplication._id;
  }

  setActivePage(page: number): void {
    this.activePage.set(page);
    this.getReKycApplications();
  }

  handleModal() {
    this.isModalOpen = !this.isModalOpen;
  }

  getReKycApplications() {
    const params: GetReKycApplicationsParams = {
      page: this.activePage(),
      limit: this.ROWS_PER_PAGE,
    };

    this.rekycService.getReKycApplications(params).subscribe({
      next: (result) => {
        const { loading, response } = result;
        this.isApplicationsLoading.set(loading);

        if (!response) return;

        const { status, data } = response;

        if (status === ApiStatus.SUCCESS) {
          const { results, total, currentPage, totalPages } = data as GetReKycApplicationsResponse;
          this.store.dispatch(ReKycActions.updateReKycApplications({ applications: results }));
          this.store.dispatch(
            ReKycActions.updateRekycPagination({ total, currentPage, totalPages }),
          );
          this.cdr.detectChanges();
        }
      },
    });
  }
}
