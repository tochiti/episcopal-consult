import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { Link, useOutletContext } from 'react-router-dom';
import StatusBadge from '../../components/StatusBadge';

export default function AdminRegistrations() {
  const { registrations, loading } = useOutletContext();
  const [query, setQuery] = useState('');

  const filteredRegistrations = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return registrations;
    return registrations.filter((registration) =>
      [
        registration.title,
        registration.fullName,
        registration.position,
        registration.diocese,
        registration.province,
        registration.emailAddress,
        registration.whatsappNumber,
      ]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(term))
    );
  }, [query, registrations]);

  return (
    <div className="space-y-8">
      <header className="space-y-4">
        <p className="eyebrow">Registrations</p>
        <div>
          <h1 className="font-serif text-5xl leading-none text-slate-950 sm:text-6xl">Registration list.</h1>
          <p className="mt-4 max-w-3xl text-sm leading-8 text-slate-600 sm:text-base">
            Search, scan, and open a full record when you need more detail.
          </p>
        </div>
      </header>

      <section className="surface-soft p-4 sm:p-5">
        <label className="block">
          <span className="field-label">Search registrations</span>
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by name, email, diocese, or phone"
              className="field-input pl-11"
            />
          </div>
        </label>
      </section>

      <section className="surface-card overflow-hidden">
        <div className="block lg:hidden">
          {loading ? (
            <div className="p-6 text-sm text-slate-500">Loading registrations...</div>
          ) : filteredRegistrations.length === 0 ? (
            <div className="p-6 text-sm text-slate-500">No registrations found.</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredRegistrations.map((registration) => (
                <Link
                  key={registration.id}
                  to={`/admin/registrations/${registration.id}`}
                  className="block px-5 py-5 transition hover:bg-slate-50"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-slate-900">{registration.title} {registration.fullName}</p>
                      <p className="mt-1 truncate text-sm text-slate-500">{registration.position} · {registration.diocese}</p>
                    </div>
                    <StatusBadge status={registration.status} compact />
                  </div>
                </Link>
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
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5" className="px-7 py-10 text-center text-slate-500">Loading registrations...</td></tr>
              ) : filteredRegistrations.length === 0 ? (
                <tr><td colSpan="5" className="px-7 py-10 text-center text-slate-500">No registrations found.</td></tr>
              ) : (
                filteredRegistrations.map((registration) => (
                  <tr key={registration.id} className="border-b border-slate-100 align-top transition hover:bg-slate-50/60">
                    <td colSpan="5" className="p-0">
                      <Link to={`/admin/registrations/${registration.id}`} className="grid gap-0 lg:grid-cols-[1.4fr_1.3fr_0.9fr_0.9fr_0.7fr]">
                        <div className="px-7 py-6">
                          <p className="font-semibold text-slate-900">{registration.title} {registration.fullName}</p>
                          <p className="mt-1 text-slate-500">{registration.position}</p>
                          <p className="mt-2 text-xs uppercase tracking-[0.2em] text-slate-400">{registration.diocese} · {registration.province}</p>
                        </div>
                        <div className="px-7 py-6">
                          <p className="font-medium text-slate-800">{registration.whatsappNumber}</p>
                          <p className="mt-1 text-slate-500">{registration.emailAddress}</p>
                        </div>
                        <div className="px-7 py-6">
                          <p className="font-medium text-slate-800">{registration.modeOfTravel || 'Not provided'}</p>
                          <p className="mt-1 text-slate-500">{registration.dateOfArrival || 'No arrival date'}</p>
                        </div>
                        <div className="px-7 py-6 text-slate-500">{registration.createdAt?.toDate ? registration.createdAt.toDate().toLocaleDateString() : 'Not recorded'}</div>
                        <div className="px-7 py-6">
                          <StatusBadge status={registration.status} compact />
                        </div>
                      </Link>
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
