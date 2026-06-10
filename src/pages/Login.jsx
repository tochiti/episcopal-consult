import { useState } from 'react';
import { LockKeyhole, ShieldCheck, ArrowLeft } from 'lucide-react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../firebase';

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
    <div className="page-shell relative flex items-center py-10">
      <span className="hero-blob" style={{ top: '-12%', left: '-8%', width: 460, height: 460, background: 'radial-gradient(circle, rgba(224,178,90,0.18), transparent 70%)' }} aria-hidden />
      <span className="hero-blob" style={{ bottom: '-18%', right: '-8%', width: 520, height: 520, background: 'radial-gradient(circle, rgba(110,29,42,0.55), transparent 70%)' }} aria-hidden />

      <div className="shell-container relative z-10 max-w-5xl">
        <div className="grid gap-6 lg:grid-cols-[0.88fr_1.12fr]">
          <section className="surface-glass relative overflow-hidden p-8 lg:p-10">
            <p className="eyebrow">Secretariat sign-in</p>
            <h1 className="display-heading mt-3 text-3xl leading-[0.95] sm:text-4xl">
              Administrative <span className="display-yellow">console.</span>
            </h1>
            <p className="mt-4 text-sm leading-7 text-[var(--muted)]">
              Review delegate submissions, update approval status, monitor arrival flow, and export the planning report.
              Restricted to the host diocese secretariat and authorised Provincial Secretaries.
            </p>
            <div className="mt-8 flex items-center gap-3 rounded-xl border border-[var(--line)] bg-[rgba(12,6,8,0.5)] p-4">
              <img src="/logo.png" alt="DNDN" className="h-11 w-11 rounded-full bg-[var(--text)] p-1.5 shadow-sm" />
              <div>
                <p className="font-display text-lg leading-none text-[var(--text)]">Episcopal Consult DNDN</p>
                <p className="mt-1 text-xs text-[var(--muted)]">Secretariat console</p>
              </div>
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              <span className="tag">Firebase auth</span>
              <span className="tag">Restricted access</span>
            </div>
          </section>

          <section className="surface-glass p-6 sm:p-8 lg:p-10">
            <Link to="/" className="ghost-link">
              <ArrowLeft className="h-4 w-4" /> Back to homepage
            </Link>
            <h2 className="display-heading mt-6 text-3xl text-[var(--text)] sm:text-4xl">Sign in.</h2>
            <p className="mt-3 text-sm leading-7 text-[var(--muted)]">Use the credentials issued by the secretariat.</p>

            {error ? (
              <div className="mt-6 rounded-xl border border-[rgba(229,119,135,0.32)] bg-[rgba(229,119,135,0.10)] p-4 text-sm text-[var(--err)]">
                {error}
              </div>
            ) : null}

            <form onSubmit={handleLogin} className="mt-8 space-y-5">
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
              <button type="submit" disabled={isLoading} className="primary-button mt-3 w-full">
                {isLoading ? 'Signing in…' : 'Sign in to console'}
                {!isLoading ? <LockKeyhole className="h-4 w-4" /> : null}
              </button>
            </form>

            <div className="mt-8 flex items-start gap-3 rounded-xl border border-[var(--line)] bg-[rgba(12,6,8,0.4)] p-4">
              <ShieldCheck className="mt-0.5 h-4 w-4 flex-shrink-0 text-[var(--accent)]" />
              <p className="text-xs leading-5 text-[var(--muted)]">
                Sessions are handled by Firebase Authentication. Always sign out on shared devices. Lost access? Contact the
                system administrator.
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
