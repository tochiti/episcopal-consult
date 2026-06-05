import { CheckCircle2, Clock3, XCircle } from 'lucide-react';
import { getStatusMeta, normalizeStatus } from '../lib/registrations';

export default function StatusBadge({ status, compact = false }) {
  const current = normalizeStatus(status);
  const meta = getStatusMeta(current);
  const Icon = current === 'Approved' ? CheckCircle2 : current === 'Declined' ? XCircle : Clock3;

  return (
    <span
      className={`${meta.pill} inline-flex items-center gap-2 rounded-full font-semibold shadow-sm ${
        compact ? 'px-2.5 py-1 text-xs' : 'px-4 py-2 text-sm'
      }`}
    >
      <Icon className={compact ? 'h-3.5 w-3.5' : 'h-4 w-4'} />
      {meta.label}
    </span>
  );
}
