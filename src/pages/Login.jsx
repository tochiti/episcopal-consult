import { useState } from 'react';
import { LockKeyhole } from 'lucide-react';
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
    <div className="page-shell flex items-center py-6 sm:py-8 lg:py-10">
      <div className="shell-container max-w-5xl">
        <div className="grid gap-8 lg:grid-cols-[0.88fr_1.12fr]">
          <section className="surface-soft p-8 lg:p-10">
            <p className="eyebrow">Admin access</p>
            <h1 className="mt-3 font-serif text-5xl leading-none text-slate-950">Operational access for the consultation team.</h1>
            <p className="mt-4 text-sm leading-8 text-slate-600">
              Sign in to review registrations, update approval status, monitor analytics, and export records.
            </p>
            <div className="mt-8 flex items-center gap-3">
              <img src="/logo.png" alt="DNDN logo" className="h-12 w-12 rounded-full bg-white p-1.5 shadow-sm" />
              <div>
                <p className="text-sm font-semibold text-slate-900">Episcopal Consult DNDN</p>
                <p className="text-sm text-slate-500">Admin dashboard</p>
              </div>
            </div>
          </section>

          <section className="surface-card p-6 sm:p-8 lg:p-10">
            <Link to="/" className="ghost-link">Back to homepage</Link>
            <h2 className="mt-6 text-3xl font-semibold text-slate-950">Sign in</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">Use your admin credentials.</p>

            {error ? <div className="mt-6 rounded-[1.25rem] border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">{error}</div> : null}

            <form onSubmit={handleLogin} className="mt-8 space-y-5">
              <label>
                <span className="field-label">Email Address</span>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  placeholder="admin@example.com"
                  className="field-input"
                />
              </label>
              <div className="h-1" />
              <label>
                <span className="field-label">Password</span>
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  placeholder="••••••••"
                  className="field-input"
                />
              </label>
              <button type="submit" disabled={isLoading} className="primary-button w-full">
                {isLoading ? 'Signing in...' : 'Sign in to dashboard'}
                {!isLoading ? <LockKeyhole className="h-4 w-4" /> : null}
              </button>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}
