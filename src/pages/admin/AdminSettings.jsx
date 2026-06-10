import { LogOut, ShieldCheck } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';

export default function AdminSettings() {
  const { handleSignOut } = useOutletContext();

  return (
    <div className="space-y-6 sm:space-y-8">
      <header className="space-y-3">
        <p className="eyebrow">Settings</p>
        <h1 className="display-heading text-3xl leading-[0.95] text-[var(--text)] sm:text-4xl lg:text-5xl">
          Console <span className="display-yellow">settings.</span>
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-7 text-[var(--muted)]">
          Manage your session and access the export tools. For bulk exports, use the Export CSV button on the
          Registrations page — it respects the filters you have applied.
        </p>
      </header>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="surface-glass p-6 sm:p-8">
          <p className="eyebrow">Session</p>
          <h2 className="display-heading mt-2 text-2xl text-[var(--text)]">Sign out.</h2>
          <p className="mt-2 text-sm leading-7 text-[var(--muted)]">
            End your secretariat session. You can sign back in any time with the credentials issued by the system administrator.
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button type="button" onClick={handleSignOut} className="primary-button">
              <LogOut className="h-4 w-4" /> Sign out
            </button>
            <span className="inline-flex items-center gap-2 text-xs text-[var(--muted)]">
              <ShieldCheck className="h-3.5 w-3.5 text-[var(--accent)]" />
              Sessions are handled by Firebase Authentication.
            </span>
          </div>
        </div>

        <div className="surface-glass p-6 sm:p-8">
          <p className="eyebrow">About this console</p>
          <h2 className="display-heading mt-2 text-2xl text-[var(--text)]">Built for the host secretariat.</h2>
          <p className="mt-2 text-sm leading-7 text-[var(--muted)]">
            This console reads delegate submissions in real time. Use the Planning Console on the Overview page for charts and
            the report builder. All exports are produced client-side — no third-party access to delegate data.
          </p>
        </div>
      </section>
    </div>
  );
}
