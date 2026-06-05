import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Bus, CheckCircle2, MapPinned, ShieldCheck, Users } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';
import InsightCard from '../../components/InsightCard';
import StatusBadge from '../../components/StatusBadge';
import { formatDateTime } from '../../lib/registrations';

export default function AdminOverview() {
  const { analytics, registrations, loading } = useOutletContext();

  return (
    <div className="space-y-8">
      <header className="space-y-4">
        <p className="eyebrow">Overview</p>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="font-serif text-5xl leading-none text-slate-950 sm:text-6xl">Registration operations and analytics.</h1>
            <p className="mt-4 max-w-3xl text-sm leading-8 text-slate-600 sm:text-base">
              Review activity, transport demand, and the current approval picture at a glance.
            </p>
          </div>
        </div>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <InsightCard icon={Users} label="Total Registrations" value={analytics.totals.total} note="All submitted records" accent="bg-slate-100 text-slate-700" />
        <InsightCard icon={CheckCircle2} label="Approved" value={analytics.totals.approved} note={`${analytics.totals.pending} pending review`} accent="bg-emerald-100 text-emerald-700" />
        <InsightCard icon={Bus} label="Need Transport" value={analytics.totals.transport} note={`${analytics.totals.escorts} with driver or escort`} accent="bg-orange-100 text-orange-700" />
        <InsightCard icon={ShieldCheck} label="Declined" value={analytics.totals.declined} note="Shown in public lookup" accent="bg-blue-100 text-blue-700" />
      </section>

      <section className="grid gap-8 xl:grid-cols-[1fr_1fr]">
        <div className="surface-card p-6 sm:p-8">
          <p className="eyebrow">Status mix</p>
          <h2 className="mt-3 text-2xl font-semibold text-slate-950">Review outcomes</h2>
          <div className="mt-6 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={analytics.statusChart} dataKey="count" nameKey="name" innerRadius={56} outerRadius={90} paddingAngle={3}>
                    {analytics.statusChart.map((entry) => <Cell key={entry.name} fill={entry.fill} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-3">
              {analytics.statusChart.map((item) => (
                <div key={item.name} className="surface-soft p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <span className="h-3 w-3 rounded-full" style={{ backgroundColor: item.fill }} />
                      <p className="font-semibold text-slate-900">{item.name}</p>
                    </div>
                    <p className="text-2xl font-semibold text-slate-950">{item.count}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="surface-card p-6 sm:p-8">
          <p className="eyebrow">Travel demand</p>
          <h2 className="mt-3 text-2xl font-semibold text-slate-950">Arrival planning and travel mode split</h2>
          <div className="mt-6 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.travelModes}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" tickLine={false} axisLine={false} />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
                <Tooltip />
                <Bar dataKey="value" radius={[14, 14, 0, 0]} fill="#111827" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <MiniStat label="Internal transport requests" value={analytics.totals.transport} />
            <MiniStat label="With driver or escort" value={analytics.totals.escorts} />
          </div>
        </div>
      </section>

      <section className="grid gap-8 xl:grid-cols-[0.96fr_1.04fr]">
        <div className="surface-card p-6 sm:p-8">
          <p className="eyebrow">Recent activity</p>
          <h2 className="mt-3 text-2xl font-semibold text-slate-950">Latest registrations</h2>
          <div className="mt-6 space-y-3">
            {registrations.slice(0, 5).map((registration) => (
              <div key={registration.id} className="surface-soft flex items-center justify-between gap-4 p-4">
                <div>
                  <p className="font-semibold text-slate-900">{registration.title} {registration.fullName}</p>
                  <p className="text-sm text-slate-500">{registration.diocese} · {formatDateTime(registration.createdAt)}</p>
                </div>
                <StatusBadge status={registration.status} compact />
              </div>
            ))}
            {!loading && registrations.length === 0 ? <p className="text-sm text-slate-500">No registrations yet.</p> : null}
          </div>
        </div>

        <div className="surface-card p-6 sm:p-8">
          <p className="eyebrow">Top dioceses</p>
          <h2 className="mt-3 text-2xl font-semibold text-slate-950">Where registrations are coming from</h2>
          <div className="mt-6 space-y-3">
            {analytics.dioceses.map((item) => (
              <div key={item.name} className="surface-soft p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-950 text-white">
                      <MapPinned className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{item.name}</p>
                      <p className="text-sm text-slate-500">Registrations from this diocese</p>
                    </div>
                  </div>
                  <p className="text-2xl font-semibold text-slate-950">{item.count}</p>
                </div>
              </div>
            ))}
            {!loading && analytics.dioceses.length === 0 ? <p className="text-sm text-slate-500">No diocese breakdown yet.</p> : null}
          </div>
        </div>
      </section>
    </div>
  );
}

function MiniStat({ label, value }) {
  return (
    <div className="surface-soft p-4">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-slate-950">{value}</p>
    </div>
  );
}
