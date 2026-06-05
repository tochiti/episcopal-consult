import { useEffect, useMemo, useState } from 'react';
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
import {
  Bus,
  CheckCircle2,
  Download,
  LogOut,
  MapPinned,
  ShieldCheck,
  Trash2,
  UserRoundCheck,
  Users,
} from 'lucide-react';
import { signOut } from 'firebase/auth';
import InsightCard from '../components/InsightCard';
import StatusBadge from '../components/StatusBadge';
import { auth } from '../firebase';
import { deleteRegistration, getRegistrations, updateRegistrationStatus } from '../db';
import {
  DNDN_FACTS,
  downloadRegistrationsCsv,
  formatDate,
  formatDateTime,
  normalizeStatus,
  summarizeRegistrations,
} from '../lib/registrations';

export default function AdminDashboard() {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [messageTone, setMessageTone] = useState('default');

  async function fetchData() {
    try {
      const data = await getRegistrations();
      setRegistrations(data);
    } catch (error) {
      console.error(error);
      setMessage('Could not load registrations.');
      setMessageTone('error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void fetchData();
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  const analytics = useMemo(() => summarizeRegistrations(registrations), [registrations]);

  const setFeedback = (copy, tone = 'default') => {
    setMessage(copy);
    setMessageTone(tone);
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateRegistrationStatus(id, newStatus);
      setRegistrations((current) =>
        current.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
      );
      setFeedback(`Registration status updated to ${newStatus}.`, 'success');
    } catch (error) {
      console.error(error);
      setFeedback('Could not update registration status.', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this registration record? This action cannot be undone.')) return;
    try {
      await deleteRegistration(id);
      setRegistrations((current) => current.filter((item) => item.id !== id));
      setFeedback('Registration deleted successfully.', 'success');
    } catch (error) {
      console.error(error);
      setFeedback('Could not delete registration.', 'error');
    }
  };

  const handleExportCSV = () => {
    downloadRegistrationsCsv(registrations);
    setFeedback('CSV export started.', 'success');
  };

  const messageClassName =
    messageTone === 'error'
      ? 'border-rose-200 bg-rose-50 text-rose-800'
      : messageTone === 'success'
        ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
        : 'border-slate-200 bg-slate-50 text-slate-700';

  return (
    <div className="page-shell px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      <div className="mx-auto max-w-7xl">
        <section className="overflow-hidden rounded-[2rem] border border-white/70 bg-[linear-gradient(135deg,rgba(33,24,47,0.98),rgba(74,49,93,0.92))] px-6 py-8 text-white shadow-[0_28px_90px_-38px_rgba(17,24,39,0.8)] sm:px-8 lg:px-10">
          <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
            <div>
              <div className="flex items-center gap-4">
                <img src="/logo.png" alt="DNDN logo" className="h-16 w-16 rounded-full bg-white p-2" />
                <div>
                  <p className="section-label text-amber-300">Admin dashboard</p>
                  <h1 className="mt-2 font-serif text-4xl text-white sm:text-5xl">Episcopal Consult DNDN analytics and operations.</h1>
                </div>
              </div>
              <p className="mt-6 max-w-3xl text-base leading-8 text-white/78">
                Review registrations, monitor travel demand, manage status decisions, and export a clean consultation record
                for the Diocese of Niger Delta North.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <span className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium">
                  {registrations.length} registrations
                </span>
                <span className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium">
                  {DNDN_FACTS.cathedral}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
              <button onClick={handleExportCSV} className="secondary-button border-white/10 bg-white/10 text-white hover:bg-white/16">
                <Download className="h-4 w-4" />
                Export CSV
              </button>
              <button
                onClick={() => signOut(auth)}
                className="secondary-button border-white/10 bg-transparent text-white hover:bg-white/10"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </div>
          </div>
        </section>

        {message ? <div className={`mt-6 rounded-2xl border p-4 text-sm ${messageClassName}`}>{message}</div> : null}

        <section className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <InsightCard
            icon={Users}
            label="Total Registrations"
            value={analytics.totals.total}
            note="All submitted records"
            accent="bg-slate-100 text-slate-700"
          />
          <InsightCard
            icon={CheckCircle2}
            label="Approved"
            value={analytics.totals.approved}
            note={`${analytics.totals.pending} pending review`}
            accent="bg-emerald-100 text-emerald-700"
          />
          <InsightCard
            icon={Bus}
            label="Need Transport"
            value={analytics.totals.transport}
            note={`${analytics.totals.escorts} arriving with driver or escort`}
            accent="bg-amber-100 text-amber-700"
          />
          <InsightCard
            icon={ShieldCheck}
            label="Declined"
            value={analytics.totals.declined}
            note="Visible in public status lookup"
            accent="bg-rose-100 text-rose-700"
          />
        </section>

        <section className="mt-8 grid gap-8 xl:grid-cols-[1.05fr_0.95fr]">
          <div className="glass-panel p-6 sm:p-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="section-label">Status mix</p>
                <h2 className="mt-3 font-serif text-3xl text-slate-950">Review outcomes</h2>
              </div>
              <StatusBadge status="Pending" compact />
            </div>
            <div className="mt-6 grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analytics.statusChart}
                      dataKey="count"
                      nameKey="name"
                      innerRadius={54}
                      outerRadius={88}
                      paddingAngle={3}
                    >
                      {analytics.statusChart.map((entry) => (
                        <Cell key={entry.name} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-3">
                {analytics.statusChart.map((item) => (
                  <div key={item.name} className="rounded-[1.5rem] border border-slate-100 bg-slate-50/80 p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <span className="h-3 w-3 rounded-full" style={{ backgroundColor: item.fill }} />
                        <p className="font-semibold text-slate-900">{item.name}</p>
                      </div>
                      <p className="text-2xl font-semibold text-slate-950">{item.count}</p>
                    </div>
                  </div>
                ))}
                <div className="rounded-[1.5rem] border border-slate-100 bg-slate-50/80 p-4 text-sm leading-7 text-slate-500">
                  Public lookup reflects these same statuses, so admin changes are visible immediately to registrants.
                </div>
              </div>
            </div>
          </div>

          <div className="glass-panel p-6 sm:p-8">
            <p className="section-label">Travel demand</p>
            <h2 className="mt-3 font-serif text-3xl text-slate-950">Arrival planning and travel mode split</h2>
            <div className="mt-6 h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.travelModes}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} />
                  <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Bar dataKey="value" radius={[16, 16, 0, 0]} fill="#c59e2b" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <MiniStat label="Internal transport requests" value={analytics.totals.transport} />
              <MiniStat label="With driver or escort" value={analytics.totals.escorts} />
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-8 xl:grid-cols-[0.92fr_1.08fr]">
          <div className="glass-panel p-6 sm:p-8">
            <p className="section-label">Submission pulse</p>
            <h2 className="mt-3 font-serif text-3xl text-slate-950">Arrival dates and recent activity</h2>

            <div className="mt-6 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.arrivals}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="date" tickLine={false} axisLine={false} />
                  <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Bar dataKey="count" radius={[14, 14, 0, 0]} fill="#4a315d" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-6 space-y-3">
              {registrations.slice(0, 5).map((registration) => (
                <div key={registration.id} className="flex items-center justify-between gap-4 rounded-[1.5rem] border border-slate-100 bg-slate-50/70 p-4">
                  <div>
                    <p className="font-semibold text-slate-900">{registration.title} {registration.fullName}</p>
                    <p className="text-sm text-slate-500">
                      {registration.diocese} · {formatDateTime(registration.createdAt)}
                    </p>
                  </div>
                  <StatusBadge status={registration.status} compact />
                </div>
              ))}
              {!loading && registrations.length === 0 ? <p className="text-sm text-slate-500">No registrations yet.</p> : null}
            </div>
          </div>

          <div className="glass-panel p-6 sm:p-8">
            <p className="section-label">Top dioceses</p>
            <h2 className="mt-3 font-serif text-3xl text-slate-950">Where registrations are coming from</h2>
            <div className="mt-6 space-y-3">
              {analytics.dioceses.map((item) => (
                <div key={item.name} className="rounded-[1.5rem] border border-slate-100 bg-slate-50/70 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
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

        <section className="mt-8 glass-panel overflow-hidden">
          <div className="flex flex-col gap-4 border-b border-slate-100 p-6 sm:flex-row sm:items-end sm:justify-between sm:p-8">
            <div>
              <p className="section-label">Registration records</p>
              <h2 className="mt-3 font-serif text-3xl text-slate-950">Manage delegate entries</h2>
            </div>
            <p className="text-sm text-slate-500">Desktop keeps a table view; mobile uses stacked record cards.</p>
          </div>

          <div className="block lg:hidden">
            {loading ? (
              <div className="p-6 text-sm text-slate-500">Loading registrations...</div>
            ) : registrations.length === 0 ? (
              <div className="p-6 text-sm text-slate-500">No registrations found.</div>
            ) : (
              <div className="grid gap-4 p-4 sm:p-6">
                {registrations.map((registration) => (
                  <article key={registration.id} className="rounded-[1.75rem] border border-slate-100 bg-slate-50/80 p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-semibold text-slate-900">{registration.title} {registration.fullName}</p>
                        <p className="mt-1 text-sm text-slate-500">{registration.position} · {registration.diocese}</p>
                      </div>
                      <StatusBadge status={registration.status} compact />
                    </div>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <RecordDetail label="Province" value={registration.province} />
                      <RecordDetail label="Contact" value={`${registration.whatsappNumber} · ${registration.emailAddress}`} />
                      <RecordDetail label="Arrival" value={formatDate(registration.dateOfArrival)} />
                      <RecordDetail label="Travel" value={registration.modeOfTravel || 'Not provided'} />
                      <RecordDetail label="Transport" value={registration.requireInternalTransport || 'No'} />
                      <RecordDetail label="Driver / Escort" value={registration.comingWithDriverEscort || 'No'} />
                    </div>
                    <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                      <select
                        value={normalizeStatus(registration.status)}
                        onChange={(event) => handleStatusChange(registration.id, event.target.value)}
                        className="field-input"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Approved">Approved</option>
                        <option value="Declined">Declined</option>
                      </select>
                      <button
                        onClick={() => handleDelete(registration.id)}
                        className="secondary-button border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete record
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>

          <div className="hidden overflow-x-auto lg:block">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-slate-100 bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-6 py-4 font-semibold">Delegate</th>
                  <th className="px-6 py-4 font-semibold">Contact</th>
                  <th className="px-6 py-4 font-semibold">Travel</th>
                  <th className="px-6 py-4 font-semibold">Submitted</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-slate-500">Loading registrations...</td>
                  </tr>
                ) : registrations.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-slate-500">No registrations found.</td>
                  </tr>
                ) : (
                  registrations.map((registration) => (
                    <tr key={registration.id} className="border-b border-slate-100 align-top hover:bg-slate-50/70">
                      <td className="px-6 py-5">
                        <p className="font-semibold text-slate-900">{registration.title} {registration.fullName}</p>
                        <p className="mt-1 text-slate-500">{registration.position}</p>
                        <p className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-400">{registration.diocese} · {registration.province}</p>
                      </td>
                      <td className="px-6 py-5">
                        <p className="font-medium text-slate-800">{registration.whatsappNumber}</p>
                        <p className="mt-1 text-slate-500">{registration.emailAddress}</p>
                      </td>
                      <td className="px-6 py-5">
                        <p className="font-medium text-slate-800">{registration.modeOfTravel || 'Not provided'}</p>
                        <p className="mt-1 text-slate-500">Arrival: {formatDate(registration.dateOfArrival)}</p>
                        <p className="mt-1 text-slate-500">Transport: {registration.requireInternalTransport || 'No'}</p>
                      </td>
                      <td className="px-6 py-5 text-slate-500">{formatDateTime(registration.createdAt)}</td>
                      <td className="px-6 py-5">
                        <select
                          value={normalizeStatus(registration.status)}
                          onChange={(event) => handleStatusChange(registration.id, event.target.value)}
                          className="rounded-2xl border border-slate-200 bg-white px-3 py-2 font-medium text-slate-700 outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-100"
                        >
                          <option value="Pending">Pending</option>
                          <option value="Approved">Approved</option>
                          <option value="Declined">Declined</option>
                        </select>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex justify-end">
                          <button
                            onClick={() => handleDelete(registration.id)}
                            className="inline-flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2 font-medium text-rose-700 transition hover:bg-rose-100"
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-8 glass-panel p-6 sm:p-8">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
              <UserRoundCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="section-label">Context</p>
              <h2 className="mt-2 font-serif text-3xl text-slate-950">{DNDN_FACTS.name}</h2>
            </div>
          </div>
          <p className="mt-4 max-w-4xl text-sm leading-8 text-slate-600">
            This dashboard is tailored to support episcopal consultation operations for the diocese within the Niger Delta
            Province. Exported records, public lookup states, and transport planning metrics all read from the same
            registration data set.
          </p>
        </section>
      </div>
    </div>
  );
}

function MiniStat({ label, value }) {
  return (
    <div className="rounded-[1.5rem] border border-slate-100 bg-slate-50/80 p-4">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-slate-950">{value}</p>
    </div>
  );
}

function RecordDetail({ label, value }) {
  return (
    <div className="rounded-[1.25rem] border border-slate-100 bg-white/80 p-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-medium text-slate-900">{value}</p>
    </div>
  );
}
