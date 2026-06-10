import { useState } from 'react';
import { ArrowLeft, Calendar, Search, TicketCheck, Mail, Phone, MapPin, Plane, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getRegistrationByEmail } from '../db';
import PublicFooter from '../components/PublicFooter';
import StatusBadge from '../components/StatusBadge';
import { composeFullName, formatDate, formatDateTime, normalizeStatus, PROGRAMME_DATES } from '../lib/registrations';

function Ornament({ tone = 'gold' }) {
  const color = tone === 'gold' ? 'var(--accent)' : 'rgba(224,178,90,0.35)';
  return (
    <div className="flex items-center justify-center gap-3" aria-hidden>
      <span className="h-px w-12 sm:w-20" style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }} />
      <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden>
        <path d="M7 0v14M0 7h14" stroke={color} strokeWidth="1" />
      </svg>
      <span className="h-px w-12 sm:w-20" style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }} />
    </div>
  );
}

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
      <span
        className="hero-blob"
        style={{ top: '-12%', left: '50%', transform: 'translateX(-50%)', width: 600, height: 600, background: 'radial-gradient(circle, rgba(224,178,90,0.10), transparent 65%)' }}
        aria-hidden
      />

      <header className="absolute inset-x-0 top-0 z-30">
        <div className="shell-container flex items-center justify-between gap-3 py-5 sm:py-6">
          <Link to="/" className="flex items-center gap-3">
            <img src="/logo.png" alt="Diocese of Niger Delta North" className="logo" />
            <div className="hidden sm:block">
              <p className="eyebrow">Episcopal Consultation</p>
              <p className="text-[0.95rem] font-semibold leading-tight text-[var(--text-bright)]">Registration Portal</p>
            </div>
          </Link>
          <Link to="/" className="ghost-link">
            <ArrowLeft className="h-4 w-4" /> Back to homepage
          </Link>
        </div>
      </header>

      <main className="relative z-10 pt-28 sm:pt-32">
        <div className="shell-container max-w-6xl">
          {/* Editorial hero */}
          <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
            <Ornament />
            <p className="eyebrow mt-7">Status lookup</p>
            <h1 className="display-heading mt-3 text-[2.5rem] leading-[0.95] sm:text-[4.5rem]">
              Find your <span className="display-accent">record.</span>
            </h1>
            <p className="mt-4 inline-flex items-center gap-2 rounded-full border border-[var(--line-strong)] bg-[rgba(224,178,90,0.06)] px-3.5 py-1.5 font-mono text-[0.58rem] font-bold uppercase tracking-[0.24em] text-[var(--accent)]">
              <Calendar className="h-3.5 w-3.5" />
              {PROGRAMME_DATES.displayUpper}
            </p>
            <p className="mt-4 max-w-md text-[15px] leading-7 text-[var(--muted)] sm:text-base">
              Enter the email address you used during registration. The system returns the latest record
              matching that email.
            </p>
          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-[420px_minmax(0,1fr)] lg:items-start">
            {/* Lookup card */}
            <section className="surface-glass self-start p-6 sm:p-8">
              <p className="eyebrow">Lookup</p>
              <h2 className="display-heading mt-2 text-2xl text-[var(--text-bright)]">Search by email.</h2>
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
                <button type="submit" disabled={loading} className="primary-button w-full py-3.5">
                  {loading ? 'Searching…' : 'Check my record'}
                  {!loading ? <Search className="h-4 w-4" /> : null}
                </button>
              </form>

              {error ? (
                <div className="mt-4 rounded-xl border border-[rgba(229,119,135,0.32)] bg-[rgba(229,119,135,0.10)] p-4 text-sm text-[var(--err)]">
                  {error}
                </div>
              ) : null}

              <div className="mt-5 flex items-start gap-2 rounded-xl border border-[var(--line)] bg-[rgba(12,6,8,0.4)] p-3.5 text-xs text-[var(--muted)]">
                <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[var(--accent)]" />
                Use the same email that was on the registration form.
              </div>

              <div className="mt-5 border-t border-[var(--line)] pt-5">
                <p className="eyebrow">New here?</p>
                <Link to="/register" className="ghost-link mt-2 text-[var(--accent)]">
                  Open the registration form <span className="font-display">→</span>
                </Link>
              </div>
            </section>

            {/* Result card */}
            <section className="surface-glass min-h-[28rem] p-6 sm:p-8">
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
      </main>

      <PublicFooter />
    </div>
  );
}

function EmptyState({ icon, title, copy, action }) {
  return (
    <div className="flex h-full min-h-[24rem] w-full flex-col items-center justify-center text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-[var(--line-strong)] bg-[rgba(224,178,90,0.08)] text-[var(--accent)]">
        {icon}
      </div>
      <h3 className="display-heading mt-6 text-2xl text-[var(--text-bright)] sm:text-3xl">{title}.</h3>
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
                <User className="h-5 w-5" />
              </div>
            )}
          </div>
          <div>
            <p className="eyebrow">Latest record</p>
            <h3 className="display-heading mt-1.5 text-2xl text-[var(--text-bright)] sm:text-3xl">
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
      <p className="mt-2 text-sm font-medium text-[var(--text-bright)]">{value || '—'}</p>
    </div>
  );
}
