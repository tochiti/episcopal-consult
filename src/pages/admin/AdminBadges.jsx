import { useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Award, Filter, Printer } from 'lucide-react';
import AdminPageHeader from '../../components/AdminPageHeader';
import { composeDiocese, composeFullName, normalizeStatus } from '../../lib/registrations';

const BADGE_TYPES = [
  { key: 'all', label: 'All approved' },
  { key: 'bishop', label: 'Bishops' },
  { key: 'archbishop', label: 'Archbishops / Primates' },
  { key: 'special', label: 'Special guests' },
];

function classifyBadgeType(r) {
  const title = (r.title || '').toLowerCase();
  if (title.includes('most rev')) return 'archbishop';
  if ((r.vipLevel || '') === 'archbishop') return 'archbishop';
  if (title.includes('rt. rev') || title.includes('lord')) return 'bishop';
  if ((r.vipLevel || '') === 'dignitary' || (r.vipLevel || '') === 'special') return 'special';
  return 'delegate';
}

const BADGE_PALETTE = {
  archbishop: { label: 'Archbishop', border: 'border-[#e0b25a]', accent: 'bg-[#e0b25a]' },
  bishop: { label: 'Bishop', border: 'border-[#6e1d2a]', accent: 'bg-[#6e1d2a]' },
  special: { label: 'Special Guest', border: 'border-[#5fb98a]', accent: 'bg-[#5fb98a]' },
  delegate: { label: 'Delegate', border: 'border-[#b8893c]', accent: 'bg-[#b8893c]' },
};

export default function AdminBadges() {
  const { registrations } = useOutletContext();
  const [filter, setFilter] = useState('all');
  const [printMode, setPrintMode] = useState(false);

  const approved = useMemo(
    () => registrations.filter((r) => normalizeStatus(r.status) === 'Approved'),
    [registrations]
  );

  const filtered = useMemo(() => {
    if (filter === 'all') return approved;
    return approved.filter((r) => classifyBadgeType(r) === filter);
  }, [approved, filter]);

  const handlePrint = () => {
    setPrintMode(true);
    setTimeout(() => {
      window.print();
      setTimeout(() => setPrintMode(false), 200);
    }, 100);
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      <AdminPageHeader
        eyebrow="Operations"
        title="Print"
        accent="badges."
        copy="Generate accreditation badges for approved delegates. Each badge shows the delegate's photo, title, and diocese. Print two A4 sheets per page, six badges per sheet, cut along the guides."
        actions={[
          {
            label: `Print ${filtered.length} badge${filtered.length === 1 ? '' : 's'}`,
            icon: Printer,
            onClick: handlePrint,
          },
        ]}
      />

      {/* Filter chips */}
      <div className="surface-glass flex flex-wrap items-center gap-2 px-3 py-2.5">
        <Filter className="ml-1 h-4 w-4 text-[var(--muted)]" />
        {BADGE_TYPES.map((t) => {
          const count = t.key === 'all' ? approved.length : approved.filter((r) => classifyBadgeType(r) === t.key).length;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => setFilter(t.key)}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                filter === t.key
                  ? 'border-[var(--accent)] bg-[rgba(224,178,90,0.10)] text-[var(--accent)]'
                  : 'border-[var(--line)] text-[var(--muted)] hover:border-[var(--line-strong)] hover:text-[var(--text)]'
              }`}
            >
              {t.label}
              <span className="font-mono text-[10px] opacity-70">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Screen preview grid */}
      <div className="print:hidden grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.length === 0 ? (
          <div className="surface-glass col-span-full p-10 text-center text-sm text-[var(--muted)]">
            No approved delegates match the current filter.
          </div>
        ) : (
          filtered.map((r) => <BadgeCard key={r.id} delegate={r} />)
        )}
      </div>

      {/* Print-only sheet */}
      {printMode ? <BadgePrintSheet delegates={filtered} /> : null}

      <style>{`
        @media print {
          body * { visibility: hidden; }
          .badge-print-root, .badge-print-root * { visibility: visible; }
          .badge-print-root { position: absolute; inset: 0; padding: 0.7cm; color: #000; background: #fff; }
          .badge-print-root h1, .badge-print-root h2, .badge-print-root h3, .badge-print-root p, .badge-print-root span, .badge-print-root div { color: #000 !important; }
          @page { size: A4; margin: 0.5cm; }
        }
      `}</style>
    </div>
  );
}

function BadgeCard({ delegate }) {
  const type = classifyBadgeType(delegate);
  const palette = BADGE_PALETTE[type];

  return (
    <div className="surface-glass overflow-hidden p-0">
      <div className={`h-1.5 w-full ${palette.accent}`} />
      <div className="grid grid-cols-[5rem_1fr] gap-3 p-4 sm:grid-cols-[6rem_1fr] sm:gap-4 sm:p-5">
        <div className="aspect-[3/4] overflow-hidden rounded-lg border border-[var(--line-strong)] bg-black">
          {delegate.passportPhoto ? (
            <img src={delegate.passportPhoto} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-[10px] text-[var(--muted-2)]">No photo</div>
          )}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <Award className="h-3 w-3 text-[var(--accent)]" />
            <p className="eyebrow">{palette.label}</p>
          </div>
          <h3 className="display-heading mt-1 text-lg leading-[1.05] text-[var(--text)]">
            {composeFullName(delegate) || '—'}
          </h3>
          <p className="mt-0.5 truncate text-xs text-[var(--muted)]">{delegate.position || '—'}</p>
          <p className="mt-2 truncate text-xs text-[var(--text)]">{composeDiocese(delegate) || '—'}</p>
          <p className="truncate text-[10px] text-[var(--muted-2)]">{delegate.province || '—'}</p>
        </div>
      </div>
    </div>
  );
}

function BadgePrintSheet({ delegates }) {
  return (
    <div className="badge-print-root fixed inset-0 z-50 hidden bg-white print:block">
      <div className="grid grid-cols-2 gap-3">
        {delegates.map((r) => (
          <PrintBadge key={r.id} delegate={r} />
        ))}
      </div>
    </div>
  );
}

function PrintBadge({ delegate }) {
  const type = classifyBadgeType(delegate);
  const palette = BADGE_PALETTE[type];
  return (
    <div
      className="break-inside-avoid border-2 border-black bg-white p-3"
      style={{ aspectRatio: '4 / 5' }}
    >
      <div className="flex items-center justify-between border-b-2 border-black pb-1.5">
        <p className="text-[8px] font-bold uppercase tracking-[0.18em] text-black">DNDN Episcopal Consult</p>
        <p className="text-[8px] font-bold uppercase tracking-[0.18em] text-black">{palette.label}</p>
      </div>
      <div className="mt-2 grid grid-cols-[3.4rem_1fr] gap-2">
        <div className="aspect-[3/4] overflow-hidden border-2 border-black bg-black">
          {delegate.passportPhoto ? (
            <img src={delegate.passportPhoto} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-[7px] text-white/70">No photo</div>
          )}
        </div>
        <div>
          <p className="text-[10px] font-bold leading-tight text-black">{delegate.title || ''}</p>
          <p className="font-serif text-base font-bold leading-tight text-black">{delegate.firstName}</p>
          <p className="font-serif text-base font-bold leading-tight text-black">{delegate.lastName}</p>
          <p className="mt-1 text-[8px] leading-tight text-black/80">{delegate.position || ''}</p>
        </div>
      </div>
      <div className="mt-2 border-t-2 border-black pt-1.5 text-center">
        <p className="text-[8px] font-bold uppercase tracking-wider text-black">{composeDiocese(delegate) || ''}</p>
        <p className="text-[7px] text-black/70">{delegate.province || ''}</p>
      </div>
    </div>
  );
}
