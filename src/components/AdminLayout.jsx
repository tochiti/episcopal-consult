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
import { summarizeRegistrations } from '../lib/registrations';

/* Grouped nav — DELEGATES / OPERATIONS / TOOLS. */
const navGroups = [
  {
    label: 'Delegates',
    items: [
      { to: '/admin', label: 'Overview', icon: LayoutGrid, end: true },
      { to: '/admin/registrations', label: 'Registrations', icon: Users },
    ],
  },
  {
    label: 'Operations',
    items: [
      { to: '/admin/badges', label: 'Badges', icon: Award },
      { to: '/admin/accommodation', label: 'Accommodation', icon: BedDouble },
      { to: '/admin/transport', label: 'Transport', icon: Car },
      { to: '/admin/protocol', label: 'Protocol', icon: Crown },
    ],
  },
  {
    label: 'Tools',
    items: [
      { to: '/admin/reports', label: 'Reports', icon: FileText },
      { to: '/admin/settings', label: 'Settings', icon: Settings },
    ],
  },
];

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

  return (
    <div className="page-shell relative">
      <span className="hero-blob" style={{ top: '8%', right: '-4%', width: 360, height: 360, background: 'radial-gradient(circle, rgba(224,178,90,0.08), transparent 70%)' }} aria-hidden />

      <div className="sticky top-0 z-20 border-b border-[var(--line)] bg-[rgba(12,6,8,0.85)] backdrop-blur lg:hidden">
        <div className="flex items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-2.5">
            <img src="/logo.png" alt="DNDN" className="h-9 w-9 rounded-full bg-[var(--text)] p-0.5" />
            <div>
              <p className="font-mono text-[0.55rem] uppercase tracking-[0.22em] text-[var(--muted-2)]">DNDN 2026</p>
              <p className="font-display text-base leading-none text-[var(--text)]">Secretariat</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--line)] text-[var(--text)]"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="shell-container relative z-10 pt-4 sm:pt-6 lg:pt-10">
        <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)] lg:items-start">
          <aside className="hidden lg:block">
            <SidebarPanel
              registrations={registrations}
              handleSignOut={handleSignOut}
              handleExportCSV={handleExportCSV}
            />
          </aside>

          <div className="min-w-0">
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
      </div>

      {drawerOpen ? (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true">
          <button
            type="button"
            onClick={() => setDrawerOpen(false)}
            className="absolute inset-0 bg-black/70"
            aria-label="Close menu"
          />
          <div className="absolute inset-y-0 right-0 flex w-80 max-w-[88vw] flex-col border-l border-[var(--line-strong)] bg-[rgba(12,6,8,0.97)] backdrop-blur">
            <div className="flex items-center justify-between border-b border-[var(--line)] px-4 py-3">
              <div>
                <p className="font-mono text-[0.55rem] uppercase tracking-[0.22em] text-[var(--muted-2)]">DNDN 2026</p>
                <p className="font-display text-base text-[var(--text)]">Secretariat</p>
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
              {navGroups.map((group) => (
                <div key={group.label}>
                  <p className="nav-group-label">{group.label}</p>
                  <div className="space-y-1.5">
                    {group.items.map(({ to, label, icon: Icon, end }) => (
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
                </div>
              ))}
            </nav>
            <div className="space-y-2 border-t border-[var(--line)] p-3">
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
    </div>
  );
}

function SidebarPanel({ registrations, handleSignOut, handleExportCSV }) {
  const total = registrations.length;
  const approved = registrations.filter((r) => (r.status || 'Pending') === 'Approved').length;
  return (
    <div className="surface-glass sticky top-8 p-5">
      <div className="flex items-center gap-3 pb-4">
        <img src="/logo.png" alt="DNDN" className="h-10 w-10 rounded-full bg-[var(--text)] p-0.5 shadow-sm" />
        <div>
          <p className="font-mono text-[0.55rem] uppercase tracking-[0.22em] text-[var(--muted-2)]">DNDN 2026</p>
          <p className="font-display text-base leading-none text-[var(--text-bright)]">Secretariat</p>
        </div>
      </div>

      {/* Decorative cross rule */}
      <div className="my-4 flex items-center justify-center gap-2" aria-hidden>
        <span className="h-px w-8 bg-[var(--line)]" />
        <svg width="8" height="8" viewBox="0 0 14 14" fill="none">
          <path d="M7 0v14M0 7h14" stroke="var(--accent)" strokeWidth="1" />
        </svg>
        <span className="h-px w-8 bg-[var(--line)]" />
      </div>

      <nav className="space-y-3">
        {navGroups.map((group) => (
          <div key={group.label}>
            <p className="nav-group-label">{group.label}</p>
            <div className="space-y-1.5">
              {group.items.map(({ to, label, icon: Icon, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-xl border px-3.5 py-2.5 text-sm font-semibold transition ${
                      isActive
                        ? 'border-[var(--accent)] bg-[var(--accent)] text-[#1a0c10] shadow-[0_0_18px_rgba(224,178,90,0.3)]'
                        : 'border-transparent text-[var(--muted)] hover:border-[var(--line-strong)] hover:bg-[rgba(224,178,90,0.05)] hover:text-[var(--text-bright)]'
                    }`
                  }
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="mt-5 rounded-xl border border-[var(--line)] bg-[rgba(12,6,8,0.5)] p-3.5">
        <p className="eyebrow">Quick snapshot</p>
        <p className="display-heading mt-2 text-3xl text-[var(--accent)]">{total}</p>
        <p className="text-[10px] uppercase tracking-[0.18em] text-[var(--muted-2)]">
          {approved} approved · {total - approved} pending / declined
        </p>
      </div>
      <div className="mt-5 space-y-2 border-t border-[var(--line)] pt-5">
        <button type="button" onClick={handleExportCSV} className="secondary-button w-full justify-center">
          <Download className="h-4 w-4" /> Export CSV
        </button>
        <button type="button" onClick={handleSignOut} className="secondary-button w-full justify-center">
          <LogOut className="h-4 w-4" /> Sign out
        </button>
      </div>
      <p className="mt-4 text-center font-mono text-[0.55rem] uppercase tracking-[0.22em] text-[var(--muted-2)]">© DNDN 2026</p>
    </div>
  );
}
