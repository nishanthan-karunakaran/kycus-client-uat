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
  searchInput = '';
  activePage = signal(1);
  isModalOpen = false;
  selectedReKycEntity: ReKycApplication | null = null;
  isApplicationsLoading = false;
  reKycApplications = toSignal(this.store.select(rekycSelectors.selectReKycApplications));
  reKycPaginationInfo = toSignal(this.store.select(rekycSelectors.selectReKycPaginationInfo));
  readonly ROWS_PER_PAGE = 10;

  constructor(
    private store: Store,
    private rekycService: RekycService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.getReKycApplications();
  }

  filteredReKycApplications = computed(() => {
    const query = this.searchInput.toLowerCase();
    const start = this.activePage() * this.ROWS_PER_PAGE - this.ROWS_PER_PAGE;
    const end = this.activePage() * this.ROWS_PER_PAGE;

    return (
      this.reKycApplications()
        ?.filter((rekycApplication) => rekycApplication.entityName?.toLowerCase().includes(query))
        ?.slice(start, end) || []
    );
  });

  handleReKycSheet(data: ReKycApplication | null = null) {
    this.selectedReKycEntity = data;
  }

  onSearchInputChange(event: string): void {
    this.searchInput = event;
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
        this.isApplicationsLoading = loading;

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
