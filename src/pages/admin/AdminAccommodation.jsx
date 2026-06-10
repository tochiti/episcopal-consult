import { useEffect, useMemo, useState } from 'react';
import { BedDouble, Check, Hotel, Plus, Save, Trash2, X } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';
import AdminPageHeader from '../../components/AdminPageHeader';
import {
  deleteAccommodation,
  getAccommodations,
  saveAccommodation,
  updateDelegate,
} from '../../db';
import { composeFullName, normalizeStatus } from '../../lib/registrations';

export default function AdminAccommodation() {
  const { registrations, loading } = useOutletContext();
  const [hotels, setHotels] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [draft, setDraft] = useState({ name: '', address: '', contactPerson: '', contactPhone: '', totalRooms: '', notes: '' });
  const [saving, setSaving] = useState(false);
  const [, forceTick] = useState(0);
  const [filterHotel, setFilterHotel] = useState('');
  const [filterUnassigned, setFilterUnassigned] = useState(false);

  useEffect(() => {
    let active = true;
    getAccommodations()
      .then((data) => {
        if (active) setHotels(data);
      })
      .catch((err) => console.error('Could not load accommodations:', err));
    return () => {
      active = false;
    };
  }, []);

  const delegates = useMemo(
    () => registrations.filter((r) => normalizeStatus(r.status) !== 'Declined'),
    [registrations]
  );

  const counts = useMemo(() => {
    const out = { assigned: 0, unassigned: 0, byHotel: {} };
    delegates.forEach((d) => {
      if (d.accommodationId) {
        out.assigned += 1;
        out.byHotel[d.accommodationId] = (out.byHotel[d.accommodationId] || 0) + 1;
      } else {
        out.unassigned += 1;
      }
    });
    return out;
  }, [delegates]);

  const filtered = useMemo(() => {
    let list = delegates;
    if (filterHotel) list = list.filter((d) => d.accommodationId === filterHotel);
    if (filterUnassigned) list = list.filter((d) => !d.accommodationId);
    return list;
  }, [delegates, filterHotel, filterUnassigned]);

  const handleSaveHotel = async (event) => {
    event.preventDefault();
    if (!draft.name.trim()) return;
    setSaving(true);
    try {
      const result = await saveAccommodation(draft);
      setHotels((current) => [...current, { ...draft, id: result.id }].sort((a, b) => (a.name || '').localeCompare(b.name || '')));
      setDraft({ name: '', address: '', contactPerson: '', contactPhone: '', totalRooms: '', notes: '' });
      setShowForm(false);
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteHotel = async (id) => {
    if (!window.confirm('Delete this hotel? Delegates assigned to it will need to be re-assigned.')) return;
    try {
      await deleteAccommodation(id);
      setHotels((current) => current.filter((h) => h.id !== id));
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
        title="Allocate"
        accent="accommodation."
        copy={`Add hotels and hostels, then assign each delegate a room. ${counts.unassigned} of ${delegates.length} delegates are still unassigned.`}
        actions={[
          {
            label: showForm ? 'Close' : 'Add hotel',
            icon: showForm ? X : Plus,
            kind: showForm ? 'outline' : 'primary',
            onClick: () => setShowForm((v) => !v),
          },
        ]}
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <KPI label="Total delegates" value={delegates.length} icon={BedDouble} />
        <KPI label="Assigned" value={counts.assigned} icon={Check} />
        <KPI label="Unassigned" value={counts.unassigned} icon={Hotel} accent="text-[var(--warn)]" />
      </div>

      {showForm ? (
        <form onSubmit={handleSaveHotel} className="surface-glass grid gap-4 p-5 sm:grid-cols-2 sm:p-7">
          <label className="block sm:col-span-2">
            <span className="field-label">Hotel / Hostel name</span>
            <input
              type="text"
              required
              value={draft.name}
              onChange={(event) => setDraft((d) => ({ ...d, name: event.target.value }))}
              placeholder="e.g. Golden Tulip, Port Harcourt"
              className="field-input"
            />
          </label>
          <label className="block">
            <span className="field-label">Address</span>
            <input
              type="text"
              value={draft.address}
              onChange={(event) => setDraft((d) => ({ ...d, address: event.target.value }))}
              placeholder="Street, city"
              className="field-input"
            />
          </label>
          <label className="block">
            <span className="field-label">Total rooms / capacity</span>
            <input
              type="number"
              min="0"
              value={draft.totalRooms}
              onChange={(event) => setDraft((d) => ({ ...d, totalRooms: event.target.value }))}
              placeholder="e.g. 24"
              className="field-input"
            />
          </label>
          <label className="block">
            <span className="field-label">Contact person</span>
            <input
              type="text"
              value={draft.contactPerson}
              onChange={(event) => setDraft((d) => ({ ...d, contactPerson: event.target.value }))}
              placeholder="Front desk manager"
              className="field-input"
            />
          </label>
          <label className="block">
            <span className="field-label">Contact phone</span>
            <input
              type="tel"
              value={draft.contactPhone}
              onChange={(event) => setDraft((d) => ({ ...d, contactPhone: event.target.value }))}
              placeholder="+234…"
              className="field-input"
            />
          </label>
          <label className="block sm:col-span-2">
            <span className="field-label">Notes</span>
            <textarea
              value={draft.notes}
              onChange={(event) => setDraft((d) => ({ ...d, notes: event.target.value }))}
              placeholder="Distance from venue, check-in instructions, billing arrangements…"
              className="field-textarea"
            />
          </label>
          <div className="flex justify-end sm:col-span-2">
            <button type="submit" disabled={saving} className="primary-button">
              <Save className="h-4 w-4" /> {saving ? 'Saving…' : 'Save hotel'}
            </button>
          </div>
        </form>
      ) : null}

      {hotels.length > 0 ? (
        <section className="surface-glass p-5 sm:p-7">
          <PanelHeader label="Hotels & hostels" title="Master list" />
          <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {hotels.map((h) => (
              <li key={h.id} className="rounded-xl border border-[var(--line)] bg-[rgba(12,6,8,0.4)] p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-[var(--text)]">{h.name}</p>
                    <p className="mt-0.5 truncate text-xs text-[var(--muted)]">{h.address || '—'}</p>
                    {h.contactPerson ? (
                      <p className="mt-2 truncate text-[11px] text-[var(--muted-2)]">{h.contactPerson} · {h.contactPhone}</p>
                    ) : null}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteHotel(h.id)}
                    className="inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-[var(--line)] text-[var(--muted)] transition hover:border-[var(--err)] hover:text-[var(--err)]"
                    aria-label="Delete hotel"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="mt-3 flex items-center justify-between border-t border-[var(--line)] pt-3 text-xs">
                  <span className="text-[var(--muted-2)]">Capacity {h.totalRooms || '—'}</span>
                  <span className="font-mono text-[var(--accent)]">{counts.byHotel[h.id] || 0} assigned</span>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="surface-glass p-5 sm:p-7">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <PanelHeader label="Delegate assignments" title="Rooms" inline />
          <div className="flex flex-wrap gap-2">
            <label className="block">
              <span className="field-label">Filter hotel</span>
              <select
                value={filterHotel}
                onChange={(event) => setFilterHotel(event.target.value)}
                className="field-select min-w-[14rem]"
              >
                <option value="">All hotels</option>
                {hotels.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.name}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="button"
              onClick={() => setFilterUnassigned((v) => !v)}
              className={`secondary-button self-end ${filterUnassigned ? 'border-[var(--accent)] text-[var(--accent)]' : ''}`}
            >
              {filterUnassigned ? 'Showing unassigned' : 'Show unassigned'}
            </button>
          </div>
        </div>

        <div className="mt-4 space-y-2.5">
          {loading ? (
            <p className="text-sm text-[var(--muted)]">Loading delegates…</p>
          ) : filtered.length === 0 ? (
            <p className="text-sm text-[var(--muted)]">No delegates match the current filter.</p>
          ) : (
            filtered.map((d) => (
              <DelegateRow
                key={d.id}
                delegate={d}
                hotels={hotels}
                onAssign={(patch) => handleAssign(d.id, patch)}
              />
            ))
          )}
        </div>
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

function DelegateRow({ delegate, hotels, onAssign }) {
  return (
    <div className="rounded-xl border border-[var(--line)] bg-[rgba(12,6,8,0.4)] p-3.5">
      <div className="grid gap-3 sm:grid-cols-[minmax(0,1.4fr)_minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1fr)] sm:items-center">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-[var(--text)]">{composeFullName(delegate) || '—'}</p>
          <p className="truncate text-[11px] text-[var(--muted-2)]">
            {delegate.dateOfArrival ? `${delegate.dateOfArrival} · ` : ''}{delegate.province || ''}
          </p>
        </div>
        <label className="block">
          <span className="field-label">Hotel</span>
          <select
            value={delegate.accommodationId || ''}
            onChange={(event) => onAssign({ accommodationId: event.target.value || null })}
            className="field-select"
          >
            <option value="">— unassigned —</option>
            {hotels.map((h) => (
              <option key={h.id} value={h.id}>{h.name}</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="field-label">Room</span>
          <input
            type="text"
            value={delegate.roomNumber || ''}
            onChange={(event) => onAssign({ roomNumber: event.target.value })}
            placeholder="e.g. 214"
            className="field-input"
          />
        </label>
        <label className="block">
          <span className="field-label">Check-in</span>
          <input
            type="date"
            value={delegate.checkInDate || ''}
            onChange={(event) => onAssign({ checkInDate: event.target.value })}
            className="field-input"
          />
        </label>
      </div>
    </div>
  );
}
