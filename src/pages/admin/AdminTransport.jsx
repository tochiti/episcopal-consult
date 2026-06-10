import { useEffect, useMemo, useState } from 'react';
import { Car, Check, Plane, Plus, Save, Trash2, Users, X } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';
import AdminPageHeader from '../../components/AdminPageHeader';
import {
  deleteTransport,
  getTransports,
  saveTransport,
  updateDelegate,
} from '../../db';
import { composeFullName, formatDate, normalizeStatus } from '../../lib/registrations';

export default function AdminTransport() {
  const { registrations, loading } = useOutletContext();
  const [vehicles, setVehicles] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [draft, setDraft] = useState({ vehicleDescription: '', vehiclePlate: '', driverName: '', driverPhone: '', capacity: '4', pickupLocation: 'Port Harcourt International Airport', notes: '' });
  const [saving, setSaving] = useState(false);
  const [, forceTick] = useState(0);
  const [selectedDate, setSelectedDate] = useState('');

  useEffect(() => {
    let active = true;
    getTransports()
      .then((data) => {
        if (active) setVehicles(data);
      })
      .catch((err) => console.error('Could not load transports:', err));
    return () => {
      active = false;
    };
  }, []);

  const delegates = useMemo(
    () => registrations.filter((r) => normalizeStatus(r.status) !== 'Declined'),
    [registrations]
  );

  const arrivalDates = useMemo(() => {
    const set = new Set();
    delegates.forEach((d) => {
      if (d.dateOfArrival) set.add(d.dateOfArrival);
    });
    return Array.from(set).sort();
  }, [delegates]);

  const arrivalsForDate = useMemo(
    () => delegates.filter((d) => d.dateOfArrival === (selectedDate || (arrivalDates[0] || ''))),
    [delegates, selectedDate, arrivalDates]
  );

  const counts = useMemo(() => {
    const out = { total: 0, assigned: 0 };
    delegates.forEach((d) => {
      if (d.requireInternalTransport === 'Yes') {
        out.total += 1;
        if (d.transportId) out.assigned += 1;
      }
    });
    return out;
  }, [delegates]);

  const handleSaveVehicle = async (event) => {
    event.preventDefault();
    if (!draft.vehicleDescription.trim() || !draft.driverName.trim()) return;
    setSaving(true);
    try {
      const result = await saveTransport(draft);
      setVehicles((current) =>
        [...current, { ...draft, id: result.id }].sort((a, b) =>
          (a.vehicleDescription || '').localeCompare(b.vehicleDescription || '')
        )
      );
      setDraft({ vehicleDescription: '', vehiclePlate: '', driverName: '', driverPhone: '', capacity: '4', pickupLocation: 'Port Harcourt International Airport', notes: '' });
      setShowForm(false);
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteVehicle = async (id) => {
    if (!window.confirm('Delete this vehicle? Delegates assigned to it will need to be re-assigned.')) return;
    try {
      await deleteTransport(id);
      setVehicles((current) => current.filter((v) => v.id !== id));
    } catch (error) {
      console.error(error);
    }
  };

  const handleAssign = async (delegateId, patch) => {
    try {
      await updateDelegate(delegateId, patch);
      forceTick((n) => n + 1);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      <AdminPageHeader
        eyebrow="Operations"
        title="Airport"
        accent="pickups."
        copy={`Schedule vehicles for arriving delegates. ${counts.total} delegates have requested pickup, ${counts.assigned} of whom are already assigned to a vehicle.`}
        actions={[
          {
            label: showForm ? 'Close' : 'Add vehicle',
            icon: showForm ? X : Plus,
            kind: showForm ? 'outline' : 'primary',
            onClick: () => setShowForm((v) => !v),
          },
        ]}
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <KPI label="Pickup requests" value={counts.total} icon={Plane} />
        <KPI label="Assigned" value={counts.assigned} icon={Check} />
        <KPI label="Vehicles in fleet" value={vehicles.length} icon={Car} />
      </div>

      {showForm ? (
        <form onSubmit={handleSaveVehicle} className="surface-glass grid gap-4 p-5 sm:grid-cols-2 sm:p-7">
          <label className="block">
            <span className="field-label">Vehicle description</span>
            <input
              type="text"
              required
              value={draft.vehicleDescription}
              onChange={(event) => setDraft((d) => ({ ...d, vehicleDescription: event.target.value }))}
              placeholder="Toyota Hiace (white)"
              className="field-input"
            />
          </label>
          <label className="block">
            <span className="field-label">Plate number</span>
            <input
              type="text"
              value={draft.vehiclePlate}
              onChange={(event) => setDraft((d) => ({ ...d, vehiclePlate: event.target.value }))}
              placeholder="ABC-123-DE"
              className="field-input"
            />
          </label>
          <label className="block">
            <span className="field-label">Driver name</span>
            <input
              type="text"
              required
              value={draft.driverName}
              onChange={(event) => setDraft((d) => ({ ...d, driverName: event.target.value }))}
              placeholder="Full name"
              className="field-input"
            />
          </label>
          <label className="block">
            <span className="field-label">Driver phone</span>
            <input
              type="tel"
              value={draft.driverPhone}
              onChange={(event) => setDraft((d) => ({ ...d, driverPhone: event.target.value }))}
              placeholder="+234…"
              className="field-input"
            />
          </label>
          <label className="block">
            <span className="field-label">Capacity</span>
            <input
              type="number"
              min="1"
              value={draft.capacity}
              onChange={(event) => setDraft((d) => ({ ...d, capacity: event.target.value }))}
              className="field-input"
            />
          </label>
          <label className="block">
            <span className="field-label">Default pickup location</span>
            <input
              type="text"
              value={draft.pickupLocation}
              onChange={(event) => setDraft((d) => ({ ...d, pickupLocation: event.target.value }))}
              placeholder="Port Harcourt International Airport"
              className="field-input"
            />
          </label>
          <label className="block sm:col-span-2">
            <span className="field-label">Notes</span>
            <textarea
              value={draft.notes}
              onChange={(event) => setDraft((d) => ({ ...d, notes: event.target.value }))}
              placeholder="Driver's shift, contact timing, anything else…"
              className="field-textarea"
            />
          </label>
          <div className="flex justify-end sm:col-span-2">
            <button type="submit" disabled={saving} className="primary-button">
              <Save className="h-4 w-4" /> {saving ? 'Saving…' : 'Save vehicle'}
            </button>
          </div>
        </form>
      ) : null}

      {vehicles.length > 0 ? (
        <section className="surface-glass p-5 sm:p-7">
          <PanelHeader label="Fleet" title="Vehicles & drivers" />
          <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {vehicles.map((v) => (
              <li key={v.id} className="rounded-xl border border-[var(--line)] bg-[rgba(12,6,8,0.4)] p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-[var(--text)]">{v.vehicleDescription}</p>
                    <p className="mt-0.5 truncate font-mono text-xs text-[var(--muted)]">{v.vehiclePlate || '—'}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteVehicle(v.id)}
                    className="inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-[var(--line)] text-[var(--muted)] transition hover:border-[var(--err)] hover:text-[var(--err)]"
                    aria-label="Delete vehicle"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="mt-3 space-y-1 border-t border-[var(--line)] pt-3 text-[11px] text-[var(--muted-2)]">
                  <p className="truncate">Driver: <span className="text-[var(--text)]">{v.driverName}</span></p>
                  {v.driverPhone ? <p className="font-mono">{v.driverPhone}</p> : null}
                  {v.pickupLocation ? <p className="truncate">From: {v.pickupLocation}</p> : null}
                </div>
                <div className="mt-3 flex items-center justify-between border-t border-[var(--line)] pt-3 text-xs">
                  <span className="text-[var(--muted-2)]">Capacity {v.capacity || 1}</span>
                  <span className="font-mono text-[var(--accent)]">
                    {delegates.filter((d) => d.transportId === v.id).length} assigned
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="surface-glass p-5 sm:p-7">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <PanelHeader label="Arrivals" title="Pickup schedule" inline />
          {arrivalDates.length > 0 ? (
            <label className="block">
              <span className="field-label">Arrival date</span>
              <select
                value={selectedDate}
                onChange={(event) => setSelectedDate(event.target.value)}
                className="field-select min-w-[14rem]"
              >
                {arrivalDates.map((d) => (
                  <option key={d} value={d}>{formatDate(d)}</option>
                ))}
              </select>
            </label>
          ) : null}
        </div>

        {arrivalDates.length === 0 ? (
          <p className="mt-4 text-sm text-[var(--muted)]">No arrival dates recorded yet.</p>
        ) : (
          <div className="mt-4 space-y-2.5">
            {loading ? (
              <p className="text-sm text-[var(--muted)]">Loading…</p>
            ) : arrivalsForDate.length === 0 ? (
              <p className="text-sm text-[var(--muted)]">No delegates are arriving on this date.</p>
            ) : (
              arrivalsForDate.map((d) => (
                <ArrivalRow
                  key={d.id}
                  delegate={d}
                  vehicles={vehicles}
                  onAssign={(patch) => handleAssign(d.id, patch)}
                />
              ))
            )}
          </div>
        )}
      </section>
    </div>
  );
}

function PanelHeader({ label, title, inline = false }) {
  return inline ? (
    <div>
      <p className="eyebrow">{label}</p>
      <h2 className="display-heading mt-1.5 text-xl text-[var(--text)]">{title}</h2>
    </div>
  ) : (
    <div>
      <p className="eyebrow">{label}</p>
      <h2 className="display-heading mt-1.5 text-2xl text-[var(--text)]">{title}</h2>
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

function ArrivalRow({ delegate, vehicles, onAssign }) {
  return (
    <div className="rounded-xl border border-[var(--line)] bg-[rgba(12,6,8,0.4)] p-3.5">
      <div className="grid gap-3 sm:grid-cols-[minmax(0,1.3fr)_minmax(0,0.7fr)_minmax(0,1.4fr)_minmax(0,0.6fr)] sm:items-center">
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-9 w-9 flex-shrink-0 overflow-hidden rounded-lg border border-[var(--line-strong)] bg-black">
            {delegate.passportPhoto ? (
              <img src={delegate.passportPhoto} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-[var(--muted-2)]">
                <Users className="h-4 w-4" />
              </div>
            )}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-[var(--text)]">{composeFullName(delegate) || '—'}</p>
            <p className="truncate text-[11px] text-[var(--muted-2)]">{delegate.province || '—'}</p>
          </div>
        </div>
        <div>
          <p className="eyebrow">Travel</p>
          <p className="mt-1 text-sm text-[var(--text)]">{delegate.modeOfTravel || '—'}</p>
        </div>
        <label className="block">
          <span className="field-label">Assign vehicle</span>
          <select
            value={delegate.transportId || ''}
            onChange={(event) => onAssign({ transportId: event.target.value || null })}
            className="field-select"
          >
            <option value="">— unassigned —</option>
            {vehicles.map((v) => (
              <option key={v.id} value={v.id}>
                {v.vehicleDescription} · {v.driverName}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="field-label">Confirmed</span>
          <button
            type="button"
            onClick={() => onAssign({ pickupConfirmed: !delegate.pickupConfirmed })}
            className={`mt-1 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border text-sm font-semibold transition ${
              delegate.pickupConfirmed
                ? 'border-[rgba(95,185,138,0.32)] bg-[rgba(95,185,138,0.10)] text-[var(--ok)]'
                : 'border-[var(--line)] bg-[rgba(12,6,8,0.4)] text-[var(--muted)] hover:border-[var(--line-strong)]'
            }`}
          >
            {delegate.pickupConfirmed ? <><Check className="h-4 w-4" /> Confirmed</> : 'Mark confirmed'}
          </button>
        </label>
      </div>
    </div>
  );
}
