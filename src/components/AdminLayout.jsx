import { useEffect, useMemo, useState } from 'react';
import {
  Award,
  BedDouble,
  Car,
  Crown,
  Download,
  FileText,
  LayoutGrid,
  LogOut,
  Menu,
  Settings,
  Users,
  X,
} from 'lucide-react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { deleteRegistration, getRegistrations, updateRegistrationStatus } from '../db';
import { PROGRAMME_DATES, summarizeRegistrations } from '../lib/registrations';

/* Admin nav — all eight destinations in a single ordered list.
   Reused by the top header pill (widescreen), the slide-in drawer
   (mobile), and the mobile bottom nav. */
const adminNav = [
  { to: '/admin', label: 'Overview', icon: LayoutGrid, end: true },
  { to: '/admin/registrations', label: 'Registrations', icon: Users },
  { to: '/admin/badges', label: 'Badges', icon: Award },
  { to: '/admin/accommodation', label: 'Accommodation', icon: BedDouble },
  { to: '/admin/transport', label: 'Transport', icon: Car },
  { to: '/admin/protocol', label: 'Protocol', icon: Crown },
  { to: '/admin/reports', label: 'Reports', icon: FileText },
  { to: '/admin/settings', label: 'Settings', icon: Settings },
];

/* Mobile bottom nav — only the four most-used destinations plus a Menu
   button that opens the full drawer. */
const mobileBottomNav = adminNav.slice(0, 4);

export default function AdminLayout() {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [messageTone, setMessageTone] = useState('default');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    let active = true;
    async function fetchData() {
      try {
        const data = await getRegistrations();
        if (active) setRegistrations(data);
      } catch (error) {
        console.error(error);
        if (active) {
          setMessage('Could not load registrations.');
          setMessageTone('error');
        }
      } finally {
        if (active) setLoading(false);
      }
    }
    void fetchData();
    return () => {
      active = false;
    };
  }, []);

  const analytics = useMemo(() => summarizeRegistrations(registrations), [registrations]);

  useEffect(() => {
    setDrawerOpen(false);
  }, [location.pathname]);

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

  const setFeedback = (copy, tone = 'default') => {
    setMessage(copy);
    setMessageTone(tone);
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateRegistrationStatus(id, newStatus);
      setRegistrations((current) => current.map((item) => (item.id === id ? { ...item, status: newStatus } : item)));
      setFeedback(`Status updated to ${newStatus}.`, 'success');
    } catch (error) {
      console.error(error);
      setFeedback('Could not update status.', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this record? This cannot be undone.')) return;
    try {
      await deleteRegistration(id);
      setRegistrations((current) => current.filter((item) => item.id !== id));
      setFeedback('Record deleted.', 'success');
      if (location.pathname.includes(`/admin/registrations/${id}`)) {
        navigate('/admin/registrations');
      }
    } catch (error) {
      console.error(error);
      setFeedback('Could not delete record.', 'error');
    }
  };

  const handleExportCSV = () => {
    window.dispatchEvent(new CustomEvent('admin:export-csv'));
  };

  const handleSignOut = async () => {
    await signOut(auth);
    navigate('/login');
  };

  const messageClassName =
    messageTone === 'error'
      ? 'border-[rgba(229,119,135,0.32)] bg-[rgba(229,119,135,0.10)] text-[var(--err)]'
      : messageTone === 'success'
        ? 'border-[rgba(95,185,138,0.32)] bg-[rgba(95,185,138,0.10)] text-[var(--ok)]'
        : 'border-[var(--line)] bg-[rgba(12,6,8,0.5)] text-[var(--muted)]';

  const total = registrations.length;
  const approved = registrations.filter((r) => (r.status || 'Pending') === 'Approved').length;

  return (
    <div className="page-shell relative">
      <span className="hero-blob" style={{ top: '8%', right: '-4%', width: 360, height: 360, background: 'radial-gradient(circle, rgba(224,178,90,0.08), transparent 70%)' }} aria-hidden />

      {/* ──────────────  FIXED TOP HEADER  ──────────────
          • Mobile: hamburger on the LEFT (drawer opens from left), logo +
            brand centred.
          • Widescreen (lg+): logo + brand on the left, horizontally
            scrollable pill nav centred, quick snapshot + sign-out on the
            right. NO sidebar. */}
      <header className="admin-topbar fixed inset-x-0 top-0 z-30 flex h-14 items-center gap-2 border-b border-[var(--line)] bg-[rgba(12,6,8,0.92)] backdrop-blur lg:h-16">
        {/* Mobile hamburger — LEFT side */}
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          className="ml-3 inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-[var(--line)] text-[var(--text)] lg:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Logo + brand */}
        <div className="flex items-center gap-2.5 px-3 lg:ml-6 lg:px-0">
          <img
            src="/logo.png"
            alt="DNDN"
            className="h-8 w-8 rounded-full bg-[var(--text)] p-0.5 shadow-sm lg:h-9 lg:w-9"
          />
          <div className="leading-tight">
            <p className="font-mono text-[0.55rem] font-bold uppercase tracking-[0.18em] text-[var(--accent)]">
              DNDN 2026
            </p>
            <p className="font-display text-[15px] leading-none text-[var(--text-bright)] lg:text-base">
              Secretariat
            </p>
          </div>
        </div>

        {/* Widescreen inline pill nav — centred, horizontally scrollable */}
        <nav className="ml-3 hidden flex-1 items-center gap-1 overflow-x-auto py-1 lg:flex">
          {adminNav.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `inline-flex flex-shrink-0 items-center gap-2 rounded-full px-3.5 py-2 text-[13px] font-semibold transition ${
                  isActive
                    ? 'bg-[var(--accent)] text-[#1a0c10] shadow-[0_0_18px_rgba(224,178,90,0.3)]'
                    : 'text-[var(--muted)] hover:bg-[rgba(224,178,90,0.06)] hover:text-[var(--text-bright)]'
                }`
              }
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Widescreen right side — programme date + quick snapshot + sign out */}
        <div className="ml-auto hidden items-center gap-3 pr-6 lg:flex">
          <span className="font-mono text-[0.6rem] uppercase tracking-[0.22em] text-[var(--muted-2)]">
            {PROGRAMME_DATES.short}
          </span>
          <div className="hidden items-center gap-2 rounded-full border border-[var(--line)] bg-[rgba(12,6,8,0.5)] px-3 py-1.5 xl:inline-flex">
            <span className="font-mono text-[0.62rem] uppercase tracking-[0.18em] text-[var(--muted-2)]">
              {approved}/{total} approved
            </span>
          </div>
          <button
            type="button"
            onClick={handleExportCSV}
            className="secondary-button px-3 py-1.5 text-xs"
          >
            <Download className="h-3.5 w-3.5" /> Export
          </button>
          <button
            type="button"
            onClick={handleSignOut}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--line)] text-[var(--muted)] hover:text-[var(--text-bright)]"
            aria-label="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
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
                    DNDN 2026
                  </p>
                  <p className="font-display text-base leading-none text-[var(--text-bright)]">Secretariat</p>
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
              <p className="nav-group-label">Operations</p>
              <div className="space-y-1.5">
                {adminNav.map(({ to, label, icon: Icon, end }) => (
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
            <div className="space-y-2 border-t border-[var(--line)] p-3">
              <div className="rounded-xl border border-[var(--line)] bg-[rgba(12,6,8,0.5)] p-3.5">
                <p className="eyebrow">Quick snapshot</p>
                <p className="display-heading mt-1 text-2xl text-[var(--accent)]">{total}</p>
                <p className="text-[10px] uppercase tracking-[0.18em] text-[var(--muted-2)]">
                  {approved} approved · {total - approved} pending / declined
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  handleExportCSV();
                  setDrawerOpen(false);
                }}
                className="secondary-button w-full justify-center"
              >
                <Download className="h-4 w-4" /> Export CSV
              </button>
              <button type="button" onClick={handleSignOut} className="secondary-button w-full justify-center">
                <LogOut className="h-4 w-4" /> Sign out
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* ──────────────  MAIN CONTENT  ──────────────
          Full width — no left sidebar reservation on widescreen. */}
      <main className="admin-main relative z-10 pt-14 lg:pt-16">
        <div className="min-h-[calc(100vh-3.5rem)] pb-24 lg:min-h-[calc(100vh-4rem)] lg:pb-12">
          <div className="px-4 pb-4 pt-4 sm:px-6 sm:pt-6 lg:px-8 lg:pt-8">
            {message ? (
              <div className={`mb-5 rounded-xl border p-3.5 text-sm ${messageClassName}`}>{message}</div>
            ) : null}
            <Outlet
              context={{
                registrations,
                loading,
                analytics,
                handleDelete,
                handleStatusChange,
                handleSignOut,
              }}
            />
          </div>
        </div>
      </main>

      {/* ──────────────  MOBILE BOTTOM NAV  ────────────── */}
      <nav className="admin-bottom-nav fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-[var(--line-strong)] bg-[rgba(12,6,8,0.96)] backdrop-blur lg:hidden">
        {mobileBottomNav.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex min-h-[56px] flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] transition ${
                isActive
                  ? 'text-[var(--accent)]'
                  : 'text-[var(--muted-2)] hover:text-[var(--text)]'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className={`flex h-7 w-12 items-center justify-center rounded-full transition ${
                    isActive ? 'bg-[rgba(224,178,90,0.12)]' : ''
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </span>
                <span>{label}</span>
              </>
            )}
          </NavLink>
        ))}
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          className="flex min-h-[56px] flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--muted-2)] hover:text-[var(--text)]"
          aria-label="Open more menu"
        >
          <span className="flex h-7 w-12 items-center justify-center rounded-full">
            <Menu className="h-5 w-5" />
          </span>
          <span>Menu</span>
        </button>
      </nav>
    </div>
  );
}
