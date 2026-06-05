import { Download, LogOut } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';
import { DNDN_FACTS } from '../../lib/registrations';

export default function AdminSettings() {
  const { handleExportCSV, handleSignOut } = useOutletContext();

  return (
    <div className="space-y-8">
      <header className="space-y-4">
        <p className="eyebrow">Settings</p>
        <div>
          <h1 className="font-serif text-5xl leading-none text-slate-950 sm:text-6xl">Admin tools and actions.</h1>
          <p className="mt-4 max-w-3xl text-sm leading-8 text-slate-600 sm:text-base">
            Export the current dataset, sign out securely, and keep core operational links in one place.
          </p>
        </div>
      </header>

      <section className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="surface-card p-6 sm:p-8">
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
        </div>

        <div className="surface-card p-6 sm:p-8">
          <p className="eyebrow">Context</p>
          <h2 className="mt-3 text-2xl font-semibold text-slate-950">{DNDN_FACTS.name}</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <DetailItem label="Province" value={DNDN_FACTS.province} />
            <DetailItem label="Bishop" value={DNDN_FACTS.bishop} />
            <DetailItem label="Cathedral" value={DNDN_FACTS.cathedral} />
            <DetailItem label="Established" value={DNDN_FACTS.founded} />
          </div>
        </div>
      </section>
    </div>
  );
}

function DetailItem({ label, value }) {
  return (
    <div className="surface-soft p-4">
      <p className="eyebrow">{label}</p>
      <p className="mt-2 text-sm font-medium leading-7 text-slate-900">{value}</p>
    </div>
  );
}
