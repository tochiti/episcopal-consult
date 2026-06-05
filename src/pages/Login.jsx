import { useState } from 'react';
import { LockKeyhole, Shield } from 'lucide-react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
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
    <div className="page-shell flex items-center px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto grid w-full max-w-5xl gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <section className="overflow-hidden rounded-[2rem] border border-white/70 bg-[linear-gradient(135deg,rgba(33,24,47,0.98),rgba(74,49,93,0.92))] p-8 text-white shadow-[0_28px_90px_-38px_rgba(17,24,39,0.8)] sm:p-10">
          <img src="/logo.png" alt="DNDN logo" className="h-[4.5rem] w-[4.5rem] rounded-full bg-white p-2 shadow-lg" />
          <p className="section-label mt-6 text-amber-300">Admin portal</p>
          <h1 className="mt-3 font-serif text-4xl text-white sm:text-5xl">Manage consultation registrations and analytics.</h1>
          <p className="mt-5 text-base leading-8 text-white/78">
            Sign in with the configured admin credentials to review delegates, update statuses, export records, and remove
            registration entries when needed.
          </p>
          <div className="mt-8 rounded-[1.75rem] border border-white/15 bg-white/10 p-5 backdrop-blur">
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-amber-300" />
              <p className="font-semibold">Admin-only access</p>
            </div>
            <p className="mt-3 text-sm leading-7 text-white/72">
              This page protects the registration records stored for Episcopal Consult DNDN and routes approved users into the
              full dashboard.
            </p>
          </div>
        </section>

        <section className="glass-panel p-6 sm:p-8 lg:p-10">
          <h2 className="font-serif text-3xl text-slate-950">Admin sign in</h2>
          <p className="mt-3 text-sm leading-7 text-slate-500">Use your Firebase-authenticated admin account to continue.</p>

          {error ? <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">{error}</div> : null}

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
  );
}
