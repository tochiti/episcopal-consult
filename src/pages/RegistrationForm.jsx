import { useState, useMemo } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  CircleAlert,
  Eye,
  Plus,
  Trash2,
  Users,
  X,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { saveRegistration, saveRegistrationBatch } from '../db';
import PublicFooter from '../components/PublicFooter';
import PassportUpload from '../components/PassportUpload';
import { composeFullName, DNDN_FACTS } from '../lib/registrations';
import {
  AFFILIATION_SUGGESTIONS,
  PROVINCE_OPTIONS,
  TITLE_OPTIONS,
  TRAVEL_MODES,
  YES_NO,
  getDiocesesForProvince,
} from '../lib/registrationOptions';

const emptyDelegate = () => ({
  title: '',
  firstName: '',
  lastName: '',
  position: '',
  otherAffiliation: '',
  province: '',
  diocese: '',
  whatsappNumber: '',
  emailAddress: '',
  dateOfArrival: '',
  modeOfTravel: '',
  requireInternalTransport: 'No',
  comingWithDriverEscort: 'No',
  driverName: '',
  driverPhoneNumber: '',
  escortName: '',
  escortPhoneNumber: '',
  passportPhoto: null,
  passportMime: null,
  passportSizeBytes: 0,
  passportWidth: 0,
  passportHeight: 0,
  passportFileName: '',
});

const isDelegateComplete = (d) =>
  Boolean(
    d.title &&
      d.firstName &&
      d.lastName &&
      d.position &&
      d.province &&
      d.diocese &&
      d.whatsappNumber &&
      d.emailAddress &&
      d.dateOfArrival &&
      d.modeOfTravel &&
      d.passportPhoto
  );

export default function RegistrationForm() {
  const [delegates, setDelegates] = useState([emptyDelegate()]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [view, setView] = useState('form'); // 'form' | 'preview' | 'success'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submittedBatch, setSubmittedBatch] = useState(null);

  const active = delegates[activeIdx];

  const updateActive = (patch) => {
    setDelegates((current) =>
      current.map((d, i) => (i === activeIdx ? { ...d, ...patch } : d))
    );
  };

  const onProvinceChange = (province) => {
    updateActive({ province, diocese: '' });
  };

  const addDelegate = () => {
    if (delegates.length >= 12) return;
    setDelegates((current) => [...current, emptyDelegate()]);
    setActiveIdx(delegates.length);
  };

  const removeDelegate = (idx) => {
    if (delegates.length === 1) return;
    setDelegates((current) => current.filter((_, i) => i !== idx));
    setActiveIdx((current) => Math.max(0, Math.min(current, delegates.length - 2)));
  };

  const clearAll = () => {
    if (!window.confirm('Clear all delegates and start over?')) return;
    setDelegates([emptyDelegate()]);
    setActiveIdx(0);
    setError('');
  };

  const goToPreview = () => {
    const incomplete = delegates.findIndex((d) => !isDelegateComplete(d));
    if (incomplete !== -1) {
      setActiveIdx(incomplete);
      setError(`Complete delegate ${incomplete + 1} before previewing.`);
      return;
    }
    setError('');
    setView('preview');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      if (delegates.length === 1) {
        const result = await saveRegistration(delegates[0]);
        setSubmittedBatch({ batchId: 'SINGLE', count: 1, registrations: [result] });
      } else {
        const result = await saveRegistrationBatch(delegates);
        setSubmittedBatch({ batchId: result.batchId, count: result.registrations.length, registrations: result.registrations });
      }
      setView('success');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (submitError) {
      console.error(submitError);
      setError('We could not submit your registration. Please try again or contact the secretariat.');
    } finally {
      setLoading(false);
    }
  };

  /* ---------- SUCCESS VIEW ---------- */
  if (view === 'success' && submittedBatch) {
    return (
      <SuccessView
        batch={submittedBatch}
        onAnother={() => {
          setDelegates([emptyDelegate()]);
          setActiveIdx(0);
          setView('form');
          setSubmittedBatch(null);
        }}
      />
    );
  }

  /* ---------- PREVIEW VIEW ---------- */
  if (view === 'preview') {
    return (
      <PreviewView
        delegates={delegates}
        onEdit={(idx) => {
          setActiveIdx(idx);
          setView('form');
        }}
        onBack={() => setView('form')}
        onSubmit={handleSubmit}
        loading={loading}
        error={error}
      />
    );
  }

  /* ---------- FORM VIEW ---------- */
  return (
    <div className="page-shell relative pb-32 lg:pb-12">
      <div className="shell-container relative z-10 max-w-6xl py-8 sm:py-10">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Link to="/" className="ghost-link">
              <ArrowLeft className="h-4 w-4" /> Back to homepage
            </Link>
            <p className="eyebrow mt-5">Delegate registration</p>
            <h1 className="display-heading mt-2 text-4xl leading-[0.95] text-[var(--text)] sm:text-5xl lg:text-6xl">
              Submit your <span className="display-yellow">details.</span>
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--muted)] sm:text-base">
              Registration for the {DNDN_FACTS.name} host of the Episcopal Consultation. Add a single delegate or several — the
              host secretariat receives the whole batch under one reference.
            </p>
          </div>
          <div className="surface-soft p-4 sm:max-w-xs">
            <p className="eyebrow">Already registered?</p>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">Use the status dashboard to look up an existing record.</p>
            <Link to="/dashboard" className="ghost-link mt-3 text-[var(--accent)]">
              Open status dashboard <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </header>

        <DelegateStrip
          delegates={delegates}
          activeIdx={activeIdx}
          onSelect={setActiveIdx}
          onAdd={addDelegate}
          onRemove={removeDelegate}
          onClearAll={clearAll}
        />

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_0.36fr]">
          <DelegateForm
            key={activeIdx}
            delegate={active}
            onChange={updateActive}
            onProvinceChange={onProvinceChange}
            error={error}
          />
          <FormSidebar />
        </div>
      </div>

      {/* Mobile sticky action bar */}
      <div className="mobile-action-bar">
        <div className="mx-auto flex max-w-3xl items-center gap-2">
          <button
            type="button"
            onClick={() => addDelegate()}
            className="secondary-button flex-1 px-3 py-2.5 text-xs sm:text-sm"
          >
            <Plus className="h-4 w-4" /> Add delegate
          </button>
          <button
            type="button"
            onClick={goToPreview}
            disabled={loading}
            className="primary-button flex-1 px-3 py-2.5 text-xs sm:text-sm"
          >
            <Eye className="h-4 w-4" /> Preview & submit
          </button>
        </div>
      </div>

      {/* Desktop action row */}
      <div className="shell-container relative z-10 mt-8 hidden lg:block">
        <div className="flex items-center justify-end gap-3">
          <button type="button" onClick={() => addDelegate()} className="secondary-button">
            <Plus className="h-4 w-4" /> Add another delegate
          </button>
          <button type="button" onClick={goToPreview} disabled={loading} className="primary-button">
            <Eye className="h-4 w-4" /> Preview & submit
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------------- */
/* DELEGATE STRIP                                                             */
/* ------------------------------------------------------------------------- */
function DelegateStrip({ delegates, activeIdx, onSelect, onAdd, onRemove, onClearAll }) {
  return (
    <div className="surface-glass mt-6 flex items-center gap-2 overflow-x-auto px-3 py-2.5">
      {delegates.map((d, i) => {
        const complete = isDelegateComplete(d);
        const name = [d.firstName, d.lastName].filter(Boolean).join(' ') || `Delegate ${i + 1}`;
        return (
          <button
            key={i}
            type="button"
            onClick={() => onSelect(i)}
            className={`group inline-flex flex-shrink-0 items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition ${
              i === activeIdx
                ? 'border-[var(--accent)] bg-[rgba(224,178,90,0.10)] text-[var(--accent)]'
                : 'border-[var(--line)] text-[var(--muted)] hover:border-[var(--line-strong)] hover:text-[var(--text)]'
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${complete ? 'bg-[var(--ok)]' : 'bg-[var(--warn)]'}`}
              title={complete ? 'Complete' : 'Incomplete'}
            />
            <span className="font-mono uppercase tracking-[0.16em]">#{i + 1}</span>
            <span className="max-w-[160px] truncate">{name}</span>
            {delegates.length > 1 ? (
              <span
                role="button"
                tabIndex={-1}
                onClick={(event) => {
                  event.stopPropagation();
                  onRemove(i);
                }}
                className="ml-1 inline-flex h-4 w-4 items-center justify-center rounded-full text-[var(--muted-2)] hover:bg-[rgba(229,119,135,0.18)] hover:text-[var(--err)]"
                aria-label={`Remove ${name}`}
              >
                <X className="h-3 w-3" />
              </span>
            ) : null}
          </button>
        );
      })}
      {delegates.length < 12 ? (
        <button
          type="button"
          onClick={onAdd}
          className="inline-flex flex-shrink-0 items-center gap-1.5 rounded-full border border-dashed border-[var(--line-strong)] px-3.5 py-1.5 text-xs font-semibold text-[var(--accent)] transition hover:bg-[rgba(224,178,90,0.06)]"
        >
          <Plus className="h-3.5 w-3.5" /> Add delegate
        </button>
      ) : null}
      {delegates.length > 1 ? (
        <button
          type="button"
          onClick={onClearAll}
          className="ml-auto inline-flex flex-shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--muted-2)] hover:text-[var(--err)]"
        >
          <Trash2 className="h-3 w-3" /> Clear all
        </button>
      ) : null}
    </div>
  );
}

/* ------------------------------------------------------------------------- */
/* DELEGATE FORM                                                              */
/* ------------------------------------------------------------------------- */
function DelegateForm({ delegate, onChange, onProvinceChange, error }) {
  const handle = (field) => (event) => onChange({ [field]: event.target.value });
  const dioceseOptions = useMemo(() => getDiocesesForProvince(delegate.province), [delegate.province]);

  return (
    <main className="surface-glass p-5 sm:p-8 lg:p-10">
      {error ? (
        <div className="mb-6 rounded-xl border border-[rgba(229,119,135,0.32)] bg-[rgba(229,119,135,0.10)] p-4 text-sm text-[var(--err)]">
          {error}
        </div>
      ) : null}

      <form className="space-y-8" onSubmit={(event) => event.preventDefault()}>
        <Section title="Identity" no="01" description="Title, name, and the office the delegate holds.">
          <Field label="Title" required>
            <select
              value={delegate.title}
              onChange={handle('title')}
              required
              className="field-select"
            >
              <option value="">Select title</option>
              {TITLE_OPTIONS.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </Field>

          <Field label="First Name" required>
            <input
              type="text"
              value={delegate.firstName}
              onChange={handle('firstName')}
              required
              autoComplete="given-name"
              placeholder="Christian name"
              className="field-input"
            />
          </Field>

          <Field label="Surname" required>
            <input
              type="text"
              value={delegate.lastName}
              onChange={handle('lastName')}
              required
              autoComplete="family-name"
              placeholder="Family name"
              className="field-input"
            />
          </Field>

          <Field label="Position / Office" required>
            <input
              type="text"
              value={delegate.position}
              onChange={handle('position')}
              required
              placeholder="Diocesan Bishop, Dean, Provincial Secretary…"
              className="field-input"
            />
          </Field>

          <Field label="Other Affiliation" hint="Use this if the delegate is from a body that is not a diocese — Vining College of Theology, the Church of Nigeria Headquarters, etc.">
            <input
              type="text"
              value={delegate.otherAffiliation}
              onChange={handle('otherAffiliation')}
              list="affiliation-suggestions"
              placeholder="Vining College of Theology"
              className="field-input"
            />
            <datalist id="affiliation-suggestions">
              {AFFILIATION_SUGGESTIONS.map((a) => (
                <option key={a} value={a} />
              ))}
            </datalist>
          </Field>
        </Section>

        <Section title="Province & Diocese" no="02" description="Select the province first — only dioceses belonging to that province are offered.">
          <Field label="Province" required>
            <select
              value={delegate.province}
              onChange={(event) => onProvinceChange(event.target.value)}
              required
              className="field-select"
            >
              <option value="">Select province</option>
              {PROVINCE_OPTIONS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Diocese" required hint={!delegate.province ? 'Choose a province first.' : null}>
            <select
              value={delegate.diocese}
              onChange={handle('diocese')}
              required
              disabled={!delegate.province}
              className="field-select disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">{delegate.province ? 'Select diocese' : '— select province first —'}</option>
              {dioceseOptions.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </Field>
        </Section>

        <Section title="Contact" no="03" description="The secretariat will use these for all correspondence.">
          <Field label="WhatsApp Number" required>
            <input
              type="tel"
              value={delegate.whatsappNumber}
              onChange={handle('whatsappNumber')}
              required
              autoComplete="tel"
              placeholder="+234 800 000 0000"
              className="field-input"
            />
          </Field>
          <Field label="Email Address" required>
            <input
              type="email"
              value={delegate.emailAddress}
              onChange={handle('emailAddress')}
              required
              autoComplete="email"
              placeholder="name@domain.org"
              className="field-input"
            />
          </Field>
        </Section>

        <Section title="Travel" no="04" description="Arrival information used to schedule airport pickups and protocol.">
          <Field label="Date of Arrival" required>
            <input
              type="date"
              value={delegate.dateOfArrival}
              onChange={handle('dateOfArrival')}
              required
              className="field-input"
            />
          </Field>
          <Field label="Mode of Travel" required>
            <select
              value={delegate.modeOfTravel}
              onChange={handle('modeOfTravel')}
              required
              className="field-select"
            >
              <option value="">Select mode</option>
              {TRAVEL_MODES.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Needs internal transport?">
            <select value={delegate.requireInternalTransport} onChange={handle('requireInternalTransport')} className="field-select">
              {YES_NO.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Travelling with driver or escort?">
            <select value={delegate.comingWithDriverEscort} onChange={handle('comingWithDriverEscort')} className="field-select">
              {YES_NO.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </Field>

          {delegate.comingWithDriverEscort === 'Yes' ? (
            <div className="sm:col-span-2">
              <div className="rounded-xl border border-[var(--line)] bg-[rgba(12,6,8,0.5)] p-4">
                <p className="eyebrow">Driver / escort details</p>
                <div className="mt-3 grid gap-4 sm:grid-cols-2">
                  <Field label="Driver's Name">
                    <input
                      type="text"
                      value={delegate.driverName}
                      onChange={handle('driverName')}
                      placeholder="Full name"
                      className="field-input"
                    />
                  </Field>
                  <Field label="Driver's Phone">
                    <input
                      type="tel"
                      value={delegate.driverPhoneNumber}
                      onChange={handle('driverPhoneNumber')}
                      placeholder="+234…"
                      className="field-input"
                    />
                  </Field>
                  <Field label="Escort's Name">
                    <input
                      type="text"
                      value={delegate.escortName}
                      onChange={handle('escortName')}
                      placeholder="Full name"
                      className="field-input"
                    />
                  </Field>
                  <Field label="Escort's Phone">
                    <input
                      type="tel"
                      value={delegate.escortPhoneNumber}
                      onChange={handle('escortPhoneNumber')}
                      placeholder="+234…"
                      className="field-input"
                    />
                  </Field>
                </div>
              </div>
            </div>
          ) : null}
        </Section>

        <Section title="Passport photograph" no="05" description="Required for accreditation. Compressed in your browser before upload — no original file leaves your device.">
          <div className="sm:col-span-2">
            <PassportUpload
              value={
                delegate.passportPhoto
                  ? {
                      passportPhoto: delegate.passportPhoto,
                      passportMime: delegate.passportMime,
                      passportSizeBytes: delegate.passportSizeBytes,
                      passportWidth: delegate.passportWidth,
                      passportHeight: delegate.passportHeight,
                      passportFileName: delegate.passportFileName,
                    }
                  : null
              }
              onChange={(val) => {
                if (!val) {
                  onChange({
                    passportPhoto: null,
                    passportMime: null,
                    passportSizeBytes: 0,
                    passportWidth: 0,
                    passportHeight: 0,
                    passportFileName: '',
                  });
                } else {
                  onChange(val);
                }
              }}
              required
            />
          </div>
        </Section>
      </form>
    </main>
  );
}

/* ------------------------------------------------------------------------- */
/* SECTION + FIELD                                                            */
/* ------------------------------------------------------------------------- */
function Section({ title, description, no, children }) {
  return (
    <section className="border-b border-[var(--line)] pb-7 last:border-b-0 last:pb-0">
      <div className="mb-5 flex items-end justify-between gap-3">
        <div>
          <p className="eyebrow">{title}</p>
          <p className="mt-1 text-xs leading-5 text-[var(--muted-2)]">{description}</p>
        </div>
        <span className="font-display text-3xl leading-none text-[rgba(224,178,90,0.30)]">{no}</span>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">{children}</div>
    </section>
  );
}

function Field({ label, required, hint, children }) {
  return (
    <label className="block">
      <span className="field-label">
        {label} {required ? <span className="text-[var(--err)]">*</span> : null}
      </span>
      {children}
      {hint ? <span className="field-hint">{hint}</span> : null}
    </label>
  );
}

/* ------------------------------------------------------------------------- */
/* SIDEBAR                                                                    */
/* ------------------------------------------------------------------------- */
function FormSidebar() {
  return (
    <aside className="hidden space-y-4 lg:block">
      <div className="surface-soft p-5">
        <p className="eyebrow">What to have ready</p>
        <ul className="mt-3 space-y-2.5 text-sm leading-6 text-[var(--muted)]">
          <li className="flex gap-2.5">
            <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[var(--accent)]" />
            Delegate's full title and surname as on travel documents.
          </li>
          <li className="flex gap-2.5">
            <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[var(--accent)]" />
            Province and diocese (or other affiliation for non-diocesan delegates).
          </li>
          <li className="flex gap-2.5">
            <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[var(--accent)]" />
            Expected date of arrival and mode of travel.
          </li>
          <li className="flex gap-2.5">
            <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[var(--accent)]" />
            A clear passport-style photograph, saved on the device.
          </li>
        </ul>
      </div>
      <div className="surface-soft p-5">
        <p className="eyebrow">About the host</p>
        <p className="display-heading mt-2 text-lg">{DNDN_FACTS.name}</p>
        <p className="mt-1.5 text-xs leading-5 text-[var(--muted)]">
          {DNDN_FACTS.province}. Host Bishop: {DNDN_FACTS.hostBishop}. Cathedral: {DNDN_FACTS.cathedral}.
        </p>
      </div>
      <div className="surface-soft p-5">
        <div className="flex items-start gap-2.5">
          <CircleAlert className="mt-0.5 h-4 w-4 flex-shrink-0 text-[var(--warn)]" />
          <div>
            <p className="eyebrow">Privacy</p>
            <p className="mt-1.5 text-xs leading-5 text-[var(--muted)]">
              Submissions are stored in the secretariat's records and used only for this consultation. Passport photos are
              compressed in your browser before upload.
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}

/* ------------------------------------------------------------------------- */
/* PREVIEW VIEW                                                               */
/* ------------------------------------------------------------------------- */
function PreviewView({ delegates, onEdit, onBack, onSubmit, loading, error }) {
  return (
    <div className="page-shell relative pb-32">
      <div className="shell-container relative z-10 max-w-5xl py-8 sm:py-10">
        <button type="button" onClick={onBack} className="ghost-link">
          <ArrowLeft className="h-4 w-4" /> Back to form
        </button>
        <p className="eyebrow mt-5">Step 2 of 2</p>
        <h1 className="display-heading mt-2 text-3xl leading-[0.95] text-[var(--text)] sm:text-4xl lg:text-5xl">
          Review your <span className="display-yellow">delegation.</span>
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--muted)]">
          {delegates.length === 1
            ? 'One delegate. Confirm the details below, then submit.'
            : `${delegates.length} delegates in this batch. Confirm each card, then submit them all under one reference.`}
        </p>

        {error ? (
          <div className="mt-5 rounded-xl border border-[rgba(229,119,135,0.32)] bg-[rgba(229,119,135,0.10)] p-4 text-sm text-[var(--err)]">
            {error}
          </div>
        ) : null}

        <div className="mt-7 grid gap-4">
          {delegates.map((d, i) => (
            <PreviewCard key={i} index={i} delegate={d} onEdit={() => onEdit(i)} />
          ))}
        </div>
      </div>

      <div className="mobile-action-bar">
        <div className="mx-auto flex max-w-3xl items-center gap-2">
          <button type="button" onClick={onBack} className="secondary-button flex-1 px-3 py-2.5 text-xs sm:text-sm">
            Edit
          </button>
          <button
            type="button"
            onClick={onSubmit}
            disabled={loading}
            className="primary-button flex-1 px-3 py-2.5 text-xs sm:text-sm"
          >
            {loading ? 'Submitting…' : 'Submit'}
          </button>
        </div>
      </div>

      <div className="shell-container relative z-10 mt-8 hidden lg:block">
        <div className="flex items-center justify-end gap-3">
          <button type="button" onClick={onBack} className="secondary-button">Edit</button>
          <button type="button" onClick={onSubmit} disabled={loading} className="primary-button">
            {loading ? 'Submitting…' : 'Submit registration'}
            {!loading ? <CheckCircle2 className="h-4 w-4" /> : null}
          </button>
        </div>
      </div>
    </div>
  );
}

function PreviewCard({ delegate, index, onEdit }) {
  const rows = [
    ['Title', delegate.title || '—'],
    ['Name', [delegate.firstName, delegate.lastName].filter(Boolean).join(' ') || '—'],
    ['Position', delegate.position || '—'],
    ['Other affiliation', delegate.otherAffiliation || '—'],
    ['Province', delegate.province || '—'],
    ['Diocese', delegate.diocese || '—'],
    ['WhatsApp', delegate.whatsappNumber || '—'],
    ['Email', delegate.emailAddress || '—'],
    ['Date of arrival', delegate.dateOfArrival || '—'],
    ['Mode of travel', delegate.modeOfTravel || '—'],
    ['Internal transport', delegate.requireInternalTransport],
    ['Driver / escort', delegate.comingWithDriverEscort],
  ];

  return (
    <article className="surface-glass p-5 sm:p-7">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-xl border border-[var(--line-strong)] bg-black">
            {delegate.passportPhoto ? (
              <img src={delegate.passportPhoto} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-[var(--muted-2)]">
                <Users className="h-5 w-5" />
              </div>
            )}
          </div>
          <div>
            <p className="eyebrow">Delegate {index + 1}</p>
            <h2 className="display-heading mt-1 text-2xl text-[var(--text)]">
              {composeFullName(delegate) || 'Unnamed delegate'}
            </h2>
            <p className="text-sm text-[var(--muted)]">{delegate.position || '—'}</p>
          </div>
        </div>
        <button type="button" onClick={onEdit} className="ghost-link text-[var(--accent)]">
          Edit
        </button>
      </div>
      <dl className="mt-5 grid gap-3 sm:grid-cols-2">
        {rows.map(([k, v]) => (
          <div key={k} className="rounded-xl border border-[var(--line)] bg-[rgba(12,6,8,0.4)] p-3.5">
            <dt className="eyebrow">{k}</dt>
            <dd className="mt-1 text-sm text-[var(--text)]">{v || '—'}</dd>
          </div>
        ))}
        {delegate.comingWithDriverEscort === 'Yes' ? (
          <>
            <Row k="Driver" v={delegate.driverName} />
            <Row k="Driver phone" v={delegate.driverPhoneNumber} />
            <Row k="Escort" v={delegate.escortName} />
            <Row k="Escort phone" v={delegate.escortPhoneNumber} />
          </>
        ) : null}
      </dl>
    </article>
  );
}

function Row({ k, v }) {
  return (
    <div className="rounded-xl border border-[var(--line)] bg-[rgba(12,6,8,0.4)] p-3.5">
      <dt className="eyebrow">{k}</dt>
      <dd className="mt-1 text-sm text-[var(--text)]">{v || '—'}</dd>
    </div>
  );
}

/* ------------------------------------------------------------------------- */
/* SUCCESS VIEW                                                               */
/* ------------------------------------------------------------------------- */
function SuccessView({ batch, onAnother }) {
  return (
    <div className="page-shell relative">
      <div className="shell-container relative z-10 max-w-4xl py-10 sm:py-14">
        <div className="surface-glass p-6 sm:p-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(95,185,138,0.32)] bg-[rgba(95,185,138,0.10)] px-3.5 py-1.5">
            <CheckCircle2 className="h-4 w-4 text-[var(--ok)]" />
            <span className="font-mono text-[0.6rem] font-bold uppercase tracking-[0.24em] text-[var(--ok)]">
              {batch.count === 1 ? 'Registration submitted' : `${batch.count} delegates submitted`}
            </span>
          </div>
          <h1 className="display-heading mt-5 text-4xl leading-[0.95] sm:text-5xl">
            Thank you. <span className="display-yellow">Your registration is in.</span>
          </h1>
          {batch.batchId && batch.batchId !== 'SINGLE' ? (
            <p className="mt-4 font-mono text-xs uppercase tracking-[0.18em] text-[var(--muted)]">
              Batch reference: <span className="text-[var(--accent)]">{batch.batchId}</span>
            </p>
          ) : null}

          <p className="mt-5 max-w-2xl text-base leading-8 text-[var(--muted)]">
            The secretariat of the {DNDN_FACTS.name} will review the submission and update the status to <em>Approved</em> once
            accreditation is confirmed. You can check the status at any time using the email used during registration.
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-[var(--line)] bg-[rgba(12,6,8,0.5)] p-5">
              <p className="eyebrow">Need to check status?</p>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">Use the same email to look up the record.</p>
              <Link to="/dashboard" className="primary-button mt-4">
                Open status dashboard <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="rounded-xl border border-[var(--line)] bg-[rgba(12,6,8,0.5)] p-5">
              <p className="eyebrow">Need to add more delegates?</p>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">Start a fresh batch — independent of this one.</p>
              <button type="button" onClick={onAnother} className="secondary-button mt-4">
                <Plus className="h-4 w-4" /> New registration
              </button>
            </div>
          </div>
        </div>
      </div>
      <PublicFooter />
    </div>
  );
}
