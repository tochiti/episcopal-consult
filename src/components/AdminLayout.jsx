import { useEffect, useMemo, useState } from 'react';
import { BarChart3, Download, LayoutGrid, LogOut, Settings } from 'lucide-react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { deleteRegistration, getRegistrations, updateRegistrationStatus } from '../db';
import { downloadRegistrationsCsv, summarizeRegistrations } from '../lib/registrations';

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
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;
    async function fetchData() {
      try {
        const data = await getRegistrations();
        if (active) {
          setRegistrations(data);
        }
      } catch (error) {
        console.error(error);
        if (active) {
          setMessage('Could not load registrations.');
          setMessageTone('error');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
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
      setFeedback(`Registration status updated to ${newStatus}.`, 'success');
    } catch (error) {
      console.error(error);
      setFeedback('Could not update registration status.', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this registration record? This action cannot be undone.')) return;
    try {
      await deleteRegistration(id);
      setRegistrations((current) => current.filter((item) => item.id !== id));
      setFeedback('Registration deleted successfully.', 'success');
    } catch (error) {
      console.error(error);
      setFeedback('Could not delete registration.', 'error');
    }
  };

  const handleExportCSV = () => {
    downloadRegistrationsCsv(registrations);
    setFeedback('CSV export started.', 'success');
  };

  const handleSignOut = async () => {
    await signOut(auth);
    navigate('/login');
  };

  const messageClassName =
    messageTone === 'error'
      ? 'border-rose-200 bg-rose-50 text-rose-800'
      : messageTone === 'success'
        ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
        : 'border-slate-200 bg-slate-50 text-slate-700';

  return (
    <div className="page-shell pb-24 lg:pb-10">
      <div className="shell-container pt-6 sm:pt-8 lg:pt-10">
        <div className="grid gap-6 lg:grid-cols-[250px_minmax(0,1fr)] lg:items-start">
          <aside className="hidden lg:block">
            <div className="surface-card sticky top-8 p-5">
              <div className="flex items-center gap-3 pb-5">
                <img src="/logo.png" alt="DNDN logo" className="h-11 w-11 rounded-full bg-white p-1.5 shadow-sm" />
                <div>
                  <p className="eyebrow">Admin</p>
                  <p className="text-sm font-semibold text-slate-900">Episcopal Consult</p>
                </div>
              </div>
              <nav className="space-y-2">
                {navItems.map(({ to, label, icon: Icon, end }) => (
                  <NavLink
                    key={to}
                    to={to}
                    end={end}
                    className={({ isActive }) =>
                      `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                        isActive ? 'bg-slate-950 text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
                      }`
                    }
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </NavLink>
                ))}
              </nav>
              <div className="mt-6 space-y-3 border-t border-slate-100 pt-5">
                <button onClick={handleExportCSV} className="secondary-button w-full justify-center">
                  <Download className="h-4 w-4" />
                  Export CSV
                </button>
                <button onClick={handleSignOut} className="secondary-button w-full justify-center">
                  <LogOut className="h-4 w-4" />
                  Sign out
                </button>
              </div>
            </div>
          </aside>

          <div className="min-w-0">
            {message ? <div className={`mb-6 rounded-[1.25rem] border p-4 text-sm ${messageClassName}`}>{message}</div> : null}
            <Outlet
              context={{
                registrations,
                loading,
                analytics,
                handleDelete,
                handleExportCSV,
                handleSignOut,
                handleStatusChange,
              }}
            />
          </div>
        </div>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200/80 bg-[rgba(255,253,249,0.95)] px-4 py-3 backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-md items-center justify-around">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex min-w-[86px] flex-col items-center gap-1 rounded-2xl px-3 py-2 text-[11px] font-semibold transition ${
                  isActive ? 'bg-slate-950 text-white' : 'text-slate-600'
                }`
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
