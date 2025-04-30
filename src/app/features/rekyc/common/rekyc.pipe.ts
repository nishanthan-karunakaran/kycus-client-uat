import { Pipe, PipeTransform } from '@angular/core';
import { ReKycStatus } from '../rekyc.model';
import { normalizeStatus } from './rekyc.helpers';

export const REKYC_STATUS_LABELS: Record<keyof typeof ReKycStatus, string> = {
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
  SUBMITTED: 'Submitted',
  PENDING: 'Pending',
  EXPIRED: 'Expired',
};

@Pipe({ name: 'rekycStatusLabel' })
export class ReKycStatusLabelPipe implements PipeTransform {
  transform(status: keyof typeof ReKycStatus | string): string {
    const key = normalizeStatus(status);
    return REKYC_STATUS_LABELS[key as keyof typeof ReKycStatus] ?? 'No Corresponding Status';
  }
}

@Pipe({ name: 'rekycStatusClass' })
export class ReKycStatusClassPipe implements PipeTransform {
  transform(status: string): string {
    const normalized = status.toLowerCase();
    switch (normalized) {
      case ReKycStatus.COMPLETED:
        return 'text-success';
      case ReKycStatus.IN_PROGRESS:
      case ReKycStatus.SUBMITTED:
      case ReKycStatus.PENDING:
        return 'text-secondary';
      case ReKycStatus.EXPIRED:
        return 'text-danger';
      default:
        return 'text-secondary';
    }
  }
}
