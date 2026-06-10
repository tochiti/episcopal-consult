import { ArrowLeft, Trash2 } from 'lucide-react';
import { Link, Navigate, useOutletContext, useParams } from 'react-router-dom';
import StatusBadge from '../../components/StatusBadge';
import { composeFullName, formatDate, formatDateTime, normalizeStatus } from '../../lib/registrations';

export default function AdminRegistrationDetail() {
  const { registrationId } = useParams();
  const { registrations, loading, handleDelete, handleStatusChange } = useOutletContext();

  if (!loading && !registrations.find((r) => r.id === registrationId)) {
    return <Navigate to="/admin/registrations" replace />;
  }

  const registration = registrations.find((r) => r.id === registrationId);

  if (!registration) {
    return (
      <div className="space-y-4">
        <Link to="/admin/registrations" className="ghost-link">
          <ArrowLeft className="h-4 w-4" /> Back to registrations
        </Link>
        <div className="surface-glass p-8 text-sm text-[var(--muted)]">Loading record…</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      <Link to="/admin/registrations" className="ghost-link">
        <ArrowLeft className="h-4 w-4" /> Back to registrations
      </Link>

      <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-4">
          <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-2xl border border-[var(--line-strong)] bg-black sm:h-24 sm:w-24">
            {registration.passportPhoto ? (
              <img src={registration.passportPhoto} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xs text-[var(--muted-2)]">No photo</div>
            )}
          </div>
          <div>
            <p className="eyebrow">Delegate record</p>
            <h1 className="display-heading mt-2 text-3xl leading-[0.95] text-[var(--text)] sm:text-4xl lg:text-5xl">
              {composeFullName(registration) || 'Unnamed delegate'}
            </h1>
            <p className="mt-2 text-sm text-[var(--muted)]">
              {registration.position || '—'} · Submitted {formatDateTime(registration.createdAt)}
            </p>
            {registration.batchId ? (
              <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--muted-2)]">
                Batch: {registration.batchId}
              </p>
            ) : null}
          </div>
        </div>
        <StatusBadge status={registration.status} />
      </header>

      <section className="grid gap-6 xl:grid-cols-[1fr_320px]">
        <div className="space-y-5">
          <DetailSection
            title="Identity"
            items={[
              ['Title', registration.title || '—'],
              ['First name', registration.firstName || '—'],
              ['Surname', registration.lastName || '—'],
              ['Position / Office', registration.position || '—'],
              ['Other affiliation', registration.otherAffiliation || '—'],
            ]}
          />
          <DetailSection
            title="Province & Diocese"
            items={[
              ['Province', registration.province || '—'],
              ['Diocese', registration.diocese || '—'],
            ]}
          />
          <DetailSection
            title="Contact"
            items={[
              ['Email', registration.emailAddress || '—'],
              ['WhatsApp', registration.whatsappNumber || '—'],
            ]}
          />
          <DetailSection
            title="Travel"
            items={[
              ['Date of arrival', formatDate(registration.dateOfArrival)],
              ['Mode of travel', registration.modeOfTravel || '—'],
              ['Internal transport', registration.requireInternalTransport || 'No'],
              ['Driver / Escort', registration.comingWithDriverEscort || 'No'],
            ]}
          />
          {registration.comingWithDriverEscort === 'Yes' ? (
            <DetailSection
              title="Companion details"
              items={[
                ["Driver's name", registration.driverName || '—'],
                ["Driver's phone", registration.driverPhoneNumber || '—'],
                ["Escort's name", registration.escortName || '—'],
                ["Escort's phone", registration.escortPhoneNumber || '—'],
              ]}
            />
          ) : null}
        </div>

        <aside className="space-y-4">
          <div className="surface-glass p-6">
            <p className="eyebrow">Update status</p>
            <label className="mt-3 block">
              <span className="field-label">Approval</span>
              <select
                value={normalizeStatus(registration.status)}
                onChange={(event) => handleStatusChange(registration.id, event.target.value)}
                className="field-select"
              >
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Declined">Declined</option>
              </select>
            </label>
            <p className="mt-3 text-[11px] text-[var(--muted-2)]">
              Status changes are visible to the delegate when they look up their record by email.
            </p>
          </div>
          <div className="surface-glass p-6">
            <p className="eyebrow">Danger zone</p>
            <button
              onClick={() => handleDelete(registration.id)}
              className="secondary-button mt-3 w-full justify-center border-[rgba(229,119,135,0.32)] text-[var(--err)] hover:border-[var(--err)] hover:bg-[rgba(229,119,135,0.10)]"
            >
              <Trash2 className="h-4 w-4" /> Delete this record
            </button>
          </div>
        </aside>
      </section>
    </div>
  );
}

function DetailSection({ title, items }) {
  return (
    <section className="surface-glass p-5 sm:p-7">
      <p className="eyebrow">{title}</p>
      <dl className="mt-4 grid gap-3 sm:grid-cols-2">
        {items.map(([label, value]) => (
          <div key={label} className="rounded-xl border border-[var(--line)] bg-[rgba(12,6,8,0.4)] p-3.5">
            <dt className="eyebrow">{label}</dt>
            <dd className="mt-1.5 text-sm font-medium leading-7 text-[var(--text)]">{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
