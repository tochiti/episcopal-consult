import { useEffect, useState } from 'react';
import { LogOut, ShieldCheck, Download, Users, BedDouble, Car, Crown, Award, FileText, Database, Lock, Zap, Bell, X, Plus } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';
import AdminPageHeader from '../../components/AdminPageHeader';
import { getSettings, updateSettings } from '../../db';

export default function AdminSettings() {
  const { handleSignOut, handleStatusChange, registrations = [] } = useOutletContext();
  const total = registrations.length;
  const approved = registrations.filter((r) => (r.status || 'Pending') === 'Approved').length;

  const [autoApprove, setAutoApprove] = useState(false);
  const [settingBusy, setSettingBusy] = useState(false);
  const [autoMessage, setAutoMessage] = useState('');

  const [notifEmails, setNotifEmails] = useState([]);
  const [notifInput, setNotifInput] = useState('');
  const [notifBusy, setNotifBusy] = useState(false);
  const [notifMessage, setNotifMessage] = useState('');

  useEffect(() => {
    let active = true;
    getSettings()
      .then((settings) => {
        if (active) {
          setAutoApprove(Boolean(settings.autoApproveEnabled));
          setNotifEmails(Array.isArray(settings.notificationEmails) ? settings.notificationEmails : []);
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const handleAddNotifEmail = () => {
    const email = notifInput.trim().toLowerCase();
    if (!email || !email.includes('@') || notifEmails.length >= 5 || notifEmails.includes(email)) return;
    setNotifEmails((prev) => [...prev, email]);
    setNotifInput('');
  };

  const handleRemoveNotifEmail = (email) => {
    setNotifEmails((prev) => prev.filter((e) => e !== email));
  };

  const handleSaveNotifEmails = async () => {
    if (notifBusy) return;
    setNotifBusy(true);
    setNotifMessage('');
    try {
      await updateSettings({ notificationEmails: notifEmails });
      setNotifMessage('Notification addresses saved.');
    } catch (error) {
      console.error(error);
      setNotifMessage('Could not save notification addresses.');
    } finally {
      setNotifBusy(false);
    }
  };

  const handleToggleAutoApprove = async () => {
    if (settingBusy) return;
    const next = !autoApprove;
    setSettingBusy(true);
    setAutoMessage('');
    try {
      await updateSettings({ autoApproveEnabled: next });
      setAutoApprove(next);
      if (next) {
        /* Clear the existing backlog: approve every pending record. Reusing
           handleStatusChange keeps state + approval emails consistent. */
        const pending = registrations.filter((r) => (r.status || 'Pending') === 'Pending');
        for (const record of pending) {
          await handleStatusChange(record.id, 'Approved');
        }
        setAutoMessage(
          pending.length
            ? `Auto-approval on. ${pending.length} pending registration${pending.length === 1 ? '' : 's'} approved.`
            : 'Auto-approval on. New registrations will be approved automatically.'
        );
      } else {
        setAutoMessage('Auto-approval off. New registrations will await manual review.');
      }
    } catch (error) {
      console.error(error);
      setAutoMessage('Could not update the auto-approval setting.');
    } finally {
      setSettingBusy(false);
    }
  };

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

      {/* Automation card */}
      <section className="surface-glass p-6 sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl border border-[var(--line-strong)] bg-[rgba(224,178,90,0.10)] text-[var(--accent)]">
              <Zap className="h-4 w-4" />
            </div>
            <div className="max-w-xl">
              <p className="eyebrow">Automation</p>
              <p className="mt-0.5 text-[15px] font-semibold text-[var(--text-bright)]">Automatic approval</p>
              <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
                When enabled, new delegate registrations are approved automatically — no manual review needed — and
                each delegate is emailed their approval. Turning this on now also approves every registration still
                pending. Leave it off to review submissions yourself.
              </p>
            </div>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={autoApprove}
            aria-label="Toggle automatic approval"
            onClick={handleToggleAutoApprove}
            disabled={settingBusy}
            className={`relative inline-flex h-7 w-12 flex-shrink-0 items-center rounded-full border transition disabled:opacity-50 ${
              autoApprove
                ? 'border-[var(--accent)] bg-[var(--accent)]'
                : 'border-[var(--line-strong)] bg-[rgba(12,6,8,0.6)]'
            }`}
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-[#1a0c10] transition ${
                autoApprove ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
        {autoMessage ? (
          <p className="mt-4 rounded-xl border border-[var(--line)] bg-[rgba(12,6,8,0.5)] p-3 text-xs text-[var(--muted)]">
            {autoMessage}
          </p>
        ) : null}
      </section>

      {/* Notification emails card */}
      <section className="surface-glass p-6 sm:p-8">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl border border-[var(--line-strong)] bg-[rgba(224,178,90,0.10)] text-[var(--accent)]">
            <Bell className="h-4 w-4" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="eyebrow">Notifications</p>
            <p className="mt-0.5 text-[15px] font-semibold text-[var(--text-bright)]">Registration alerts</p>
            <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
              Add up to 5 email addresses that receive an alert whenever a delegate completes the registration form.
              Useful for keeping the planning team informed in real time without logging into the console.
            </p>

            {/* Current addresses */}
            {notifEmails.length > 0 ? (
              <ul className="mt-4 space-y-2">
                {notifEmails.map((email) => (
                  <li
                    key={email}
                    className="flex items-center justify-between gap-3 rounded-xl border border-[var(--line)] bg-[rgba(12,6,8,0.4)] px-4 py-2.5"
                  >
                    <span className="font-mono text-xs text-[var(--text-bright)] truncate">{email}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveNotifEmail(email)}
                      aria-label={`Remove ${email}`}
                      className="flex-shrink-0 text-[var(--muted-2)] hover:text-[var(--err)] transition"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-xs text-[var(--muted-2)]">No notification addresses added yet.</p>
            )}

            {/* Add input */}
            {notifEmails.length < 5 ? (
              <div className="mt-4 flex gap-2">
                <input
                  type="email"
                  value={notifInput}
                  onChange={(e) => setNotifInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddNotifEmail(); } }}
                  placeholder="address@domain.org"
                  className="field-input flex-1"
                />
                <button
                  type="button"
                  onClick={handleAddNotifEmail}
                  disabled={!notifInput.trim() || notifEmails.length >= 5}
                  className="secondary-button flex-shrink-0 disabled:opacity-40"
                >
                  <Plus className="h-4 w-4" /> Add
                </button>
              </div>
            ) : (
              <p className="mt-3 text-xs text-[var(--muted-2)]">Maximum of 5 addresses reached.</p>
            )}

            {/* Save */}
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleSaveNotifEmails}
                disabled={notifBusy}
                className="primary-button disabled:opacity-50"
              >
                {notifBusy ? 'Saving…' : 'Save addresses'}
              </button>
              {notifMessage ? (
                <span className="text-xs text-[var(--muted)]">{notifMessage}</span>
              ) : null}
            </div>
          </div>
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
