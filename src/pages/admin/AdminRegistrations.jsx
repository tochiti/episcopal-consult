import { useEffect, useMemo, useState } from 'react';
import { ChevronRight, Download, Filter, Search, X } from 'lucide-react';
import { Link, useOutletContext } from 'react-router-dom';
import StatusBadge from '../../components/StatusBadge';
import { buildRegistrationFilter, composeFullName, downloadRegistrationsCsv } from '../../lib/registrations';
import { PROVINCE_OPTIONS, TRAVEL_MODES } from '../../lib/registrationOptions';

export default function AdminRegistrations() {
  const { registrations, loading } = useOutletContext();
  const [filters, setFilters] = useState({
    query: '',
    province: '',
    status: '',
    travelMode: '',
    needsTransport: '',
    hasPassport: '',
    arrivalDate: '',
  });
  const [showFilters, setShowFilters] = useState(false);

  const filteredRegistrations = useMemo(() => {
    const predicate = buildRegistrationFilter(filters);
    return registrations.filter(predicate);
  }, [filters, registrations]);

  const arrivalDates = useMemo(() => {
    const set = new Set();
    registrations.forEach((r) => {
      if (r.dateOfArrival) set.add(r.dateOfArrival);
    });
    return Array.from(set).sort();
  }, [registrations]);

  /* Listen for the global export event from the sidebar. */
  useEffect(() => {
    const handler = () => {
      const stamp = new Date().toISOString().slice(0, 10);
      downloadRegistrationsCsv(filteredRegistrations, `episcopal_consult_registrations_${stamp}.csv`);
    };
    window.addEventListener('admin:export-csv', handler);
    return () => window.removeEventListener('admin:export-csv', handler);
  }, [filteredRegistrations]);

  const activeFilterCount = useMemo(
    () =>
      Object.entries(filters).filter(([key, val]) => {
        if (key === 'query') return val.trim().length > 0;
        return Boolean(val);
      }).length,
    [filters]
  );

  return (
    <div className="space-y-6 sm:space-y-8">
      <header className="space-y-3">
        <p className="eyebrow">Registrations</p>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="display-heading text-3xl leading-[0.95] text-[var(--text)] sm:text-4xl lg:text-5xl">
              Delegate <span className="display-yellow">list.</span>
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-[var(--muted)]">
              Search, filter, and open a record. {filteredRegistrations.length} of {registrations.length} shown.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setShowFilters((v) => !v)}
              className="secondary-button lg:hidden"
            >
              <Filter className="h-4 w-4" /> Filters {activeFilterCount > 0 ? `(${activeFilterCount})` : ''}
            </button>
            <button
              type="button"
              onClick={() => {
                const stamp = new Date().toISOString().slice(0, 10);
                downloadRegistrationsCsv(filteredRegistrations, `episcopal_consult_registrations_${stamp}.csv`);
              }}
              className="secondary-button"
            >
              <Download className="h-4 w-4" /> Export CSV
            </button>
          </div>
        </div>
      </header>

      {/* Filter panel */}
      <section className={`surface-glass p-4 sm:p-5 ${showFilters ? '' : 'hidden lg:block'}`}>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-7">
          <label className="block lg:col-span-2">
            <span className="field-label">Search</span>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" />
              <input
                type="text"
                value={filters.query}
                onChange={(event) => setFilters((f) => ({ ...f, query: event.target.value }))}
                placeholder="Name, diocese, phone, position…"
                className="field-input pl-10"
              />
            </div>
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
            <span className="field-label">Transport?</span>
            <select
              value={filters.needsTransport}
              onChange={(event) => setFilters((f) => ({ ...f, needsTransport: event.target.value }))}
              className="field-select"
            >
              <option value="">All</option>
              <option value="yes">Needs transport</option>
              <option value="no">Does not</option>
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
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-[var(--line)] pt-3">
          {arrivalDates.length > 0 ? (
            <label className="block">
              <span className="field-label">Arrival date</span>
              <select
                value={filters.arrivalDate}
                onChange={(event) => setFilters((f) => ({ ...f, arrivalDate: event.target.value }))}
                className="field-select"
              >
                <option value="">All dates</option>
                {arrivalDates.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </label>
          ) : null}
          {activeFilterCount > 0 ? (
            <button
              type="button"
              onClick={() => setFilters({ query: '', province: '', status: '', travelMode: '', needsTransport: '', hasPassport: '', arrivalDate: '' })}
              className="ghost-link ml-auto text-[var(--err)]"
            >
              <X className="h-3.5 w-3.5" /> Clear all filters
            </button>
          ) : null}
        </div>
      </section>

      {/* Records */}
      <section className="surface-glass overflow-hidden">
        {loading ? (
          <div className="p-6 text-sm text-[var(--muted)]">Loading records…</div>
        ) : filteredRegistrations.length === 0 ? (
          <div className="p-6 text-sm text-[var(--muted)]">No records match the current filters.</div>
        ) : (
          <>
            {/* Mobile cards */}
            <div className="divide-y divide-[var(--line)]/60 lg:hidden">
              {filteredRegistrations.map((r) => (
                <Link
                  key={r.id}
                  to={`/admin/registrations/${r.id}`}
                  className="flex items-start gap-3 px-4 py-4 transition hover:bg-[rgba(224,178,90,0.04)]"
                >
                  <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg border border-[var(--line-strong)] bg-black">
                    {r.passportPhoto ? (
                      <img src={r.passportPhoto} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[10px] font-mono text-[var(--muted-2)]">N/A</div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-[var(--text)]">{composeFullName(r)}</p>
                    <p className="truncate text-xs text-[var(--muted)]">
                      {r.position || '—'} · {r.diocese || r.otherAffiliation || '—'}
                    </p>
                    <p className="mt-0.5 truncate text-[11px] text-[var(--muted-2)]">
                      {r.dateOfArrival || '—'} · {r.modeOfTravel || '—'}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <StatusBadge status={r.status} compact />
                    <ChevronRight className="h-4 w-4 text-[var(--muted)]" />
                  </div>
                </Link>
              ))}
            </div>

            {/* Desktop table */}
            <div className="hidden overflow-x-auto lg:block">
              <table className="min-w-full text-left text-sm">
                <thead className="border-b border-[var(--line)] bg-[rgba(12,6,8,0.6)] text-[var(--muted-2)]">
                  <tr>
                    <th className="px-5 py-3.5 font-mono text-[0.58rem] font-bold uppercase tracking-[0.22em]">Delegate</th>
                    <th className="px-5 py-3.5 font-mono text-[0.58rem] font-bold uppercase tracking-[0.22em]">Contact</th>
                    <th className="px-5 py-3.5 font-mono text-[0.58rem] font-bold uppercase tracking-[0.22em]">Travel</th>
                    <th className="px-5 py-3.5 font-mono text-[0.58rem] font-bold uppercase tracking-[0.22em]">Province · Diocese</th>
                    <th className="px-5 py-3.5 font-mono text-[0.58rem] font-bold uppercase tracking-[0.22em]">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRegistrations.map((r) => (
                    <tr key={r.id} className="border-b border-[var(--line)]/40 align-top transition hover:bg-[rgba(224,178,90,0.04)]">
                      <td className="p-0">
                        <Link to={`/admin/registrations/${r.id}`} className="flex items-start gap-3 px-5 py-4">
                          <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg border border-[var(--line-strong)] bg-black">
                            {r.passportPhoto ? (
                              <img src={r.passportPhoto} alt="" className="h-full w-full object-cover" />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-[10px] font-mono text-[var(--muted-2)]">N/A</div>
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-[var(--text)]">{composeFullName(r)}</p>
                            <p className="text-[var(--muted)]">{r.position || '—'}</p>
                            <p className="mt-1 font-mono text-[0.58rem] uppercase tracking-[0.18em] text-[var(--muted-2)]">
                              {r.title || ''}
                            </p>
                          </div>
                        </Link>
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-mono text-xs text-[var(--text)]">{r.whatsappNumber || '—'}</p>
                        <p className="mt-0.5 text-[var(--muted)]">{r.emailAddress || '—'}</p>
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-[var(--text)]">{r.modeOfTravel || '—'}</p>
                        <p className="text-[var(--muted)]">{r.dateOfArrival || '—'}</p>
                        {r.requireInternalTransport === 'Yes' ? (
                          <p className="mt-1 font-mono text-[0.58rem] uppercase tracking-[0.18em] text-[var(--accent)]">Needs transport</p>
                        ) : null}
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-[var(--text)]">{r.diocese || r.otherAffiliation || '—'}</p>
                        <p className="text-[var(--muted)]">{r.province || '—'}</p>
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge status={r.status} compact />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
