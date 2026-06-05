import { ArrowLeft, Trash2 } from 'lucide-react';
import { Link, Navigate, useOutletContext, useParams } from 'react-router-dom';
import StatusBadge from '../../components/StatusBadge';
import { formatDate, formatDateTime, normalizeStatus } from '../../lib/registrations';

export default function AdminRegistrationDetail() {
  const { registrationId } = useParams();
  const { registrations, loading, handleDelete, handleStatusChange } = useOutletContext();

  if (!loading && !registrations.find((registration) => registration.id === registrationId)) {
    return <Navigate to="/admin/registrations" replace />;
  }

  const registration = registrations.find((entry) => entry.id === registrationId);

  if (!registration) {
    return (
      <div className="space-y-6">
        <Link to="/admin/registrations" className="ghost-link">
          <ArrowLeft className="h-4 w-4" />
          Back to registrations
        </Link>
        <div className="surface-card p-8 text-sm text-slate-500">Loading registration details...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-8">
      <header className="space-y-4">
        <Link to="/admin/registrations" className="ghost-link">
          <ArrowLeft className="h-4 w-4" />
          Back to registrations
        </Link>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="eyebrow">Registration detail</p>
            <h1 className="mt-3 font-serif text-5xl leading-none text-slate-950 sm:text-6xl">
              {registration.title} {registration.fullName}
            </h1>
            <p className="mt-4 text-sm leading-8 text-slate-600">
              {registration.position} · Submitted {formatDateTime(registration.createdAt)}
            </p>
          </div>
          <StatusBadge status={registration.status} />
        </div>
      </header>

      <section className="grid gap-8 xl:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <DetailSection
            title="Identity"
            items={[
              ['Diocese', registration.diocese],
              ['Province', registration.province],
              ['Position', registration.position],
              ['Title', registration.title],
            ]}
          />
          <DetailSection
            title="Contact"
            items={[
              ['Email', registration.emailAddress],
              ['WhatsApp', registration.whatsappNumber],
            ]}
          />
          <DetailSection
            title="Travel"
            items={[
              ['Date of arrival', formatDate(registration.dateOfArrival)],
              ['Mode of travel', registration.modeOfTravel || 'Not provided'],
              ['Internal transport', registration.requireInternalTransport || 'No'],
              ['Driver / Escort', registration.comingWithDriverEscort || 'No'],
            ]}
          />
          {registration.comingWithDriverEscort === 'Yes' ? (
            <DetailSection
              title="Companion details"
              items={[
                ["Driver's name", registration.driverName || 'Not provided'],
                ["Driver's phone", registration.driverPhoneNumber || 'Not provided'],
                ["Escort's name", registration.escortName || 'Not provided'],
                ["Escort's phone", registration.escortPhoneNumber || 'Not provided'],
              ]}
            />
          ) : null}
        </div>

        <aside className="space-y-4">
          <div className="surface-card p-6 sm:p-7">
            <p className="eyebrow">Actions</p>
            <div className="mt-5 space-y-4">
              <label className="block">
                <span className="field-label">Status</span>
                <select
                  value={normalizeStatus(registration.status)}
                  onChange={(event) => handleStatusChange(registration.id, event.target.value)}
                  className="field-input"
                >
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="Declined">Declined</option>
                </select>
              </label>
              <button onClick={() => handleDelete(registration.id)} className="secondary-button w-full justify-center border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100">
                <Trash2 className="h-4 w-4" />
                Delete registration
              </button>
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}

function DetailSection({ title, items }) {
  return (
    <section className="surface-card p-6 sm:p-8">
      <p className="eyebrow">{title}</p>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {items.map(([label, value]) => (
          <div key={label} className="surface-soft p-4">
            <p className="eyebrow">{label}</p>
            <p className="mt-2 text-sm font-medium leading-7 text-slate-900">{value}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
