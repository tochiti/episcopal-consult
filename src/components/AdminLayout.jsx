import { useEffect, useMemo, useState } from 'react';
import {
  BarChart3,
  Download,
  LayoutGrid,
  LogOut,
  Menu,
  Settings,
  X,
} from 'lucide-react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { deleteRegistration, getRegistrations, updateRegistrationStatus } from '../db';
import { summarizeRegistrations } from '../lib/registrations';

const navItems = [
  { to: '/admin', label: 'Overview', icon: LayoutGrid, end: true },
  { to: '/admin/registrations', label: 'Registrations', icon: BarChart3 },
  { to: '/admin/settings', label: 'Settings', icon: Settings },
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

      {/* Mobile top bar */}
      <div className="sticky top-0 z-20 border-b border-[var(--line)] bg-[rgba(12,6,8,0.85)] backdrop-blur lg:hidden">
        <div className="flex items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="DNDN" className="h-8 w-8 rounded-full bg-[var(--text)] p-1" />
            <p className="font-display text-base leading-none text-[var(--text)]">Secretariat</p>
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
          {/* Desktop sidebar */}
          <aside className="hidden lg:block">
            <SidebarPanel
              registrations={registrations}
              handleSignOut={handleSignOut}
              handleExportCSV={() => {
                /* dispatch a custom event so the Registrations page can handle export */
                window.dispatchEvent(new CustomEvent('admin:export-csv'));
              }}
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

      {/* Mobile drawer */}
      {drawerOpen ? (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true">
          <button
            type="button"
            onClick={() => setDrawerOpen(false)}
            className="absolute inset-0 bg-black/70"
            aria-label="Close menu"
          />
          <div className="absolute inset-y-0 right-0 flex w-72 max-w-[85vw] flex-col border-l border-[var(--line-strong)] bg-[rgba(12,6,8,0.97)] backdrop-blur">
            <div className="flex items-center justify-between border-b border-[var(--line)] px-4 py-3">
              <p className="font-display text-base text-[var(--text)]">Menu</p>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--line)] text-[var(--muted)]"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <nav className="flex-1 space-y-2 p-3">
              {navItems.map(({ to, label, icon: Icon, end }) => (
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
            </nav>
            <div className="space-y-2 border-t border-[var(--line)] p-3">
              <button
                type="button"
                onClick={() => {
                  window.dispatchEvent(new CustomEvent('admin:export-csv'));
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
      <div className="flex items-center gap-3 pb-5">
        <img src="/logo.png" alt="DNDN" className="h-10 w-10 rounded-full bg-[var(--text)] p-1 shadow-sm" />
        <div>
          <p className="eyebrow">Secretariat</p>
          <p className="font-display text-base leading-none text-[var(--text)]">Episcopal Consult</p>
        </div>
      </div>
      <nav className="space-y-2">
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl border px-4 py-3 text-sm font-semibold transition ${
                isActive
                  ? 'border-[var(--accent)] bg-[var(--accent)] text-[#1a0c10] shadow-[0_0_18px_rgba(224,178,90,0.3)]'
                  : 'border-transparent text-[var(--muted)] hover:border-[var(--line-strong)] hover:bg-[rgba(224,178,90,0.05)] hover:text-[var(--text)]'
              }`
            }
          >
            <Icon className="h-4 w-4" />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="mt-5 rounded-xl border border-[var(--line)] bg-[rgba(12,6,8,0.5)] p-3.5">
        <p className="eyebrow">Quick snapshot</p>
        <p className="display-heading mt-2 text-3xl text-[var(--accent)]">{total}</p>
        <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--muted-2)]">
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
    </div>
  );
}
