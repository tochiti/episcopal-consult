import { Link } from 'react-router-dom';
import { DNDN_FACTS } from '../lib/registrations';

export default function PublicFooter() {
  return (
    <footer className="relative z-10 mt-10 border-t border-[var(--line)] py-8">
      <div className="shell-container flex flex-col gap-4 text-sm text-[var(--muted)] sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="DNDN" className="h-9 w-9 rounded-full bg-[var(--text)] p-1" />
          <div>
            <p className="font-display text-base leading-none text-[var(--text)]">Episcopal Consult DNDN</p>
            <p className="mt-1 font-mono text-[0.58rem] uppercase tracking-[0.24em] text-[var(--muted-2)]">
              {DNDN_FACTS.name} · {new Date().getFullYear()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-5">
          <Link to="/dashboard" className="ghost-link">Look up status</Link>
          <Link to="/login" className="ghost-link">Secretariat sign-in</Link>
          <Link to="/register" className="ghost-link text-[var(--accent)]">Register</Link>
        </div>
      </div>
    </footer>
  );
}
