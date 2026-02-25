import type { GrantRequestStatus } from '@/lib/types';

const STATUS_LABELS: Record<GrantRequestStatus, string> = {
  PENDING: 'Pending HOD',
  HOD_APPROVED: 'HOD Approved',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
};

const STATUS_CLASS: Record<GrantRequestStatus, string> = {
  PENDING: 'badge badge-pending',
  HOD_APPROVED: 'badge badge-pending',
  APPROVED: 'badge badge-approved',
  REJECTED: 'badge badge-rejected',
};

interface StatusBadgeProps {
  status: GrantRequestStatus;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span className={STATUS_CLASS[status] ?? 'badge badge-draft'}>
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}
