import { CheckCircle2, Clock3, XCircle } from 'lucide-react';
import { getStatusMeta, normalizeStatus } from '../lib/registrations';

const tone = {
  Approved: {
    Icon: CheckCircle2,
    cls: 'border-[rgba(95,185,138,0.32)] bg-[rgba(95,185,138,0.10)] text-[var(--ok)]',
  },
  Declined: {
    Icon: XCircle,
    cls: 'border-[rgba(229,119,135,0.32)] bg-[rgba(229,119,135,0.10)] text-[var(--err)]',
  },
  Pending: {
    Icon: Clock3,
    cls: 'border-[rgba(224,178,90,0.32)] bg-[rgba(224,178,90,0.10)] text-[var(--warn)]',
  },
};

export default function StatusBadge({ status, compact = false }) {
  const current = normalizeStatus(status);
  const meta = getStatusMeta(current);
  const { Icon, cls } = tone[current] || tone.Pending;

  return (
    <span
      className={`${cls} inline-flex items-center gap-1.5 rounded-full border font-mono font-bold shadow-sm ${
        compact ? 'px-2.5 py-0.5 text-[0.6rem] uppercase tracking-[0.16em]' : 'px-3 py-1 text-[0.65rem] uppercase tracking-[0.18em]'
      }`}
    >
      <Icon className="h-3 w-3" />
      {meta.label}
    </span>
  );
}
