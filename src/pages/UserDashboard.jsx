import { useState } from 'react';
import { ArrowLeft, Search, TicketCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getRegistrationByEmail } from '../db';
import PublicFooter from '../components/PublicFooter';
import StatusBadge from '../components/StatusBadge';
import { formatDate, formatDateTime, normalizeStatus } from '../lib/registrations';

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
    <div className="page-shell py-6 sm:py-8 lg:py-10">
      <div className="shell-container max-w-6xl">
        <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Link to="/" className="ghost-link">
              <ArrowLeft className="h-4 w-4" />
              Back to homepage
            </Link>
            <p className="eyebrow mt-6">Status dashboard</p>
            <h1 className="mt-3 font-serif text-5xl leading-none text-slate-950 sm:text-6xl">Check your registration status.</h1>
            <p className="mt-4 max-w-2xl text-sm leading-8 text-slate-600 sm:text-base">Use the same email address from registration.</p>
          </div>
          <div className="surface-soft p-4 sm:max-w-xs">
            <p className="text-sm font-semibold text-slate-900">New registration?</p>
            <Link to="/register" className="ghost-link mt-3">Open registration form</Link>
          </div>
        </header>

        <div className="page-section grid gap-6 lg:grid-cols-[420px_minmax(0,1fr)]">
          <section className="surface-card self-start p-6 sm:p-8">
            <p className="eyebrow">Lookup</p>
            <h2 className="mt-3 text-2xl font-semibold text-slate-950">Find your latest record</h2>
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
              <div className="h-1" />
              <button type="submit" disabled={loading} className="primary-button w-full">
                {loading ? 'Searching...' : 'Check my status'}
                {!loading ? <Search className="h-4 w-4" /> : null}
              </button>
            </form>

            {error ? <div className="mt-4 rounded-[1.25rem] border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">{error}</div> : null}

            <div className="mt-6 text-sm text-slate-500">Search with the same email used for registration.</div>
          </section>

          <section className="surface-card flex min-h-[28rem] items-stretch p-6 sm:p-8">
            {!searched ? (
              <div className="flex w-full flex-col items-center justify-center text-center">
                <div className="icon-chip h-16 w-16 rounded-full bg-slate-950 text-white">
                  <TicketCheck className="h-7 w-7" />
                </div>
                <h3 className="mt-6 font-serif text-4xl text-slate-950">Awaiting lookup</h3>
                <p className="mt-3 max-w-md text-sm leading-7 text-slate-500">
                  Search with your registration email and the latest status record will appear here.
                </p>
              </div>
            ) : result ? (
              <div className="w-full">
                <div className="flex flex-col gap-4 border-b border-slate-100 pb-6 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="eyebrow">Latest registration</p>
                    <h3 className="mt-3 font-serif text-4xl text-slate-950">{result.title} {result.fullName}</h3>
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
              </div>
            ) : (
              <div className="flex w-full flex-col items-center justify-center text-center">
                <div className="icon-chip h-16 w-16 rounded-full bg-orange-100 text-orange-600">
                  <Search className="h-7 w-7" />
                </div>
                <h3 className="mt-6 font-serif text-4xl text-slate-950">No record found</h3>
                <p className="mt-3 max-w-md text-sm leading-7 text-slate-500">Check for typos or return to registration.</p>
                <Link to="/register" className="secondary-button mt-6">Go to registration</Link>
              </div>
            )}
          </section>
        </div>
      </div>
      <PublicFooter />
    </div>
  );
}

function DetailCard({ label, value }) {
  return (
    <div className="surface-soft p-4">
      <p className="eyebrow">{label}</p>
      <p className="mt-3 text-sm font-medium text-slate-900">{value}</p>
    </div>
  );
}
