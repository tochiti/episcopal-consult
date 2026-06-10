import { ArrowLeft, ArrowRight, BedDouble, Car, Crown, Mail, MapPin, Phone, Plane, ShieldCheck, TicketCheck, Trash2, User } from 'lucide-react';
import { Link, Navigate, useOutletContext, useParams } from 'react-router-dom';
import AdminPageHeader from '../../components/AdminPageHeader';
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

  const status = normalizeStatus(registration.status);

  return (
    <div className="space-y-6 pb-8">
      <Link
        to="/admin/registrations"
        className="inline-flex items-center gap-1.5 font-mono text-[0.6rem] font-bold uppercase tracking-[0.22em] text-[var(--muted-2)] transition hover:text-[var(--accent)]"
      >
        <ArrowLeft className="h-3 w-3" /> Back to registrations
      </Link>

      {/* Hero header — passport photo, name, batch ref, status */}
      <section className="surface-glass relative overflow-hidden p-6 sm:p-8 lg:p-10">
        <span
          aria-hidden
          className="absolute -right-16 -top-16 h-56 w-56 rounded-full opacity-30 blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(224,178,90,0.6), transparent 70%)' }}
        />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-5">
            <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-2xl border border-[var(--line-strong)] bg-black sm:h-28 sm:w-28">
              {registration.passportPhoto ? (
                <img src={registration.passportPhoto} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-[var(--muted-2)]">
                  <User className="h-8 w-8" />
                </div>
              )}
            </div>
            <div className="min-w-0">
              <p className="eyebrow">Delegate record</p>
              <h1 className="display-heading mt-2 text-3xl leading-[0.95] text-[var(--text-bright)] sm:text-4xl lg:text-5xl">
                {composeFullName(registration) || 'Unnamed delegate'}
              </h1>
              <p className="mt-2 text-sm text-[var(--muted)]">
                {registration.position || '—'}
                <span className="mx-2 text-[var(--muted-2)]">·</span>
                Submitted {formatDateTime(registration.createdAt)}
              </p>
              {registration.batchId ? (
                <p className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-[var(--line-strong)] bg-[rgba(224,178,90,0.06)] px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--accent)]">
                  Batch · {registration.batchId}
                </p>
              ) : null}
            </div>
          </div>
          <div className="flex flex-col items-start gap-3 lg:items-end">
            <StatusBadge status={status} />
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted-2)]">
              ID · {registration.id?.slice(0, 8).toUpperCase() || '—'}
            </span>
          </div>
        </div>
      </section>

      {/* Detail body — sections on the left, actions on the right */}
      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-5">
          <DetailSection
            eyebrow="01"
            title="Identity"
            items={[
              { label: 'Title', value: registration.title, icon: ShieldCheck },
              { label: 'First name', value: registration.firstName },
              { label: 'Surname', value: registration.lastName },
              { label: 'Position / Office', value: registration.position },
              { label: 'Other affiliation', value: registration.otherAffiliation },
            ]}
          />
          <DetailSection
            eyebrow="02"
            title="Province & Diocese"
            items={[
              { label: 'Province', value: registration.province, icon: MapPin },
              { label: 'Diocese', value: registration.diocese || registration.otherAffiliation, icon: MapPin },
            ]}
          />
          <DetailSection
            eyebrow="03"
            title="Contact"
            items={[
              { label: 'Email', value: registration.emailAddress, icon: Mail, mono: true },
              { label: 'WhatsApp', value: registration.whatsappNumber, icon: Phone, mono: true },
            ]}
          />
          <DetailSection
            eyebrow="04"
            title="Travel"
            items={[
              { label: 'Date of arrival', value: formatDate(registration.dateOfArrival), icon: Plane },
              { label: 'Mode of travel', value: registration.modeOfTravel, icon: Plane },
              { label: 'Internal transport', value: registration.requireInternalTransport || 'No', icon: Car },
              { label: 'Driver / Escort', value: registration.comingWithDriverEscort || 'No', icon: Crown },
            ]}
          />
          {registration.comingWithDriverEscort === 'Yes' ? (
            <DetailSection
              eyebrow="05"
              title="Companion details"
              items={[
                { label: "Driver's name", value: registration.driverName },
                { label: "Driver's phone", value: registration.driverPhoneNumber, mono: true },
                { label: "Escort's name", value: registration.escortName },
                { label: "Escort's phone", value: registration.escortPhoneNumber, mono: true },
              ]}
            />
          ) : null}
        </div>

        <aside className="space-y-4">
          {/* Status update card */}
          <div className="surface-glass p-5 sm:p-6">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--line-strong)] bg-[rgba(95,185,138,0.10)] text-[var(--ok)]">
                <TicketCheck className="h-4 w-4" />
              </div>
              <div>
                <p className="eyebrow">Approval</p>
                <p className="mt-0.5 text-sm font-semibold text-[var(--text-bright)]">Update status</p>
              </div>
            </div>
            <label className="mt-4 block">
              <span className="field-label">Decision</span>
              <select
                value={status}
                onChange={(event) => handleStatusChange(registration.id, event.target.value)}
                className="field-select"
              >
                <option value="Pending">Pending review</option>
                <option value="Approved">Approved</option>
                <option value="Declined">Declined</option>
              </select>
            </label>
            <p className="mt-3 flex items-start gap-2 text-[11px] leading-5 text-[var(--muted-2)]">
              <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-[var(--accent)]" />
              Status changes are visible to the delegate when they look up their record by email.
            </p>
          </div>

          {/* Quick handoff card */}
          <div className="surface-glass p-5 sm:p-6">
            <p className="eyebrow">Hand off to operations</p>
            <p className="mt-2 text-sm font-semibold text-[var(--text-bright)]">Once approved, push to:</p>
            <div className="mt-4 space-y-2">
              <HandoffLink to="/admin/badges" icon={ShieldCheck} title="Badges" note="Print accreditation" />
              <HandoffLink to="/admin/accommodation" icon={BedDouble} title="Accommodation" note="Assign room" />
              <HandoffLink to="/admin/transport" icon={Car} title="Transport" note="Schedule pickup" />
              <HandoffLink to="/admin/protocol" icon={Crown} title="Protocol" note="Brief the team" />
            </div>
          </div>

          {/* Danger zone */}
          <div className="surface-glass p-5 sm:p-6">
            <p className="eyebrow">Danger zone</p>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
              Deleting this record cannot be undone. Use this only for duplicates or test data.
            </p>
            <button
              onClick={() => handleDelete(registration.id)}
              className="secondary-button mt-4 w-full justify-center border-[rgba(229,119,135,0.32)] text-[var(--err)] hover:border-[var(--err)] hover:bg-[rgba(229,119,135,0.10)]"
            >
              <Trash2 className="h-4 w-4" /> Delete this record
            </button>
          </div>
        </aside>
      </section>
    </div>
  );
}

function DetailSection({ eyebrow, title, items }) {
  return (
    <section className="surface-glass p-5 sm:p-7">
      <div className="mb-4 flex items-end justify-between gap-3">
        <div>
          <p className="eyebrow">{title}</p>
        </div>
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--muted-2)]">
          STEP {eyebrow}
        </span>
      </div>
      <dl className="grid gap-3 sm:grid-cols-2">
        {items.map(({ label, value, icon: Icon, mono }) => (
          <div key={label} className="rounded-xl border border-[var(--line)] bg-[rgba(12,6,8,0.4)] p-3.5">
            <div className="flex items-center justify-between gap-2">
              <dt className="eyebrow">{label}</dt>
              {Icon ? <Icon className="h-3.5 w-3.5 text-[var(--accent)]" /> : null}
            </div>
            <dd className={`mt-1.5 text-sm leading-7 text-[var(--text-bright)] ${mono ? 'font-mono' : 'font-medium'}`}>
              {value || '—'}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function HandoffLink({ to, icon: Icon, title, note }) {
  return (
    <Link
      to={to}
      className="group flex items-center gap-3 rounded-xl border border-[var(--line)] bg-[rgba(12,6,8,0.4)] p-3 transition hover:border-[var(--accent)] hover:bg-[rgba(224,178,90,0.05)]"
    >
      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border border-[var(--line-strong)] bg-[rgba(224,178,90,0.08)] text-[var(--accent)]">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-[var(--text-bright)]">{title}</p>
        <p className="text-[11px] text-[var(--muted-2)]">{note}</p>
      </div>
      <ArrowRight className="h-3.5 w-3.5 text-[var(--muted-2)] transition group-hover:translate-x-0.5 group-hover:text-[var(--accent)]" />
    </Link>
  );
}
