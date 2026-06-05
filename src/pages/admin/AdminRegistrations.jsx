import { Trash2 } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';
import StatusBadge from '../../components/StatusBadge';
import { formatDate, formatDateTime, normalizeStatus } from '../../lib/registrations';

export default function AdminRegistrations() {
  const { registrations, loading, handleDelete, handleStatusChange } = useOutletContext();

  return (
    <div className="space-y-8">
      <header className="space-y-4">
        <p className="eyebrow">Registrations</p>
        <div>
          <h1 className="font-serif text-5xl leading-none text-slate-950 sm:text-6xl">Manage delegate entries.</h1>
          <p className="mt-4 max-w-3xl text-sm leading-8 text-slate-600 sm:text-base">
            Review records, update approval status, and remove incorrect submissions.
          </p>
        </div>
      </header>

      <section className="surface-card overflow-hidden">
        <div className="block lg:hidden">
          {loading ? (
            <div className="p-6 text-sm text-slate-500">Loading registrations...</div>
          ) : registrations.length === 0 ? (
            <div className="p-6 text-sm text-slate-500">No registrations found.</div>
          ) : (
            <div className="grid gap-4 p-4 sm:p-6">
              {registrations.map((registration) => (
                <article key={registration.id} className="surface-soft p-5">
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
                  </div>
                  <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                    <select value={normalizeStatus(registration.status)} onChange={(event) => handleStatusChange(registration.id, event.target.value)} className="field-input">
                      <option value="Pending">Pending</option>
                      <option value="Approved">Approved</option>
                      <option value="Declined">Declined</option>
                    </select>
                    <button onClick={() => handleDelete(registration.id)} className="secondary-button border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100">
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
                <th className="px-7 py-5 font-semibold">Delegate</th>
                <th className="px-7 py-5 font-semibold">Contact</th>
                <th className="px-7 py-5 font-semibold">Travel</th>
                <th className="px-7 py-5 font-semibold">Submitted</th>
                <th className="px-7 py-5 font-semibold">Status</th>
                <th className="px-7 py-5 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" className="px-7 py-10 text-center text-slate-500">Loading registrations...</td></tr>
              ) : registrations.length === 0 ? (
                <tr><td colSpan="6" className="px-7 py-10 text-center text-slate-500">No registrations found.</td></tr>
              ) : (
                registrations.map((registration) => (
                  <tr key={registration.id} className="border-b border-slate-100 align-top hover:bg-slate-50/60">
                    <td className="px-7 py-6">
                      <p className="font-semibold text-slate-900">{registration.title} {registration.fullName}</p>
                      <p className="mt-1 text-slate-500">{registration.position}</p>
                      <p className="mt-2 text-xs uppercase tracking-[0.2em] text-slate-400">{registration.diocese} · {registration.province}</p>
                    </td>
                    <td className="px-7 py-6">
                      <p className="font-medium text-slate-800">{registration.whatsappNumber}</p>
                      <p className="mt-1 text-slate-500">{registration.emailAddress}</p>
                    </td>
                    <td className="px-7 py-6">
                      <p className="font-medium text-slate-800">{registration.modeOfTravel || 'Not provided'}</p>
                      <p className="mt-1 text-slate-500">Arrival: {formatDate(registration.dateOfArrival)}</p>
                      <p className="mt-1 text-slate-500">Transport: {registration.requireInternalTransport || 'No'}</p>
                    </td>
                    <td className="px-7 py-6 text-slate-500">{formatDateTime(registration.createdAt)}</td>
                    <td className="px-7 py-6">
                      <select
                        value={normalizeStatus(registration.status)}
                        onChange={(event) => handleStatusChange(registration.id, event.target.value)}
                        className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 font-medium text-slate-700 outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Approved">Approved</option>
                        <option value="Declined">Declined</option>
                      </select>
                    </td>
                    <td className="px-7 py-6">
                      <div className="flex justify-end">
                        <button onClick={() => handleDelete(registration.id)} className="secondary-button border-rose-200 bg-rose-50 px-4 py-2.5 text-rose-700 hover:bg-rose-100">
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
    </div>
  );
}

function RecordDetail({ label, value }) {
  return (
    <div className="surface-soft p-3">
      <p className="eyebrow">{label}</p>
      <p className="mt-2 text-sm font-medium text-slate-900">{value}</p>
    </div>
  );
}
