import { Link } from 'react-router-dom';
import { Calendar } from 'lucide-react';
import { DNDN_FACTS, PROGRAMME_DATES } from '../lib/registrations';

export default function PublicFooter() {
  return (
    <footer className="mt-16 border-t border-[var(--line)]">
      <div className="shell-container flex flex-col gap-5 py-8 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="DNDN" className="logo" />
          <div>
            <p className="text-[0.95rem] font-semibold leading-tight text-[var(--text)]">Episcopal Consult DNDN</p>
            <p className="eyebrow-muted mt-1">{DNDN_FACTS.name}</p>
          </div>
        </div>
        <nav className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
          <Link to="/dashboard" className="btn-ghost">Look up status</Link>
          <Link to="/login" className="btn-ghost">Secretariat sign-in</Link>
          <Link to="/register" className="btn-ghost text-[var(--accent)]">Register</Link>
        </nav>
      </div>
      <div className="shell-container flex flex-col items-center justify-between gap-3 border-t border-[var(--line)] py-4 text-[11px] text-[var(--muted-2)] sm:flex-row">
        <p className="font-mono uppercase tracking-[0.24em]">© DNDN 2026 · {DNDN_FACTS.name}</p>
        <p className="inline-flex items-center gap-2 font-mono uppercase tracking-[0.24em] text-[var(--accent)]">
          <Calendar className="h-3 w-3" />
          {PROGRAMME_DATES.display}
        </p>
        <p className="font-mono uppercase tracking-[0.24em]">Church of Nigeria (Anglican Communion)</p>
      </div>
    </footer>
  );
}
