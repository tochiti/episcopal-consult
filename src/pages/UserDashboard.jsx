import { useState } from 'react';
import { ArrowLeft, MailSearch, Search, ShieldCheck, TicketCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getRegistrationByEmail } from '../db';
import StatusBadge from '../components/StatusBadge';
import { DNDN_FACTS, formatDate, formatDateTime, normalizeStatus } from '../lib/registrations';

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
    <div className="page-shell px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      <div className="mx-auto max-w-6xl">
        <section className="overflow-hidden rounded-[2rem] border border-white/70 bg-[linear-gradient(135deg,rgba(33,24,47,0.97),rgba(74,49,93,0.94))] px-6 py-8 text-white shadow-[0_28px_80px_-38px_rgba(17,24,39,0.75)] sm:px-8 lg:px-10">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-white/72 transition hover:text-white">
                <ArrowLeft className="h-4 w-4" />
                Back to registration
              </Link>
              <div className="mt-6 flex items-center gap-4">
                <img src="/logo.png" alt="DNDN logo" className="h-16 w-16 rounded-full bg-white p-2" />
                <div>
                  <p className="section-label text-amber-300">Public dashboard</p>
                  <h1 className="mt-2 font-serif text-4xl text-white sm:text-5xl">Track your consultation status.</h1>
                </div>
              </div>
              <p className="mt-6 max-w-2xl text-base leading-8 text-white/78">
                Use the same email address from your registration to view your current review status, arrival details, and
                the record held by the DNDN host team.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              <div className="rounded-3xl border border-white/15 bg-white/10 p-5 backdrop-blur">
                <MailSearch className="h-5 w-5 text-amber-300" />
                <p className="mt-3 font-semibold">Email lookup</p>
                <p className="mt-2 text-sm leading-7 text-white/72">Search is private and tied only to the address you entered earlier.</p>
              </div>
              <div className="rounded-3xl border border-white/15 bg-white/10 p-5 backdrop-blur">
                <ShieldCheck className="h-5 w-5 text-amber-300" />
                <p className="mt-3 font-semibold">Review states</p>
                <p className="mt-2 text-sm leading-7 text-white/72">Pending, Approved, and Declined are shown exactly as the admin dashboard records them.</p>
              </div>
            </div>
          </div>
        </section>

        <div className="mt-8 grid gap-8 lg:grid-cols-[0.88fr_1.12fr]">
          <section className="glass-panel p-6 sm:p-8">
            <p className="section-label">Status checker</p>
            <h2 className="mt-3 font-serif text-3xl text-slate-950">Find your registration</h2>
            <p className="mt-3 text-sm leading-7 text-slate-500">
              Enter the same email address used during registration. If a match exists, the latest submission record will appear.
            </p>

            <form onSubmit={handleSearch} className="mt-6 space-y-4">
              <label>
                <span className="field-label">Email Address</span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="name@example.com"
                  className="field-input"
                />
              </label>
              <button type="submit" disabled={loading} className="primary-button w-full">
                {loading ? 'Searching...' : 'Check my status'}
                {!loading ? <Search className="h-4 w-4" /> : null}
              </button>
            </form>

            {error ? <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">{error}</div> : null}

            <div className="mt-6 rounded-[1.75rem] border border-slate-100 bg-slate-50 p-5">
              <p className="text-sm font-semibold text-slate-800">What you will see</p>
              <ul className="mt-3 space-y-2 text-sm leading-7 text-slate-500">
                <li>Current review status</li>
                <li>Arrival date and travel mode</li>
                <li>Transport and escort details if supplied</li>
              </ul>
            </div>
          </section>

          <section className="glass-panel p-6 sm:p-8">
            {!searched ? (
              <div className="flex min-h-[24rem] flex-col items-center justify-center text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                  <TicketCheck className="h-7 w-7" />
                </div>
                <h3 className="mt-6 font-serif text-3xl text-slate-950">Awaiting your email lookup</h3>
                <p className="mt-3 max-w-md text-sm leading-7 text-slate-500">
                  Once you search, your latest registration will appear here with its current workflow status and recorded travel details.
                </p>
              </div>
            ) : result ? (
              <div>
                <div className="flex flex-col gap-4 border-b border-slate-100 pb-6 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="section-label">Latest registration record</p>
                    <h3 className="mt-3 font-serif text-3xl text-slate-950">
                      {result.title} {result.fullName}
                    </h3>
                    <p className="mt-2 text-sm text-slate-500">
                      Submitted {formatDateTime(result.createdAt)} · {result.position}
                    </p>
                  </div>
                  <StatusBadge status={status} />
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <DetailCard label="Diocese" value={result.diocese} />
                  <DetailCard label="Province" value={result.province} />
                  <DetailCard label="Email" value={result.emailAddress} />
                  <DetailCard label="WhatsApp" value={result.whatsappNumber} />
                  <DetailCard label="Arrival date" value={formatDate(result.dateOfArrival)} />
                  <DetailCard label="Travel mode" value={result.modeOfTravel || 'Not provided'} />
                  <DetailCard label="Internal transport" value={result.requireInternalTransport || 'No'} />
                  <DetailCard label="Driver or escort" value={result.comingWithDriverEscort || 'No'} />
                </div>

                {result.comingWithDriverEscort === 'Yes' ? (
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <DetailCard label="Driver's name" value={result.driverName || 'Not provided'} />
                    <DetailCard label="Escort's name" value={result.escortName || 'Not provided'} />
                  </div>
                ) : null}

                <div className="mt-6 rounded-[1.75rem] border border-amber-100 bg-amber-50/80 p-5 text-sm leading-7 text-amber-900">
                  {status === 'Approved'
                    ? 'Your registration has been approved. Keep checking for any direct logistics communication from the host team.'
                    : status === 'Declined'
                      ? 'Your registration is marked declined. If you believe this is an error, contact the consultation administrator.'
                      : 'Your registration is still under review. Please check back later using the same email address.'}
                </div>
              </div>
            ) : (
              <div className="flex min-h-[24rem] flex-col items-center justify-center text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-rose-100 text-rose-700">
                  <Search className="h-7 w-7" />
                </div>
                <h3 className="mt-6 font-serif text-3xl text-slate-950">No registration found</h3>
                <p className="mt-3 max-w-md text-sm leading-7 text-slate-500">
                  We could not match that email to a submitted record. Check for spelling errors or return to the registration form.
                </p>
                <Link to="/" className="secondary-button mt-6">Return to registration</Link>
              </div>
            )}
          </section>
        </div>

        <section className="mt-8 glass-panel p-6 sm:p-8">
          <p className="section-label">Host information</p>
          <h2 className="mt-3 font-serif text-3xl text-slate-950">{DNDN_FACTS.name}</h2>
          <p className="mt-3 max-w-4xl text-sm leading-8 text-slate-600">
            This status portal supports consultation coordination for the diocese within the Niger Delta Province. It reflects
            the registration record currently held by the host team connected with {DNDN_FACTS.cathedral} and the episcopal
            leadership of {DNDN_FACTS.bishop}.
          </p>
        </section>
      </div>
    </div>
  );
}

function DetailCard({ label, value }) {
  return (
    <div className="rounded-[1.5rem] border border-slate-100 bg-slate-50/80 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">{label}</p>
      <p className="mt-2 text-sm font-medium text-slate-900">{value}</p>
    </div>
  );
}
