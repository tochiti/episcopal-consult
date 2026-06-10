import { useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  Bus,
  CheckCircle2,
  Download,
  Plane,
  Printer,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { useOutletContext } from 'react-router-dom';
import InsightCard from '../../components/InsightCard';
import StatusBadge from '../../components/StatusBadge';
import { composeFullName, DNDN_FACTS, downloadRegistrationsCsv, formatDateTime } from '../../lib/registrations';
import { PROVINCE_OPTIONS } from '../../lib/registrationOptions';

const tooltipStyle = {
  contentStyle: {
    backgroundColor: 'rgba(12, 6, 8, 0.95)',
    border: '1px solid rgba(224, 178, 90, 0.32)',
    borderRadius: 12,
    color: '#f3eada',
    fontSize: 12,
  },
  itemStyle: { color: '#e0b25a' },
  labelStyle: { color: 'rgba(243, 234, 218, 0.7)' },
};

export default function AdminOverview() {
  const { analytics, registrations, loading } = useOutletContext();
  const [reportFilter, setReportFilter] = useState({
    province: '',
    status: '',
  });

  const filtered = useMemo(() => {
    return registrations.filter((r) => {
      if (reportFilter.province && r.province !== reportFilter.province) return false;
      if (reportFilter.status && (r.status || 'Pending') !== reportFilter.status) return false;
      return true;
    });
  }, [registrations, reportFilter]);

  return (
    <div className="space-y-6 sm:space-y-8">
      <PageHeader analytics={analytics} />

      {/* KPI strip */}
      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <InsightCard icon={Users} label="Total delegates" value={analytics.totals.total} note={`${analytics.titles.bishop} bishops · ${analytics.titles.archbishop} archbishops`} accent="bg-[rgba(224,178,90,0.10)] text-[var(--accent)]" />
        <InsightCard icon={CheckCircle2} label="Approved" value={analytics.totals.approved} note={`${analytics.totals.pending} pending review`} accent="bg-[rgba(95,185,138,0.10)] text-[var(--ok)]" />
        <InsightCard icon={Bus} label="Need transport" value={analytics.totals.needTransport} note={`${analytics.totals.withEscort} with driver / escort`} accent="bg-[rgba(224,178,90,0.10)] text-[var(--accent)]" />
        <InsightCard icon={ShieldCheck} label="Declined" value={analytics.totals.declined} note={`${analytics.totals.withoutPassport} missing passport`} accent="bg-[rgba(229,119,135,0.10)] text-[var(--err)]" />
      </section>

      {/* Row 2: charts */}
      <section className="grid gap-4 lg:grid-cols-3">
        <div className="surface-glass p-5 sm:p-7 lg:col-span-1">
          <PanelHeader label="Status mix" title="Approval status" />
          <div className="mt-4 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={analytics.statusChart} dataKey="count" nameKey="name" innerRadius={50} outerRadius={84} paddingAngle={3} stroke="rgba(12,6,8,0.6)" strokeWidth={2}>
                  {analytics.statusChart.map((entry) => (
                    <Cell key={entry.name} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip {...tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="mt-3 space-y-1.5">
            {analytics.statusChart.map((item) => (
              <li key={item.name} className="flex items-center justify-between text-xs text-[var(--muted)]">
                <span className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.fill }} />
                  {item.name}
                </span>
                <span className="font-display text-base text-[var(--accent)]">{item.count}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="surface-glass p-5 sm:p-7 lg:col-span-2">
          <PanelHeader label="Province distribution" title="Where delegates are coming from" />
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.provinceChart} layout="vertical" margin={{ left: 4, right: 16, top: 4, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(224,178,90,0.08)" />
                <XAxis type="number" tickLine={false} axisLine={false} stroke="rgba(243,234,218,0.5)" fontSize={11} />
                <YAxis type="category" dataKey="name" tickLine={false} axisLine={false} stroke="rgba(243,234,218,0.7)" fontSize={11} width={130} />
                <Tooltip {...tooltipStyle} cursor={{ fill: 'rgba(224,178,90,0.05)' }} />
                <Bar dataKey="count" radius={[0, 6, 6, 0]} fill="#e0b25a" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* Row 3: arrival timeline + travel mode */}
      <section className="grid gap-4 lg:grid-cols-3">
        <div className="surface-glass p-5 sm:p-7 lg:col-span-2">
          <PanelHeader label="Arrival timeline" title="Delegates by arrival date" />
          {analytics.arrivalTimeline.length === 0 ? (
            <EmptyChart />
          ) : (
            <div className="mt-4 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analytics.arrivalTimeline}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(224,178,90,0.08)" />
                  <XAxis dataKey="date" tickLine={false} axisLine={false} stroke="rgba(243,234,218,0.6)" fontSize={11} />
                  <YAxis allowDecimals={false} tickLine={false} axisLine={false} stroke="rgba(243,234,218,0.6)" fontSize={11} />
                  <Tooltip {...tooltipStyle} />
                  <Line type="monotone" dataKey="count" stroke="#e0b25a" strokeWidth={2.5} dot={{ fill: '#e0b25a', r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="surface-glass p-5 sm:p-7">
          <PanelHeader label="Travel mode" title="How they are getting here" />
          {analytics.travelModes.length === 0 ? (
            <EmptyChart />
          ) : (
            <div className="mt-4 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.travelModes}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(224,178,90,0.08)" />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} stroke="rgba(243,234,218,0.6)" fontSize={11} />
                  <YAxis allowDecimals={false} tickLine={false} axisLine={false} stroke="rgba(243,234,218,0.6)" fontSize={11} />
                  <Tooltip {...tooltipStyle} cursor={{ fill: 'rgba(224,178,90,0.05)' }} />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]} fill="#e0b25a" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </section>

      {/* Row 4: Transport planning + Recent activity */}
      <section className="grid gap-4 lg:grid-cols-3">
        <div className="surface-glass p-5 sm:p-7 lg:col-span-2">
          <PanelHeader label="Arrival planning" title="Pickup schedule by day" />
          {analytics.arrivalSlots.length === 0 ? (
            <EmptyChart />
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--line)] text-[var(--muted-2)]">
                    <th className="py-2 pr-3 font-mono text-[0.6rem] uppercase tracking-[0.18em]">Date</th>
                    <th className="py-2 pr-3 font-mono text-[0.6rem] uppercase tracking-[0.18em]">Delegates</th>
                    <th className="py-2 pr-3 font-mono text-[0.6rem] uppercase tracking-[0.18em]">Approved</th>
                    <th className="py-2 pr-3 font-mono text-[0.6rem] uppercase tracking-[0.18em]">Need transport</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.arrivalSlots.map((slot) => (
                    <tr key={slot.raw} className="border-b border-[var(--line)]/50 last:border-b-0">
                      <td className="py-2.5 pr-3 font-medium text-[var(--text)]">{slot.date}</td>
                      <td className="py-2.5 pr-3 font-display text-lg text-[var(--accent)]">{slot.count}</td>
                      <td className="py-2.5 pr-3 text-[var(--muted)]">{slot.approved}</td>
                      <td className="py-2.5 pr-3 text-[var(--muted)]">{slot.transport}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="surface-glass p-5 sm:p-7">
          <PanelHeader label="Latest activity" title="Recent registrations" />
          <ul className="mt-3 space-y-2.5">
            {registrations.slice(0, 6).map((r) => (
              <li key={r.id} className="flex items-center gap-3 rounded-xl border border-[var(--line)] bg-[rgba(12,6,8,0.4)] p-3">
                <div className="h-9 w-9 flex-shrink-0 overflow-hidden rounded-lg border border-[var(--line-strong)] bg-black">
                  {r.passportPhoto ? (
                    <img src={r.passportPhoto} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-[var(--muted-2)] text-[10px] font-mono">N/A</div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-[var(--text)]">{composeFullName(r)}</p>
                  <p className="truncate text-[11px] text-[var(--muted)]">
                    {r.diocese || r.otherAffiliation || '—'} · {formatDateTime(r.createdAt)}
                  </p>
                </div>
                <StatusBadge status={r.status} compact />
              </li>
            ))}
            {!loading && registrations.length === 0 ? (
              <li className="text-sm text-[var(--muted)]">No registrations yet.</li>
            ) : null}
          </ul>
        </div>
      </section>

      {/* Row 5: Top dioceses + Title breakdown */}
      <section className="grid gap-4 lg:grid-cols-3">
        <div className="surface-glass p-5 sm:p-7 lg:col-span-2">
          <PanelHeader label="Top dioceses" title="Highest turnout by diocese" />
          {analytics.dioceses.length === 0 ? (
            <p className="mt-3 text-sm text-[var(--muted)]">No submissions yet.</p>
          ) : (
            <ul className="mt-3 space-y-1.5">
              {analytics.dioceses.slice(0, 10).map((d) => {
                const pct = Math.round((d.count / Math.max(1, analytics.totals.total)) * 100);
                return (
                  <li key={d.name} className="flex items-center gap-3">
                    <span className="w-44 truncate text-sm text-[var(--text)]">{d.name}</span>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-[rgba(224,178,90,0.08)]">
                      <div className="h-full rounded-full bg-[var(--accent)]" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="font-display text-lg text-[var(--accent)]">{d.count}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="surface-glass p-5 sm:p-7">
          <PanelHeader label="Title breakdown" title="Who is coming" />
          <dl className="mt-3 space-y-2">
            <TitleRow label="Archbishops / Primates" value={analytics.titles.archbishop} />
            <TitleRow label="Bishops" value={analytics.titles.bishop} />
            <TitleRow label="Clergy (deans, canons, etc.)" value={analytics.titles.clergy} />
            <TitleRow label="Lay / Faculty" value={analytics.titles.lay} />
          </dl>
        </div>
      </section>

      {/* Row 6: Report builder */}
      <ReportBuilder registrations={filtered} filter={reportFilter} setFilter={setReportFilter} />
    </div>
  );
}

function PageHeader({ analytics }) {
  return (
    <header className="space-y-3">
      <p className="eyebrow">Secretariat overview</p>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="display-heading text-3xl leading-[0.95] text-[var(--text)] sm:text-4xl lg:text-5xl">
            Planning <span className="display-yellow">console.</span>
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-[var(--muted)]">
            Live picture of the {DNDN_FACTS.name} registration pipeline. Pickups, accommodation, accreditation, and the planning
            report — all in one place.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="tag"><Bus className="h-3 w-3" /> {analytics.totals.needTransport} pickups needed</span>
          <span className="tag"><Plane className="h-3 w-3" /> {analytics.travelModes.find((m) => m.name === 'Air')?.value || 0} by air</span>
        </div>
      </div>
    </header>
  );
}

function PanelHeader({ label, title }) {
  return (
    <div>
      <p className="eyebrow">{label}</p>
      <h2 className="display-heading mt-1.5 text-xl text-[var(--text)]">{title}.</h2>
    </div>
  );
}

function EmptyChart() {
  return (
    <div className="mt-3 flex h-48 items-center justify-center rounded-xl border border-dashed border-[var(--line)] text-sm text-[var(--muted)]">
      No data yet.
    </div>
  );
}

function TitleRow({ label, value }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-[var(--line)] bg-[rgba(12,6,8,0.4)] px-3.5 py-2.5">
      <dt className="text-xs text-[var(--muted)]">{label}</dt>
      <dd className="font-display text-xl text-[var(--accent)]">{value}</dd>
    </div>
  );
}

/* -------------------------------------------------------------------------
   Report builder — filter registrations, print, export CSV.
   ------------------------------------------------------------------------- */
function ReportBuilder({ registrations, filter, setFilter }) {
  const [showReport, setShowReport] = useState(false);

  const handlePrint = () => {
    setShowReport(true);
    /* Defer print until the print-only markup is in the DOM. */
    setTimeout(() => {
      window.print();
    }, 80);
  };

  const handleExport = () => {
    const stamp = new Date().toISOString().slice(0, 10);
    const fname = `episcopal_consultation_report_${stamp}.csv`;
    downloadRegistrationsCsv(registrations, fname);
  };

  return (
    <section className="surface-glass p-5 sm:p-7 print:hidden">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">Reports</p>
          <h2 className="display-heading mt-1.5 text-2xl text-[var(--text)]">Generate a planning report.</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">
            Filter by province or approval status, then print a clean PDF-ready report or export the same data as CSV.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={handleExport} className="secondary-button">
            <Download className="h-4 w-4" /> Export CSV
          </button>
          <button type="button" onClick={handlePrint} className="primary-button">
            <Printer className="h-4 w-4" /> Print report
          </button>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <label className="block">
          <span className="field-label">Province</span>
          <select
            value={filter.province}
            onChange={(event) => setFilter((f) => ({ ...f, province: event.target.value }))}
            className="field-select"
          >
            <option value="">All provinces</option>
            {PROVINCE_OPTIONS.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="field-label">Status</span>
          <select
            value={filter.status}
            onChange={(event) => setFilter((f) => ({ ...f, status: event.target.value }))}
            className="field-select"
          >
            <option value="">All statuses</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Declined">Declined</option>
          </select>
        </label>
        <div className="rounded-xl border border-[var(--line)] bg-[rgba(12,6,8,0.4)] p-3.5">
          <p className="eyebrow">Matching records</p>
          <p className="display-heading mt-1 text-2xl text-[var(--accent)]">{registrations.length}</p>
        </div>
      </div>

      {showReport ? <PrintableReport registrations={registrations} onClose={() => setShowReport(false)} /> : null}
    </section>
  );
}

function PrintableReport({ registrations, onClose }) {
  return (
    <div className="print-root mt-6 hidden print:block">
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .print-root, .print-root * { visibility: visible; }
          .print-root { position: absolute; inset: 0; padding: 1.5cm; color: #000; background: #fff; }
          .print-root h1, .print-root h2, .print-root h3, .print-root p, .print-root td, .print-root th { color: #000 !important; }
        }
      `}</style>
      <div className="rounded-xl border border-black/20 bg-white p-6 text-black">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold">Episcopal Consultation — Planning Report</h1>
            <p className="text-sm">Generated {formatDateTime(new Date())} by secretariat</p>
          </div>
          <button type="button" onClick={onClose} className="rounded border border-black/30 px-3 py-1 text-xs text-black">
            Close
          </button>
        </div>
        <h2 className="mt-5 text-lg font-semibold">Delegate list ({registrations.length})</h2>
        <table className="mt-2 w-full border-collapse text-xs">
          <thead>
            <tr className="border-b border-black/30">
              <th className="py-1 pr-2 text-left">Title</th>
              <th className="py-1 pr-2 text-left">Name</th>
              <th className="py-1 pr-2 text-left">Position</th>
              <th className="py-1 pr-2 text-left">Province</th>
              <th className="py-1 pr-2 text-left">Diocese</th>
              <th className="py-1 pr-2 text-left">Arrival</th>
              <th className="py-1 pr-2 text-left">Mode</th>
              <th className="py-1 pr-2 text-left">Transport?</th>
              <th className="py-1 pr-2 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {registrations.map((r) => (
              <tr key={r.id} className="border-b border-black/10">
                <td className="py-1 pr-2">{r.title || '—'}</td>
                <td className="py-1 pr-2">{[r.firstName, r.lastName].filter(Boolean).join(' ') || '—'}</td>
                <td className="py-1 pr-2">{r.position || '—'}</td>
                <td className="py-1 pr-2">{r.province || '—'}</td>
                <td className="py-1 pr-2">{r.diocese || '—'}</td>
                <td className="py-1 pr-2">{r.dateOfArrival || '—'}</td>
                <td className="py-1 pr-2">{r.modeOfTravel || '—'}</td>
                <td className="py-1 pr-2">{r.requireInternalTransport || 'No'}</td>
                <td className="py-1 pr-2">{r.status || 'Pending'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
