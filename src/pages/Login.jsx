import { useState } from 'react';
import { Calendar, ShieldCheck, LogIn } from 'lucide-react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { DNDN_FACTS, PROGRAMME_DATES } from '../lib/registrations';
import PublicLayout from '../components/PublicLayout';

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

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/admin');
    } catch (loginError) {
      console.error(loginError);
      setError('Invalid email or password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PublicLayout>
      <div className="page-shell relative">
        <span className="hero-blob" style={{ top: '-12%', left: '-8%', width: 460, height: 460, background: 'radial-gradient(circle, rgba(224,178,90,0.18), transparent 70%)' }} aria-hidden />
        <span className="hero-blob" style={{ bottom: '-18%', right: '-8%', width: 520, height: 520, background: 'radial-gradient(circle, rgba(110,29,42,0.55), transparent 70%)' }} aria-hidden />

        <main className="relative z-10 pt-6 sm:pt-10 lg:pt-12">
          <div className="shell-container max-w-5xl">
            {/* Editorial hero */}
            <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
              <Ornament />
              <p className="eyebrow mt-7">Secretariat sign-in</p>
              <h1 className="display-heading mt-3 text-[2.5rem] leading-[0.95] sm:text-[4.5rem]">
                Administrative <span className="display-accent">console.</span>
              </h1>
              <p className="mt-4 inline-flex items-center gap-2 rounded-full border border-[var(--line-strong)] bg-[rgba(224,178,90,0.06)] px-3.5 py-1.5 font-mono text-[0.58rem] font-bold uppercase tracking-[0.24em] text-[var(--accent)]">
                <Calendar className="h-3.5 w-3.5" />
                {PROGRAMME_DATES.displayUpper}
              </p>
              <p className="mt-4 max-w-lg text-[15px] leading-7 text-[var(--muted)] sm:text-base">
                Review delegate submissions, update approval status, monitor arrival flow, and export the
                planning report. Restricted to the host diocese secretariat and authorised Provincial Secretaries.
              </p>
            </div>

            <div className="mt-12 grid gap-6 lg:grid-cols-[0.88fr_1.12fr] lg:items-start">
              {/* Left column — context + seal */}
              <section className="surface-glass relative overflow-hidden p-6 sm:p-8 lg:p-10">
                <span
                  aria-hidden
                  className="absolute -right-12 -top-12 h-44 w-44 rounded-full opacity-30 blur-2xl"
                  style={{ background: 'radial-gradient(circle, rgba(224,178,90,0.6), transparent 70%)' }}
                />
                <div className="relative">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[var(--line-strong)] bg-[rgba(224,178,90,0.08)] text-[var(--accent)]">
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="eyebrow">Host diocese</p>
                      <p className="mt-1 text-[15px] font-semibold text-[var(--text-bright)]">{DNDN_FACTS.name}</p>
                    </div>
                  </div>
                  <p className="display-heading mt-6 text-2xl sm:text-3xl text-[var(--text-bright)]">
                    Operational systems
                  </p>
                  <ul className="mt-5 space-y-3 text-sm leading-6 text-[var(--muted)]">
                    {[
                      ['Registrations', 'Delegate list & approval status.'],
                      ['Badges', 'Printable badge sheets, A4.'],
                      ['Accommodation', 'Hotels, rooms, check-in dates.'],
                      ['Transport', 'Vehicles, drivers, pickup dates.'],
                      ['Protocol', 'VIP levels, dietary, special needs.'],
                      ['Reports', 'Filtered exports and print reports.'],
                    ].map(([title, copy]) => (
                      <li key={title} className="flex items-start gap-2.5">
                        <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[var(--accent)]" />
                        <span><span className="text-[var(--text-bright)] font-semibold">{title}</span> — {copy}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </section>

              {/* Right column — sign-in form */}
              <section className="surface-glass p-6 sm:p-8 lg:p-10">
                <p className="eyebrow">Sign in</p>
                <h2 className="display-heading mt-2 text-2xl text-[var(--text-bright)] sm:text-3xl">Use the secretariat credentials.</h2>

                {error ? (
                  <div className="mt-5 flex items-start gap-2.5 rounded-xl border border-[rgba(229,119,135,0.32)] bg-[rgba(229,119,135,0.10)] p-4 text-sm text-[var(--err)]">
                    <ShieldCheck className="mt-0.5 h-4 w-4 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                ) : null}

                <form onSubmit={handleLogin} className="mt-7 space-y-5">
                  <label className="block">
                    <span className="field-label">Email</span>
                    <input
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      required
                      placeholder="secretariat@dndn.org"
                      className="field-input"
                      autoComplete="email"
                    />
                  </label>
                  <label className="block">
                    <span className="field-label">Password</span>
                    <input
                      type="password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      required
                      placeholder="••••••••"
                      className="field-input"
                      autoComplete="current-password"
                    />
                  </label>
                  <button type="submit" disabled={isLoading} className="primary-button mt-3 w-full py-3.5">
                    {isLoading ? 'Signing in…' : 'Sign in to console'}
                    {!isLoading ? <LogIn className="h-4 w-4" /> : null}
                  </button>
                </form>

                <div className="mt-7 flex items-start gap-3 rounded-xl border border-[var(--line)] bg-[rgba(12,6,8,0.4)] p-4">
                  <ShieldCheck className="mt-0.5 h-4 w-4 flex-shrink-0 text-[var(--accent)]" />
                  <p className="text-xs leading-5 text-[var(--muted)]">
                    Sessions are handled by Firebase Authentication. Always sign out on shared devices. Lost access?
                    Contact the system administrator.
                  </p>
                </div>
              </section>
            </div>
          </div>
        </main>
      </div>
    </PublicLayout>
  );
}
