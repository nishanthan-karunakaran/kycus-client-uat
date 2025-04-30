import { ReKycStatus } from '../rekyc.model';

export function normalizeStatus(status: string): keyof typeof ReKycStatus | undefined {
  return status?.replace(/-/g, '_').toUpperCase() as keyof typeof ReKycStatus;
}
