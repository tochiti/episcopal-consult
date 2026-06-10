import { useMemo, useState } from 'react';
import { Download, FileText, Filter, Printer, X } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';
import AdminPageHeader from '../../components/AdminPageHeader';
import { buildRegistrationFilter, downloadRegistrationsCsv, formatDateTime, normalizeStatus, composeDiocese, composeFullName } from '../../lib/registrations';
import { PROVINCE_OPTIONS, TRAVEL_MODES, VIP_LEVELS } from '../../lib/registrationOptions';

export default function AdminReports() {
  const { registrations, loading } = useOutletContext();
  const [filters, setFilters] = useState({
    query: '',
    province: '',
    status: '',
    travelMode: '',
    needsTransport: '',
    hasPassport: '',
    arrivalDate: '',
    vipLevel: '',
  });
  const [printMode, setPrintMode] = useState(false);

  const filtered = useMemo(() => {
    const predicate = buildRegistrationFilter(filters);
    return registrations.filter(predicate);
  }, [filters, registrations]);

  const arrivalDates = useMemo(() => {
    const set = new Set();
    registrations.forEach((r) => r.dateOfArrival && set.add(r.dateOfArrival));
    return Array.from(set).sort();
  }, [registrations]);

  const activeFilterCount = useMemo(
    () =>
      Object.entries(filters).filter(([key, val]) => {
        if (key === 'query') return val.trim().length > 0;
        return Boolean(val);
      }).length,
    [filters]
  );

  const handleExport = () => {
    const stamp = new Date().toISOString().slice(0, 10);
    downloadRegistrationsCsv(filtered, `episcopal_consult_report_${stamp}.csv`);
  };

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
        eyebrow="Tools"
        title="Planning"
        accent="reports."
        copy="Filter the delegate list and export a clean report. Use the same data to print a PDF-ready briefing for the secretariat."
        actions={[
          { label: 'Export CSV', icon: Download, kind: 'outline', onClick: handleExport },
          { label: 'Print report', icon: Printer, onClick: handlePrint },
        ]}
      />

      <section className="surface-glass p-4 sm:p-5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-[var(--muted)]" />
            <p className="eyebrow">Filters</p>
            {activeFilterCount > 0 ? (
              <span className="font-mono text-[10px] text-[var(--accent)]">{activeFilterCount} active</span>
            ) : null}
          </div>
          {activeFilterCount > 0 ? (
            <button
              type="button"
              onClick={() => setFilters({ query: '', province: '', status: '', travelMode: '', needsTransport: '', hasPassport: '', arrivalDate: '', vipLevel: '' })}
              className="ghost-link text-[var(--err)]"
            >
              <X className="h-3.5 w-3.5" /> Clear
            </button>
          ) : null}
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <label className="block lg:col-span-2">
            <span className="field-label">Search</span>
            <input
              type="text"
              value={filters.query}
              onChange={(event) => setFilters((f) => ({ ...f, query: event.target.value }))}
              placeholder="Name, diocese, phone, position…"
              className="field-input"
            />
          </label>
          <label className="block">
            <span className="field-label">Province</span>
            <select
              value={filters.province}
              onChange={(event) => setFilters((f) => ({ ...f, province: event.target.value }))}
              className="field-select"
            >
              <option value="">All</option>
              {PROVINCE_OPTIONS.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="field-label">Status</span>
            <select
              value={filters.status}
              onChange={(event) => setFilters((f) => ({ ...f, status: event.target.value }))}
              className="field-select"
            >
              <option value="">All</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Declined">Declined</option>
            </select>
          </label>
          <label className="block">
            <span className="field-label">Travel</span>
            <select
              value={filters.travelMode}
              onChange={(event) => setFilters((f) => ({ ...f, travelMode: event.target.value }))}
              className="field-select"
            >
              <option value="">All</option>
              {TRAVEL_MODES.map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="field-label">Transport</span>
            <select
              value={filters.needsTransport}
              onChange={(event) => setFilters((f) => ({ ...f, needsTransport: event.target.value }))}
              className="field-select"
            >
              <option value="">All</option>
              <option value="yes">Needs</option>
              <option value="no">Doesn't need</option>
            </select>
          </label>
          <label className="block">
            <span className="field-label">Passport</span>
            <select
              value={filters.hasPassport}
              onChange={(event) => setFilters((f) => ({ ...f, hasPassport: event.target.value }))}
              className="field-select"
            >
              <option value="">All</option>
              <option value="yes">Attached</option>
              <option value="no">Missing</option>
            </select>
          </label>
          <label className="block">
            <span className="field-label">Protocol level</span>
            <select
              value={filters.vipLevel}
              onChange={(event) => setFilters((f) => ({ ...f, vipLevel: event.target.value }))}
              className="field-select"
            >
              <option value="">All</option>
              {VIP_LEVELS.map((v) => (
                <option key={v.value} value={v.value}>{v.label}</option>
              ))}
            </select>
          </label>
          {arrivalDates.length > 0 ? (
            <label className="block sm:col-span-2 lg:col-span-1">
              <span className="field-label">Arrival date</span>
              <select
                value={filters.arrivalDate}
                onChange={(event) => setFilters((f) => ({ ...f, arrivalDate: event.target.value }))}
                className="field-select"
              >
                <option value="">All</option>
                {arrivalDates.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </label>
          ) : null}
        </div>
        <div className="mt-3 flex items-center justify-between border-t border-[var(--line)] pt-3">
          <p className="text-xs text-[var(--muted)]">
            <span className="font-display text-base text-[var(--accent)]">{filtered.length}</span>{' '}
            of <span className="font-mono">{registrations.length}</span> records match
          </p>
          <p className="text-[11px] text-[var(--muted-2)]">DNDN 2026</p>
        </div>
      </section>

      <section className="surface-glass overflow-hidden">
        {loading ? (
          <div className="p-6 text-sm text-[var(--muted)]">Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-3 p-10 text-center">
            <FileText className="h-7 w-7 text-[var(--muted-2)]" />
            <p className="text-sm text-[var(--muted)]">No records match the current filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-[var(--line)] bg-[rgba(12,6,8,0.6)] text-[var(--muted-2)]">
                <tr>
                  <th className="px-5 py-3 font-mono text-[0.58rem] font-bold uppercase tracking-[0.22em]">Delegate</th>
                  <th className="px-5 py-3 font-mono text-[0.58rem] font-bold uppercase tracking-[0.22em]">Province · Diocese</th>
                  <th className="px-5 py-3 font-mono text-[0.58rem] font-bold uppercase tracking-[0.22em]">Travel</th>
                  <th className="px-5 py-3 font-mono text-[0.58rem] font-bold uppercase tracking-[0.22em]">Hotel / Vehicle</th>
                  <th className="px-5 py-3 font-mono text-[0.58rem] font-bold uppercase tracking-[0.22em]">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id} className="border-b border-[var(--line)]/40 align-top">
                    <td className="px-5 py-3.5">
                      <p className="font-semibold text-[var(--text)]">{composeFullName(r) || '—'}</p>
                      <p className="text-[11px] text-[var(--muted-2)]">{r.position || '—'}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="text-[var(--text)]">{composeDiocese(r) || '—'}</p>
                      <p className="text-[var(--muted-2)] text-[11px]">{r.province || '—'}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="text-[var(--text)]">{r.modeOfTravel || '—'}</p>
                      <p className="text-[11px] text-[var(--muted-2)]">{r.dateOfArrival || '—'}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="text-[var(--text)]">{r.roomNumber ? `Room ${r.roomNumber}` : '—'}</p>
                      <p className="text-[11px] text-[var(--muted-2)]">
                        {r.transportId ? 'Vehicle assigned' : r.requireInternalTransport === 'Yes' ? 'Needs pickup' : '—'}
                      </p>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="font-mono text-xs uppercase tracking-[0.16em] text-[var(--text)]">{normalizeStatus(r.status)}</p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {printMode ? <PrintReport registrations={filtered} /> : null}

      <style>{`
        @media print {
          body * { visibility: hidden; }
          .print-root, .print-root * { visibility: visible; }
          .print-root { position: absolute; inset: 0; padding: 1cm; color: #000; background: #fff; }
          .print-root h1, .print-root h2, .print-root h3, .print-root p, .print-root td, .print-root th, .print-root span, .print-root div { color: #000 !important; }
          @page { size: A4; margin: 0.5cm; }
        }
      `}</style>
    </div>
  );
}

function PrintReport({ registrations }) {
  return (
    <div className="print-root fixed inset-0 z-50 hidden bg-white print:block">
      <h1 className="text-2xl font-bold text-black">DNDN Episcopal Consultation — Planning Report</h1>
      <p className="mt-1 text-xs text-black/70">Generated {formatDateTime(new Date())} · DNDN 2026</p>
      <table className="mt-3 w-full border-collapse text-[10px]">
        <thead>
          <tr className="border-b-2 border-black">
            <th className="py-1 pr-2 text-left font-bold uppercase">Title</th>
            <th className="py-1 pr-2 text-left font-bold uppercase">Name</th>
            <th className="py-1 pr-2 text-left font-bold uppercase">Position</th>
            <th className="py-1 pr-2 text-left font-bold uppercase">Province</th>
            <th className="py-1 pr-2 text-left font-bold uppercase">Diocese</th>
            <th className="py-1 pr-2 text-left font-bold uppercase">Arrival</th>
            <th className="py-1 pr-2 text-left font-bold uppercase">Mode</th>
            <th className="py-1 pr-2 text-left font-bold uppercase">Transport</th>
            <th className="py-1 pr-2 text-left font-bold uppercase">Status</th>
          </tr>
        </thead>
        <tbody>
          {registrations.map((r) => (
            <tr key={r.id} className="border-b border-black/20">
              <td className="py-1 pr-2">{r.title || '—'}</td>
              <td className="py-1 pr-2">{[r.firstName, r.lastName].filter(Boolean).join(' ') || '—'}</td>
              <td className="py-1 pr-2">{r.position || '—'}</td>
              <td className="py-1 pr-2">{r.province || '—'}</td>
              <td className="py-1 pr-2">{composeDiocese(r) || '—'}</td>
              <td className="py-1 pr-2">{r.dateOfArrival || '—'}</td>
              <td className="py-1 pr-2">{r.modeOfTravel || '—'}</td>
              <td className="py-1 pr-2">{r.requireInternalTransport || 'No'}</td>
              <td className="py-1 pr-2">{normalizeStatus(r.status)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
