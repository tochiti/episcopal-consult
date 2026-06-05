import { Download, LogOut } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';

export default function AdminSettings() {
  const { handleExportCSV, handleSignOut } = useOutletContext();

  return (
    <div className="space-y-8">
      <header className="space-y-4">
        <p className="eyebrow">Settings</p>
        <div>
          <h1 className="font-serif text-5xl leading-none text-slate-950 sm:text-6xl">Admin actions.</h1>
        </div>
      </header>

      <section className="surface-card max-w-xl p-6 sm:p-8">
        <p className="eyebrow">Actions</p>
        <div className="mt-5 space-y-4">
          <button onClick={handleExportCSV} className="secondary-button w-full justify-center">
            <Download className="h-4 w-4" />
            Export registrations CSV
          </button>
          <button onClick={handleSignOut} className="primary-button w-full justify-center">
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </section>
    </div>
  );
}
