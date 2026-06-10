import { useMemo, useState } from 'react';
import { Crown, Heart, Printer, ShieldCheck, Utensils } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';
import AdminPageHeader from '../../components/AdminPageHeader';
import { updateDelegate } from '../../db';
import { composeDiocese, composeFullName, normalizeStatus } from '../../lib/registrations';
import { VIP_LEVELS } from '../../lib/registrationOptions';

export default function AdminProtocol() {
  const { registrations } = useOutletContext();
  const [, forceTick] = useState(0);
  const [printMode, setPrintMode] = useState(false);
  const [showOnlyVIP, setShowOnlyVIP] = useState(false);

  const delegates = useMemo(
    () => registrations.filter((r) => normalizeStatus(r.status) !== 'Declined'),
    [registrations]
  );

  const visible = useMemo(
    () => (showOnlyVIP ? delegates.filter((d) => (d.vipLevel || 'regular') !== 'regular') : delegates),
    [delegates, showOnlyVIP]
  );

  const counts = useMemo(() => {
    const out = { archbishop: 0, dignitary: 0, special: 0, regular: 0, withDietary: 0, withSpecialNeeds: 0 };
    delegates.forEach((d) => {
      const v = d.vipLevel || 'regular';
      out[v] = (out[v] || 0) + 1;
      if (d.dietaryRequirements) out.withDietary += 1;
      if (d.specialNeeds) out.withSpecialNeeds += 1;
    });
    return out;
  }, [delegates]);

  const handleSave = async (delegateId, patch) => {
    try {
      await updateDelegate(delegateId, patch);
      forceTick((n) => n + 1);
    } catch (error) {
      console.error(error);
    }
  };

  const handlePrint = () => {
    setPrintMode(true);
    setTimeout(() => {
      window.print();
      setTimeout(() => setPrintMode(false), 200);
    }, 100);
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      <AdminPageHeader
        eyebrow="Operations"
        title="Protocol"
        accent="briefing."
        copy="Briefing notes for the protocol team — VIP flags, dietary needs, special requirements, and per-delegate notes. Print a clean briefing pack for the protocol desk."
        actions={[
          { label: 'Print briefing pack', icon: Printer, onClick: handlePrint },
        ]}
      />

      <div className="grid gap-3 sm:grid-cols-4">
        <KPI label="Archbishops" value={counts.archbishop} icon={Crown} accent="text-[var(--accent)]" />
        <KPI label="Dignitaries" value={counts.dignitary} icon={ShieldCheck} accent="text-[var(--accent)]" />
        <KPI label="Special guests" value={counts.special} icon={Heart} accent="text-[var(--accent)]" />
        <KPI label="Dietary needs" value={counts.withDietary} icon={Utensils} accent="text-[var(--accent)]" />
      </div>

      <div className="surface-glass flex flex-wrap items-center gap-2 px-3 py-2.5">
        <button
          type="button"
          onClick={() => setShowOnlyVIP(false)}
          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
            !showOnlyVIP
              ? 'border-[var(--accent)] bg-[rgba(224,178,90,0.10)] text-[var(--accent)]'
              : 'border-[var(--line)] text-[var(--muted)] hover:border-[var(--line-strong)] hover:text-[var(--text)]'
          }`}
        >
          All delegates ({delegates.length})
        </button>
        <button
          type="button"
          onClick={() => setShowOnlyVIP(true)}
          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
            showOnlyVIP
              ? 'border-[var(--accent)] bg-[rgba(224,178,90,0.10)] text-[var(--accent)]'
              : 'border-[var(--line)] text-[var(--muted)] hover:border-[var(--line-strong)] hover:text-[var(--text)]'
          }`}
        >
          VIP only ({counts.archbishop + counts.dignitary + counts.special})
        </button>
      </div>

      <div className="space-y-3 print:hidden">
        {visible.map((d) => (
          <ProtocolRow
            key={d.id}
            delegate={d}
            onSave={(patch) => handleSave(d.id, patch)}
          />
        ))}
      </div>

      {printMode ? <ProtocolPrintSheet delegates={visible} /> : null}

      <style>{`
        @media print {
          body * { visibility: hidden; }
          .protocol-print-root, .protocol-print-root * { visibility: visible; }
          .protocol-print-root { position: absolute; inset: 0; padding: 1cm; color: #000; background: #fff; }
          .protocol-print-root h1, .protocol-print-root h2, .protocol-print-root h3, .protocol-print-root p, .protocol-print-root span, .protocol-print-root div { color: #000 !important; }
          @page { size: A4; margin: 0.7cm; }
        }
      `}</style>
    </div>
  );
}

function ProtocolRow({ delegate, onSave }) {
  return (
    <div className="surface-glass p-4 sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <div className="flex flex-shrink-0 items-center gap-3">
          <div className="h-12 w-12 overflow-hidden rounded-lg border border-[var(--line-strong)] bg-black">
            {delegate.passportPhoto ? (
              <img src={delegate.passportPhoto} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-[var(--muted-2)]">
                <ShieldCheck className="h-4 w-4" />
              </div>
            )}
          </div>
          <div>
            <p className="eyebrow">Delegate</p>
            <p className="display-heading text-lg leading-[1.1] text-[var(--text)]">{composeFullName(delegate) || '—'}</p>
            <p className="text-[11px] text-[var(--muted-2)]">{composeDiocese(delegate) || '—'}</p>
          </div>
        </div>
        <div className="grid flex-1 gap-3 sm:grid-cols-3">
          <label className="block">
            <span className="field-label">Protocol level</span>
            <select
              value={delegate.vipLevel || 'regular'}
              onChange={(event) => onSave({ vipLevel: event.target.value })}
              className="field-select"
            >
              {VIP_LEVELS.map((v) => (
                <option key={v.value} value={v.value}>{v.label}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="field-label">Dietary</span>
            <input
              type="text"
              value={delegate.dietaryRequirements || ''}
              onChange={(event) => onSave({ dietaryRequirements: event.target.value })}
              placeholder="Vegetarian, halal, allergies…"
              className="field-input"
            />
          </label>
          <label className="block">
            <span className="field-label">Special needs</span>
            <input
              type="text"
              value={delegate.specialNeeds || ''}
              onChange={(event) => onSave({ specialNeeds: event.target.value })}
              placeholder="Mobility, language, allergies…"
              className="field-input"
            />
          </label>
          <label className="block sm:col-span-3">
            <span className="field-label">Protocol notes</span>
            <textarea
              value={delegate.protocolNotes || ''}
              onChange={(event) => onSave({ protocolNotes: event.target.value })}
              placeholder="Anything the protocol desk should know about this delegate…"
              className="field-textarea"
            />
          </label>
        </div>
      </div>
    </div>
  );
}

function ProtocolPrintSheet({ delegates }) {
  const grouped = useMemo(() => {
    const order = ['archbishop', 'dignitary', 'special', 'regular'];
    const map = { archbishop: [], dignitary: [], special: [], regular: [] };
    delegates.forEach((d) => {
      const v = d.vipLevel || 'regular';
      (map[v] || map.regular).push(d);
    });
    return order.filter((k) => map[k].length > 0).map((k) => ({ key: k, label: VIP_LEVELS.find((v) => v.value === k)?.label || k, list: map[k] }));
  }, [delegates]);

  return (
    <div className="protocol-print-root fixed inset-0 z-50 hidden bg-white print:block">
      <h1 className="text-2xl font-bold text-black">DNDN Episcopal Consultation — Protocol Briefing</h1>
      <p className="mt-1 text-xs text-black/70">Generated for the secretariat. Distribute to the protocol desk.</p>
      {grouped.map((group) => (
        <section key={group.key} className="mt-4 break-inside-avoid">
          <h2 className="border-b border-black/30 pb-1 text-base font-bold uppercase tracking-wider text-black">
            {group.label} ({group.list.length})
          </h2>
          <ul className="mt-2 grid gap-2 sm:grid-cols-2">
            {group.list.map((d) => (
              <li key={d.id} className="border border-black/30 p-2">
                <p className="text-sm font-bold text-black">{composeFullName(d) || '—'}</p>
                <p className="text-[10px] text-black/70">{composeDiocese(d) || '—'}</p>
                <p className="mt-1 text-[10px] text-black">Position: {d.position || '—'}</p>
                {d.dietaryRequirements ? <p className="text-[10px] text-black">Dietary: {d.dietaryRequirements}</p> : null}
                {d.specialNeeds ? <p className="text-[10px] text-black">Special: {d.specialNeeds}</p> : null}
                {d.protocolNotes ? <p className="text-[10px] text-black">Notes: {d.protocolNotes}</p> : null}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

function KPI({ label, value, icon: Icon, accent = 'text-[var(--accent)]' }) {
  return (
    <div className="surface-glass flex items-center gap-3 p-4">
      <div className={`icon-chip bg-[rgba(224,178,90,0.10)] ${accent}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <p className="eyebrow">{label}</p>
        <p className="display-heading mt-0.5 text-2xl text-[var(--text)]">{value}</p>
      </div>
    </div>
  );
}
