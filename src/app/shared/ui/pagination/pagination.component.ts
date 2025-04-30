import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'ui-pagination',
  templateUrl: './pagination.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaginationComponent {
  @Input() active = 1;
  @Output() activeChange = new EventEmitter<number>();
  @Input() totalItems!: number;
  @Input() split = 10;

  private startPage = 1;

  get totalPages(): number {
    return Math.ceil(this.totalItems / this.split);
  }

  get pageNumbers(): number[] {
    return Array.from({ length: 4 }, (_, i) => this.startPage + i).filter(
      (p) => p <= this.totalPages,
    );
  }

  setActivePage(page: number | string) {
    if (typeof page === 'number' && page >= 1 && page <= this.totalPages) {
      this.active = page;
      this.activeChange.emit(this.active);
      this.updateStartPage();
    }
  }

  next() {
    if (this.active < this.totalPages) {
      this.active++;
      this.activeChange.emit(this.active);
      this.updateStartPage();
    }
  }

  prev() {
    if (this.active > 1) {
      this.active--;
      this.activeChange.emit(this.active);
      this.updateStartPage();
    }
  }

  private updateStartPage() {
    // Move forward when reaching the last page in the current range
    if (this.active === this.startPage + 3 && this.active + 1 <= this.totalPages) {
      this.startPage += 3;
    }
    // Move backward when reaching the first page in the current range
    else if (this.active === this.startPage && this.startPage > 1) {
      this.startPage -= 3;
    }
  }

  trackByPage(_: number, page: number | string) {
    return page;
  }
}
