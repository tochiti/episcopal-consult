import { useEffect, useState } from 'react';
import { Calendar, FileSearch, Home, LogIn, Menu, UserPlus, X } from 'lucide-react';
import { Link, NavLink } from 'react-router-dom';
import { PROGRAMME_DATES } from '../lib/registrations';
import PublicFooter from './PublicFooter';

/* Public nav — Home / Status lookup / Register / Secretariat sign-in.
   Items are reused for both the top header (widescreen) and the slide-in
   drawer (mobile). Icons and the `end` flag are kept here so both surfaces
   stay in sync. */
const publicNav = [
  { to: '/', label: 'Home', icon: Home, end: true },
  { to: '/dashboard', label: 'Status lookup', icon: FileSearch },
  { to: '/register', label: 'Register', icon: UserPlus },
  { to: '/login', label: 'Secretariat sign-in', icon: LogIn },
];

export default function PublicLayout({ children }) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    if (drawerOpen) {
      const previous = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = previous;
      };
    }
    return undefined;
  }, [drawerOpen]);

  return (
    <div className="page-shell relative">
      {/* ──────────────  FIXED TOP HEADER  ──────────────
          • Widescreen (lg+): logo + brand on the left, full nav links inline,
            Register CTA on the right. No sidebar.
          • Mobile (<lg): hamburger on the LEFT (drawer opens from left), logo
            + brand centred, no inline nav. */}
      <header className="public-topbar fixed inset-x-0 top-0 z-30 flex h-14 items-center border-b border-[var(--line)] bg-[rgba(12,6,8,0.92)] backdrop-blur lg:h-16">
        {/* Mobile hamburger — left side */}
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          className="ml-3 inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-[var(--line)] text-[var(--text)] lg:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Logo + brand */}
        <Link to="/" className="flex items-center gap-2.5 px-3 lg:ml-6 lg:px-0">
          <img
            src="/logo.png"
            alt="Diocese of Niger Delta North"
            className="h-8 w-8 rounded-full bg-[var(--text)] p-0.5 shadow-sm lg:h-9 lg:w-9"
          />
          <div className="leading-tight">
            <p className="font-mono text-[0.55rem] font-bold uppercase tracking-[0.18em] text-[var(--accent)]">
              Episcopal Consultation
            </p>
            <p className="font-display text-[15px] leading-none text-[var(--text-bright)] lg:text-base">
              Registration Portal
            </p>
          </div>
        </Link>

        {/* Widescreen inline nav — centred */}
        <nav className="ml-auto hidden items-center gap-1 lg:flex">
          {publicNav.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-[13px] font-semibold transition ${
                  isActive
                    ? 'bg-[rgba(224,178,90,0.12)] text-[var(--accent)]'
                    : 'text-[var(--muted)] hover:bg-[rgba(224,178,90,0.06)] hover:text-[var(--text-bright)]'
                }`
              }
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Widescreen right-side CTA */}
        <div className="ml-2 hidden items-center gap-2 pr-6 lg:flex">
          <span className="hidden font-mono text-[0.6rem] uppercase tracking-[0.22em] text-[var(--muted-2)] xl:inline-flex">
            {PROGRAMME_DATES.short}
          </span>
          <Link to="/register" className="primary-button px-4 py-2 text-xs">
            Register <span aria-hidden>→</span>
          </Link>
        </div>

        {/* Mobile right spacer keeps the brand visually centred */}
        <div className="ml-auto h-10 w-10 lg:hidden" aria-hidden />
      </header>

      {/* ──────────────  MOBILE SLIDE-IN DRAWER (from left)  ────────────── */}
      {drawerOpen ? (
        <div className="fixed inset-0 z-40" role="dialog" aria-modal="true">
          <button
            type="button"
            onClick={() => setDrawerOpen(false)}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            aria-label="Close menu"
          />
          <div className="absolute inset-y-0 left-0 flex w-80 max-w-[88vw] flex-col border-r border-[var(--line-strong)] bg-[rgba(12,6,8,0.97)] backdrop-blur">
            <div className="flex items-center justify-between border-b border-[var(--line)] px-4 py-3">
              <div className="flex items-center gap-2.5">
                <img src="/logo.png" alt="DNDN" className="h-9 w-9 rounded-full bg-[var(--text)] p-0.5" />
                <div>
                  <p className="font-mono text-[0.55rem] uppercase tracking-[0.18em] text-[var(--accent)]">
                    Episcopal Consultation
                  </p>
                  <p className="font-display text-base leading-none text-[var(--text-bright)]">Registration Portal</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--line)] text-[var(--muted)]"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto p-3">
              <p className="nav-group-label">Navigate</p>
              <div className="space-y-1.5">
                {publicNav.map(({ to, label, icon: Icon, end }) => (
                  <NavLink
                    key={to}
                    to={to}
                    end={end}
                    onClick={() => setDrawerOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 rounded-xl border px-4 py-3 text-sm font-semibold transition ${
                        isActive
                          ? 'border-[var(--accent)] bg-[var(--accent)] text-[#1a0c10]'
                          : 'border-transparent text-[var(--muted)] hover:border-[var(--line-strong)] hover:bg-[rgba(224,178,90,0.05)] hover:text-[var(--text)]'
                      }`
                    }
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </NavLink>
                ))}
              </div>
            </nav>
            <div className="space-y-3 border-t border-[var(--line)] p-4">
              <div className="flex items-center gap-2 rounded-lg border border-[var(--line)] bg-[rgba(12,6,8,0.5)] px-3 py-2.5 text-[11px] text-[var(--muted-2)]">
                <Calendar className="h-3.5 w-3.5 text-[var(--accent)]" />
                <span className="font-mono uppercase tracking-[0.18em]">
                  {PROGRAMME_DATES.displayUpper}
                </span>
              </div>
              <Link
                to="/register"
                onClick={() => setDrawerOpen(false)}
                className="primary-button w-full justify-center"
              >
                Register <span aria-hidden>→</span>
              </Link>
            </div>
          </div>
        </div>
      ) : null}

      {/* ──────────────  MAIN CONTENT  ──────────────
          Full width — no left sidebar reservation on widescreen. */}
      <main className="public-main pt-14 lg:pt-16">
        <div className="min-h-[calc(100vh-3.5rem)] pb-12 lg:min-h-[calc(100vh-4rem)] lg:pb-16">
          {children}
        </div>
        <PublicFooter />
      </main>
    </div>
  );
}
