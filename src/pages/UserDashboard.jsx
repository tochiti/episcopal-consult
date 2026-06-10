import { useState } from 'react';
import { ArrowLeft, Search, TicketCheck, Mail, Phone, MapPin, Plane, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getRegistrationByEmail } from '../db';
import PublicFooter from '../components/PublicFooter';
import StatusBadge from '../components/StatusBadge';
import { composeFullName, formatDate, formatDateTime, normalizeStatus } from '../lib/registrations';

export default function UserDashboard() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (event) => {
    event.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setSearched(true);
    setError('');
    try {
      const registration = await getRegistrationByEmail(email);
      setResult(registration || null);
    } catch (lookupError) {
      console.error(lookupError);
      setError('There was a problem checking your status. Please try again.');
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const status = normalizeStatus(result?.status);

  return (
    <div className="page-shell relative">
      <div className="shell-container relative z-10 max-w-6xl py-8 sm:py-10">
        <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Link to="/" className="ghost-link">
              <ArrowLeft className="h-4 w-4" /> Back to homepage
            </Link>
            <p className="eyebrow mt-5">Status lookup</p>
            <h1 className="display-heading mt-2 text-4xl leading-[0.95] text-[var(--text)] sm:text-5xl lg:text-6xl">
              Find your <span className="display-yellow">record.</span>
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--muted)] sm:text-base">
              Enter the email address you used during registration. The system returns the latest record matching that email.
            </p>
          </div>
          <div className="surface-soft p-4 sm:max-w-xs">
            <p className="eyebrow">New registration?</p>
            <Link to="/register" className="ghost-link mt-2 text-[var(--accent)]">
              Open registration form <span className="font-display">→</span>
            </Link>
          </div>
        </header>

        <div className="page-section grid gap-6 lg:grid-cols-[420px_minmax(0,1fr)]">
          <section className="surface-glass self-start p-6 sm:p-8">
            <p className="eyebrow">Lookup</p>
            <h2 className="display-heading mt-2 text-2xl">Search by email.</h2>
            <form onSubmit={handleSearch} className="mt-5 space-y-4">
              <label className="block">
                <span className="field-label">Email Address</span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="name@example.com"
                  className="field-input"
                  autoComplete="email"
                />
              </label>
              <button type="submit" disabled={loading} className="primary-button w-full">
                {loading ? 'Searching…' : 'Check my record'}
                {!loading ? <Search className="h-4 w-4" /> : null}
              </button>
            </form>

            {error ? (
              <div className="mt-4 rounded-xl border border-[rgba(229,119,135,0.32)] bg-[rgba(229,119,135,0.10)] p-4 text-sm text-[var(--err)]">
                {error}
              </div>
            ) : null}

            <p className="mt-5 flex items-start gap-2 text-xs text-[var(--muted)]">
              <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[var(--accent)]" />
              Use the same email that was on the registration form.
            </p>
          </section>

          <section className="surface-glass flex min-h-[28rem] items-stretch p-6 sm:p-8">
            {!searched ? (
              <EmptyState
                icon={<TicketCheck className="h-7 w-7" />}
                title="Awaiting lookup"
                copy="Search with the registration email and the latest record will appear here."
              />
            ) : result ? (
              <RecordCard result={result} status={status} />
            ) : (
              <EmptyState
                icon={<Search className="h-7 w-7" />}
                title="No record found"
                copy="Check the email for typos, or submit a new registration."
                action={
                  <Link to="/register" className="secondary-button mt-5">Go to registration</Link>
                }
              />
            )}
          </section>
        </div>
      </div>
      <PublicFooter />
    </div>
  );
}

function EmptyState({ icon, title, copy, action }) {
  return (
    <div className="flex w-full flex-col items-center justify-center text-center">
      <div className="icon-chip h-16 w-16 rounded-2xl bg-[rgba(224,178,90,0.10)] text-[var(--accent)]">
        {icon}
      </div>
      <h3 className="display-heading mt-6 text-3xl">{title}.</h3>
      <p className="mt-3 max-w-md text-sm leading-7 text-[var(--muted)]">{copy}</p>
      {action}
    </div>
  );
}

function RecordCard({ result, status }) {
  return (
    <div className="w-full">
      <div className="flex flex-col gap-4 border-b border-[var(--line)] pb-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl border border-[var(--line-strong)] bg-black">
            {result.passportPhoto ? (
              <img src={result.passportPhoto} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-[var(--muted-2)]">
                <TicketCheck className="h-5 w-5" />
              </div>
            )}
          </div>
          <div>
            <p className="eyebrow">Latest record</p>
            <h3 className="display-heading mt-1.5 text-2xl text-[var(--text)] sm:text-3xl">
              {composeFullName(result)}
            </h3>
            <p className="mt-1 text-sm text-[var(--muted)]">
              {result.position || '—'} · Submitted {formatDateTime(result.createdAt)}
            </p>
          </div>
        </div>
        <StatusBadge status={status} />
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <Detail icon={MapPin} label="Province" value={result.province} />
        <Detail icon={MapPin} label="Diocese" value={result.diocese} />
        <Detail icon={Mail} label="Email" value={result.emailAddress} />
        <Detail icon={Phone} label="WhatsApp" value={result.whatsappNumber} />
        <Detail icon={Calendar} label="Date of Arrival" value={formatDate(result.dateOfArrival)} />
        <Detail icon={Plane} label="Mode of Travel" value={result.modeOfTravel || '—'} />
        <Detail icon={TicketCheck} label="Internal Transport" value={result.requireInternalTransport || 'No'} />
        <Detail icon={TicketCheck} label="Driver / Escort" value={result.comingWithDriverEscort || 'No'} />
      </div>

      {result.comingWithDriverEscort === 'Yes' ? (
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <Detail label="Driver's Name" value={result.driverName || '—'} />
          <Detail label="Driver's Phone" value={result.driverPhoneNumber || '—'} />
          <Detail label="Escort's Name" value={result.escortName || '—'} />
          <Detail label="Escort's Phone" value={result.escortPhoneNumber || '—'} />
        </div>
      ) : null}
    </div>
  );
}

function Detail({ icon: Icon, label, value }) {
  return (
    <div className="rounded-xl border border-[var(--line)] bg-[rgba(12,6,8,0.4)] p-3.5">
      <div className="flex items-center justify-between">
        <p className="eyebrow">{label}</p>
        {Icon ? <Icon className="h-3.5 w-3.5 text-[var(--accent)]" /> : null}
      </div>
      <p className="mt-2 text-sm font-medium text-[var(--text)]">{value || '—'}</p>
    </div>
  );
}
