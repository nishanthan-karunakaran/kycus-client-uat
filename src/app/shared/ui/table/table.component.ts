import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

interface Column {
  key: string;
  label: string;
}

type SortDirection = 'asc' | 'desc' | '';

type DataRow = Record<string, string | number | boolean>;

@Component({
  selector: 'ui-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
})
export class TableComponent<T extends DataRow> implements OnInit {
  @Input() data: T[] = [];
  @Input() columns: Column[] = [];
  @Input() sortable: boolean | string[] = true;
  @Input() emitActiveRow = false;
  @Output() activeRow = new EventEmitter<T>();

  sortedData: T[] = [];
  sortKey: string | null = null;
  sortDirection: SortDirection = '';
  columnSortState: Record<string, 'ascending' | 'descending' | 'none'> = {};

  ngOnInit() {
    this.sortedData = [...this.data];

    if (this.sortable === true) {
      this.sortable = this.columns.map((c) => c.key);
    }

    this.columns.forEach((column) => {
      this.columnSortState[column.key] = 'none';
    });
  }

  sort(key: string) {
    if (Array.isArray(this.sortable) && !this.sortable.includes(key)) return;

    if (this.sortKey === key) {
      this.sortDirection =
        this.sortDirection === 'asc'
          ? 'desc'
          : this.sortDirection === 'desc'
            ? ''
            : 'asc';
    } else {
      this.sortKey = key;
      this.sortDirection = 'asc';
    }

    this.columns.forEach((column) => {
      this.columnSortState[column.key] = 'none';
    });

    if (this.sortDirection) {
      this.columnSortState[key] =
        this.sortDirection === 'asc' ? 'ascending' : 'descending';
    }

    if (!this.sortDirection) return;

    this.sortedData = this.sortedData.slice().sort((a, b) => {
      const valA = a[key];
      const valB = b[key];

      if (typeof valA === 'string' && typeof valB === 'string') {
        return this.sortDirection === 'asc'
          ? valA.localeCompare(valB)
          : valB.localeCompare(valA);
      }
      if (typeof valA === 'number' && typeof valB === 'number') {
        return this.sortDirection === 'asc' ? valA - valB : valB - valA;
      }
      return 0;
    });
  }

  isColumnSortable(columnKey: string): boolean {
    return (
      this.sortable === true ||
      (Array.isArray(this.sortable) && this.sortable.includes(columnKey))
    );
  }

  trackByKey(index: number, column: Column): string {
    return column.key;
  }

  trackByRow(index: number, row: T): string | number {
    return (row['id'] as string | number) ?? index;
  }

  handleActiveRow(row: T) {
    if (this.emitActiveRow) {
      this.activeRow.emit(row);
    }
  }
}
