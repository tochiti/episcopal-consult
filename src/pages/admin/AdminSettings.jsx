import { LogOut, ShieldCheck, Download, Users, BedDouble, Car, Crown, Award, FileText, Database, Lock } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';
import AdminPageHeader from '../../components/AdminPageHeader';

export default function AdminSettings() {
  const { handleSignOut, registrations = [] } = useOutletContext();
  const total = registrations.length;
  const approved = registrations.filter((r) => (r.status || 'Pending') === 'Approved').length;

  return (
    <div className="space-y-6 sm:space-y-8">
      <AdminPageHeader
        eyebrow="Console settings"
        title="Console"
        accent="settings."
        copy="Manage your secretariat session, audit the operational systems and end the day. Data stays in the host diocese project — no third-party access."
        tags={[`${total} delegates`, `${approved} approved`, `Session encrypted`]}
      />

      <section className="grid gap-4 lg:grid-cols-2">
        {/* Session card */}
        <div className="surface-glass p-6 sm:p-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[var(--line-strong)] bg-[rgba(224,178,90,0.10)] text-[var(--accent)]">
              <Lock className="h-4 w-4" />
            </div>
            <div>
              <p className="eyebrow">Session</p>
              <p className="mt-0.5 text-[15px] font-semibold text-[var(--text-bright)]">Sign out</p>
            </div>
          </div>
          <p className="mt-5 text-sm leading-7 text-[var(--muted)]">
            End your secretariat session. You can sign back in any time with the credentials issued by the system
            administrator. Always sign out on shared devices.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button type="button" onClick={handleSignOut} className="primary-button">
              <LogOut className="h-4 w-4" /> Sign out of console
            </button>
            <span className="inline-flex items-center gap-2 text-xs text-[var(--muted)]">
              <ShieldCheck className="h-3.5 w-3.5 text-[var(--accent)]" />
              Sessions are encrypted and tied to this device.
            </span>
          </div>
        </div>

        {/* About this console card */}
        <div className="surface-glass p-6 sm:p-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[var(--line-strong)] bg-[rgba(95,185,138,0.10)] text-[var(--ok)]">
              <Database className="h-4 w-4" />
            </div>
            <div>
              <p className="eyebrow">About this console</p>
              <p className="mt-0.5 text-[15px] font-semibold text-[var(--text-bright)]">Built for the host secretariat</p>
            </div>
          </div>
          <p className="mt-5 text-sm leading-7 text-[var(--muted)]">
            This console reads delegate submissions in real time from the host diocese's secure database. Use
            the Planning Console on the Overview page for charts and the report builder. All exports are produced
            client-side — no third-party access to delegate data.
          </p>
        </div>
      </section>

      {/* Operational systems reference */}
      <section>
        <div className="mb-4 flex items-end justify-between gap-3">
          <div>
            <p className="eyebrow">Operational systems</p>
            <h2 className="display-heading mt-1.5 text-2xl text-[var(--text-bright)]">What this console covers.</h2>
          </div>
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--muted-2)]">
            6 systems
          </span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <SystemTile icon={Users} title="Registrations" copy="Delegate list & approval status." />
          <SystemTile icon={Award} title="Badges" copy="Printable badge sheets, two per A4." />
          <SystemTile icon={BedDouble} title="Accommodation" copy="Hotels, rooms, check-in dates." />
          <SystemTile icon={Car} title="Transport" copy="Vehicles, drivers, pickup dates." />
          <SystemTile icon={Crown} title="Protocol" copy="VIP levels, dietary, special needs." />
          <SystemTile icon={FileText} title="Reports" copy="Filtered exports and print reports." />
        </div>
      </section>

      {/* Exports & data card */}
      <section className="surface-glass p-6 sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-xl">
            <p className="eyebrow">Exports & data</p>
            <h3 className="display-heading mt-2 text-2xl text-[var(--text-bright)]">Need a planning sheet?</h3>
            <p className="mt-2 text-sm leading-7 text-[var(--muted)]">
              Use the Export CSV button on the Registrations page — it respects the filters you have applied and
              produces a delegate sheet that the secretariat can hand to operations.
            </p>
          </div>
          <div className="flex items-center gap-2.5 rounded-xl border border-[var(--line)] bg-[rgba(12,6,8,0.4)] p-3.5">
            <Download className="h-4 w-4 text-[var(--accent)]" />
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted)]">
              CSV · client-side
            </span>
          </div>
        </div>
      </section>

      <p className="text-center font-mono text-[0.55rem] uppercase tracking-[0.22em] text-[var(--muted-2)]">
        © DNDN 2026 · Host secretariat console
      </p>
    </div>
  );
}

function SystemTile({ icon: Icon, title, copy }) {
  return (
    <div className="rounded-xl border border-[var(--line)] bg-[var(--bg-3)] p-4">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--line-strong)] bg-[rgba(224,178,90,0.08)] text-[var(--accent)]">
        <Icon className="h-4 w-4" />
      </div>
      <p className="mt-3 text-[14px] font-semibold text-[var(--text-bright)]">{title}</p>
      <p className="mt-1 text-[12px] leading-5 text-[var(--muted)]">{copy}</p>
    </div>
  );
}
