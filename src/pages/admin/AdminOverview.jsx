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
  Award,
  BedDouble,
  Bus,
  Car,
  CheckCircle2,
  Crown,
  Plane,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { Link, useOutletContext } from 'react-router-dom';
import InsightCard from '../../components/InsightCard';
import StatusBadge from '../../components/StatusBadge';
import { composeDiocese, composeFullName, DNDN_FACTS, formatDateTime } from '../../lib/registrations';

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

  return (
    <div className="space-y-6 sm:space-y-8">
      <PageHeader analytics={analytics} />

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <InsightCard icon={Users} label="Total delegates" value={analytics.totals.total} note={`${analytics.vip.archbishop} archbishops · ${analytics.vip.dignitary} dignitaries`} accent="bg-[rgba(224,178,90,0.10)] text-[var(--accent)]" />
        <InsightCard icon={CheckCircle2} label="Approved" value={analytics.totals.approved} note={`${analytics.totals.pending} pending review`} accent="bg-[rgba(95,185,138,0.10)] text-[var(--ok)]" />
        <InsightCard icon={BedDouble} label="Accommodation" value={analytics.totals.withAccommodation} note={`${analytics.totals.total - analytics.totals.withAccommodation} still to assign`} accent="bg-[rgba(224,178,90,0.10)] text-[var(--accent)]" />
        <InsightCard icon={ShieldCheck} label="Declined" value={analytics.totals.declined} note={`${analytics.totals.withoutPassport} missing passport`} accent="bg-[rgba(229,119,135,0.10)] text-[var(--err)]" />
      </section>

      {/* Quick action tiles — the four operational systems */}
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <ActionTile
          to="/admin/badges"
          icon={Award}
          title="Print badges"
          copy="Generate accreditation badges for approved delegates. Two per A4 sheet."
          count={`${analytics.totals.approved} approved`}
        />
        <ActionTile
          to="/admin/accommodation"
          icon={BedDouble}
          title="Allocate rooms"
          copy="Assign hotels and rooms to delegates. Track capacity per venue."
          count={`${analytics.totals.withAccommodation}/${analytics.totals.total} assigned`}
        />
        <ActionTile
          to="/admin/transport"
          icon={Car}
          title="Schedule pickups"
          copy="Match vehicles and drivers to arrival dates. Confirm pickups on the day."
          count={`${analytics.totals.needTransport} pickup requests`}
        />
        <ActionTile
          to="/admin/protocol"
          icon={Crown}
          title="Protocol briefing"
          copy="Flag VIPs, capture dietary needs and special requirements. Print a briefing pack."
          count={`${analytics.vip.archbishop + analytics.vip.dignitary + analytics.vip.special} VIPs`}
        />
      </section>

      {/* Charts row */}
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
                <YAxis type="category" dataKey="name" tickLine={false} axisLine={false} stroke="rgba(243,234,218,0.7)" fontSize={11} width={140} />
                <Tooltip {...tooltipStyle} cursor={{ fill: 'rgba(224,178,90,0.05)' }} />
                <Bar dataKey="count" radius={[0, 6, 6, 0]} fill="#e0b25a" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* Arrival + travel row */}
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

      {/* Arrival slots table + recent activity */}
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
                    <th className="py-2 pr-3 font-mono text-[0.58rem] uppercase tracking-[0.18em]">Date</th>
                    <th className="py-2 pr-3 font-mono text-[0.58rem] uppercase tracking-[0.18em]">Delegates</th>
                    <th className="py-2 pr-3 font-mono text-[0.58rem] uppercase tracking-[0.18em]">Approved</th>
                    <th className="py-2 pr-3 font-mono text-[0.58rem] uppercase tracking-[0.18em]">Need transport</th>
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
                    <div className="flex h-full w-full items-center justify-center text-[10px] font-mono text-[var(--muted-2)]">N/A</div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-[var(--text)]">{composeFullName(r)}</p>
                  <p className="truncate text-[11px] text-[var(--muted)]">
                    {composeDiocese(r) || '—'} · {formatDateTime(r.createdAt)}
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
    </div>
  );
}

function PageHeader({ analytics }) {
  return (
    <header className="space-y-3">
      <p className="eyebrow">Secretariat overview</p>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="display-heading text-3xl leading-[1.02] text-[var(--text)] sm:text-4xl lg:text-5xl">
            Planning <span className="display-yellow">console.</span>
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-[var(--muted)]">
            Live picture of the {DNDN_FACTS.name} registration pipeline. Print badges, allocate rooms, schedule pickups, and
            brief the protocol team.
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

function ActionTile({ to, icon: Icon, title, copy, count }) {
  return (
    <Link
      to={to}
      className="surface-glass group flex flex-col gap-3 p-5 transition hover:border-[var(--accent)]"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="icon-chip bg-[rgba(224,178,90,0.10)] text-[var(--accent)]">
          <Icon className="h-4 w-4" />
        </div>
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--accent)]">{count}</span>
      </div>
      <div>
        <h3 className="display-heading text-lg text-[var(--text)] group-hover:text-[var(--accent)]">{title}.</h3>
        <p className="mt-1 text-xs leading-5 text-[var(--muted)]">{copy}</p>
      </div>
      <span className="mt-auto font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted-2)]">Open →</span>
    </Link>
  );
}
