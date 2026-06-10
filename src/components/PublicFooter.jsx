import { Link } from 'react-router-dom';
import { DNDN_FACTS } from '../lib/registrations';

export default function PublicFooter() {
  return (
    <footer className="relative z-10 mt-12 border-t border-[var(--line)] py-8">
      <div className="shell-container flex flex-col gap-4 text-sm text-[var(--muted)] sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="DNDN" className="h-10 w-10 rounded-full bg-[var(--text)] p-0.5" />
          <div>
            <p className="font-display text-base leading-none text-[var(--text)]">Episcopal Consult DNDN</p>
            <p className="mt-1 font-mono text-[0.58rem] uppercase tracking-[0.24em] text-[var(--muted-2)]">
              {DNDN_FACTS.name}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
          <Link to="/dashboard" className="ghost-link">Look up status</Link>
          <Link to="/login" className="ghost-link">Secretariat sign-in</Link>
          <Link to="/register" className="ghost-link text-[var(--accent)]">Register</Link>
        </div>
      </div>
      <div className="shell-container mt-6 flex flex-col items-center justify-between gap-2 border-t border-[var(--line)] pt-4 text-[11px] text-[var(--muted-2)] sm:flex-row">
        <p className="font-mono uppercase tracking-[0.24em]">© {DNDN_FACTS.copyright} · {DNDN_FACTS.name}</p>
        <p className="font-mono uppercase tracking-[0.24em]">Church of Nigeria (Anglican Communion)</p>
      </div>
    </footer>
  );
}
