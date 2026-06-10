import { useState, useMemo } from 'react';
import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  CircleAlert,
  Copy,
  Eye,
  Mail,
  MessageCircle,
  Phone,
  Plus,
  Trash2,
  Users,
  X,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { saveRegistration, saveRegistrationBatch } from '../db';
import PublicLayout from '../components/PublicLayout';
import PassportUpload from '../components/PassportUpload';
import { composeFullName, DNDN_FACTS, PROGRAMME_DATES } from '../lib/registrations';
import {
  HONORIFIC_OTHER,
  HONORIFICS_OPTIONS,
  OTHERS_BODIES_OPTIONS,
  PROVINCE_OPTIONS,
  PROVINCE_OTHER,
  TRAVEL_MODES,
  YES_NO,
  getDiocesesForProvince,
} from '../lib/registrationOptions';

const emptyDelegate = () => ({
  /* Identity */
  title: '',
  titleOther: '',
  firstName: '',
  lastName: '',
  position: '',
  /* Geography */
  province: '',
  diocese: '',
  body: '',
  dioceseOther: '',
  /* Contact */
  whatsappNumber: '',
  emailAddress: '',
  /* Travel */
  dateOfArrival: '',
  modeOfTravel: '',
  requireInternalTransport: 'No',
  comingWithDriverEscort: 'No',
  driverName: '',
  driverPhoneNumber: '',
  escortName: '',
  escortPhoneNumber: '',
  /* Passport */
  passportPhoto: null,
  passportMime: null,
  passportSizeBytes: 0,
  passportWidth: 0,
  passportHeight: 0,
  passportFileName: '',
  /* Operations — set by the admin later; declared here so the form
     state has a complete shape and nothing leaks as `undefined`. */
  accommodationId: null,
  roomNumber: '',
  checkInDate: '',
  checkOutDate: '',
  transportId: null,
  pickupConfirmed: false,
  /* Protocol */
  vipLevel: 'regular',
  dietaryRequirements: '',
  specialNeeds: '',
  protocolNotes: '',
});

/* Validate the affiliation block — handles the cascading
   province → diocese / body / dioceseOther logic. */
const affiliationIsFilled = (d) => {
  if (!d.province) return false;
  if (d.province === PROVINCE_OTHER) {
    if (!d.body) return false;
    if (d.body === HONORIFIC_OTHER) return Boolean(d.dioceseOther);
    return true;
  }
  return Boolean(d.diocese);
};

const isDelegateComplete = (d) => {
  /* Honorific: "Other (specify)" needs a typed-in titleOther. */
  const titleOk = d.title && (d.title !== HONORIFIC_OTHER || d.titleOther);
  return Boolean(
    titleOk &&
      d.firstName &&
      d.lastName &&
      d.position &&
      affiliationIsFilled(d) &&
      d.whatsappNumber &&
      d.emailAddress &&
      d.dateOfArrival &&
      d.modeOfTravel &&
      d.passportPhoto
  );
};

function Ornament({ tone = 'gold' }) {
  const color = tone === 'gold' ? 'var(--accent)' : 'rgba(224,178,90,0.35)';
  return (
    <div className="flex items-center justify-center gap-3" aria-hidden>
      <span className="h-px w-12 sm:w-20" style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }} />
      <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden>
        <path d="M7 0v14M0 7h14" stroke={color} strokeWidth="1" />
      </svg>
      <span className="h-px w-12 sm:w-20" style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }} />
    </div>
  );
}

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
    updateActive({ province, diocese: '', body: '', dioceseOther: '' });
  };

  const onTitleChange = (title) => {
    /* Clear the custom text field unless the user picked "Other (specify)". */
    if (title === HONORIFIC_OTHER) {
      updateActive({ title });
    } else {
      updateActive({ title, titleOther: '' });
    }
  };

  const onBodyChange = (body) => {
    if (body === HONORIFIC_OTHER) {
      updateActive({ body });
    } else {
      updateActive({ body, dioceseOther: '' });
    }
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

  if (view === 'success' && submittedBatch) {
    return <SuccessView batch={submittedBatch} onAnother={() => {
      setDelegates([emptyDelegate()]);
      setActiveIdx(0);
      setView('form');
      setSubmittedBatch(null);
    }} />;
  }

  if (view === 'preview') {
    return (
      <PreviewView
        delegates={delegates}
        onEdit={(idx) => { setActiveIdx(idx); setView('form'); }}
        onBack={() => setView('form')}
        onSubmit={handleSubmit}
        loading={loading}
        error={error}
      />
    );
  }

  return (
    <PublicLayout>
      <div className="page-shell relative">
        <main className="relative z-10 pt-6 sm:pt-10 lg:pt-12">
          <div className="shell-container">
            {/* Page hero — eyebrow + centred title + programme date + back link */}
            <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
              <Ornament />
              <p className="eyebrow mt-7">Delegate registration</p>
              <h1 className="display-heading mt-3 text-[2.5rem] leading-[0.95] sm:text-[4.5rem]">
                Submit your <span className="display-accent">details.</span>
              </h1>
              <p className="mt-4 inline-flex items-center gap-2 rounded-full border border-[var(--line-strong)] bg-[rgba(224,178,90,0.06)] px-3.5 py-1.5 font-mono text-[0.6rem] font-bold uppercase tracking-[0.24em] text-[var(--accent)]">
                <Calendar className="h-3.5 w-3.5" />
                {PROGRAMME_DATES.displayUpper}
              </p>
              <p className="mt-4 max-w-xl text-[15px] leading-7 text-[var(--muted)] sm:text-base">
                Registration for the {DNDN_FACTS.name} host of the Episcopal Consultation. Add a single
                delegate or several — the host secretariat receives the whole batch under one reference.
              </p>
            </div>

            {/* Two-column layout — form on the left, sidebar on the right */}
            <div className="mt-12 grid gap-6 lg:grid-cols-[1fr_320px] lg:items-start lg:gap-8">
              <div className="min-w-0">
                <DelegateStrip
                  delegates={delegates}
                  activeIdx={activeIdx}
                  onSelect={setActiveIdx}
                  onAdd={addDelegate}
                  onRemove={removeDelegate}
                  onClearAll={clearAll}
                />

                <DelegateForm
                  key={activeIdx}
                  delegate={active}
                  onChange={updateActive}
                  onProvinceChange={onProvinceChange}
                  onTitleChange={onTitleChange}
                  onBodyChange={onBodyChange}
                  error={error}
                />

                <div className="mt-6 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-end">
                  <button type="button" onClick={() => addDelegate()} className="secondary-button">
                    <Plus className="h-4 w-4" /> Add another delegate
                  </button>
                  <button type="button" onClick={goToPreview} disabled={loading} className="primary-button">
                    <Eye className="h-4 w-4" /> Preview &amp; submit
                  </button>
                </div>
              </div>

              <FormSidebar />
            </div>
          </div>
        </main>
      </div>
    </PublicLayout>
  );
}

function DelegateStrip({ delegates, activeIdx, onSelect, onAdd, onRemove, onClearAll }) {
  return (
    <div className="surface-glass mb-6 flex items-center gap-2 overflow-x-auto px-3 py-2.5">
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

function DelegateForm({ delegate, onChange, onProvinceChange, onTitleChange, onBodyChange, error }) {
  const handle = (field) => (event) => onChange({ [field]: event.target.value });
  const dioceseOptions = useMemo(() => getDiocesesForProvince(delegate.province), [delegate.province]);
  const isOtherProvince = delegate.province === PROVINCE_OTHER;
  const isOtherBody = delegate.body === HONORIFIC_OTHER;
  const isOtherHonorific = delegate.title === HONORIFIC_OTHER;

  return (
    <div className="surface-glass p-5 sm:p-8 lg:p-10">
      {error ? (
        <div className="mb-6 flex items-start gap-2.5 rounded-xl border border-[rgba(229,119,135,0.32)] bg-[rgba(229,119,135,0.10)] p-4 text-sm text-[var(--err)]">
          <CircleAlert className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      ) : null}

      <form className="space-y-10" onSubmit={(event) => event.preventDefault()}>
        <Section title="Identity" no="01" description="Honorific, name, and the office the delegate holds.">
          <Field label="Honorific" required>
            <select
              value={delegate.title}
              onChange={(event) => onTitleChange(event.target.value)}
              required
              autoComplete="honorific-prefix"
              className="field-select"
            >
              <option value="">Select honorific</option>
              {HONORIFICS_OPTIONS.map((h) => (
                <option key={h} value={h}>{h}</option>
              ))}
            </select>
          </Field>

          {isOtherHonorific ? (
            <Field label="Custom honorific" required hint="Type the full honorific exactly as it should appear on the badge.">
              <input
                type="text"
                value={delegate.titleOther || ''}
                onChange={handle('titleOther')}
                required
                autoFocus
                autoComplete="honorific-prefix"
                placeholder="e.g. Hon., Barr., Ven. Mrs."
                className="field-input"
              />
            </Field>
          ) : (
            <div className="hidden sm:block" aria-hidden />
          )}

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
        </Section>

        <Section
          title="Province & Diocese"
          no="02"
          description="Select the province first, then the diocese. Choose Other (specify) for theological colleges, missionary dioceses, or bodies that don't fit under a province."
        >
          <Field label="Province" required>
            <select
              value={delegate.province}
              onChange={(event) => onProvinceChange(event.target.value)}
              required
              className="field-select"
            >
              <option value="">Select province</option>
              {PROVINCE_OPTIONS.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </Field>

          {isOtherProvince ? (
            <>
              <Field
                label="Body / Affiliation"
                required
                hint="Theological colleges, CONNAM, missionary dioceses and similar."
              >
                <select
                  value={delegate.body}
                  onChange={(event) => onBodyChange(event.target.value)}
                  required
                  className="field-select"
                >
                  <option value="">Select body</option>
                  {OTHERS_BODIES_OPTIONS.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </Field>

              {isOtherBody ? (
                <Field label="Custom body" required hint="Type the body or institution you represent.">
                  <input
                    type="text"
                    value={delegate.dioceseOther}
                    onChange={handle('dioceseOther')}
                    required
                    autoFocus
                    placeholder="e.g. Diocese of…"
                    className="field-input"
                  />
                </Field>
              ) : null}
            </>
          ) : (
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
          )}
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
              <div className="rounded-xl border border-[var(--line)] bg-[rgba(12,6,8,0.5)] p-4 sm:p-5">
                <p className="eyebrow">Driver / escort details</p>
                <div className="mt-3 grid gap-4 sm:grid-cols-2">
                  <Field label="Driver's Name">
                    <input type="text" value={delegate.driverName} onChange={handle('driverName')} placeholder="Full name" className="field-input" />
                  </Field>
                  <Field label="Driver's Phone">
                    <input type="tel" value={delegate.driverPhoneNumber} onChange={handle('driverPhoneNumber')} placeholder="+234…" className="field-input" />
                  </Field>
                  <Field label="Escort's Name">
                    <input type="text" value={delegate.escortName} onChange={handle('escortName')} placeholder="Full name" className="field-input" />
                  </Field>
                  <Field label="Escort's Phone">
                    <input type="tel" value={delegate.escortPhoneNumber} onChange={handle('escortPhoneNumber')} placeholder="+234…" className="field-input" />
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
    </div>
  );
}

function Section({ title, description, no, children }) {
  return (
    <section className="border-b border-[var(--line)] pb-8 last:border-b-0 last:pb-0">
      <div className="mb-6 flex items-end justify-between gap-3">
        <div>
          <p className="eyebrow">{title}</p>
          <p className="mt-1.5 text-[13px] leading-5 text-[var(--muted-2)]">{description}</p>
        </div>
        <span className="font-mono text-xs font-semibold tracking-[0.18em] text-[var(--muted-2)]">
          STEP {no}
        </span>
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

function FormSidebar() {
  return (
    <aside className="hidden space-y-4 lg:block">
      <div className="surface-soft p-5 sm:p-6">
        <p className="eyebrow">What to have ready</p>
        <ul className="mt-3 space-y-2.5 text-sm leading-6 text-[var(--muted)]">
          <li className="flex gap-2.5">
            <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[var(--accent)]" />
            Delegate's full title and surname as on travel documents.
          </li>
          <li className="flex gap-2.5">
            <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[var(--accent)]" />
            Province and diocese.
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
      <div className="surface-soft p-5 sm:p-6">
        <p className="eyebrow">About the host</p>
        <p className="display-heading mt-2 text-lg">{DNDN_FACTS.name}</p>
        <p className="mt-1.5 text-xs leading-5 text-[var(--muted)]">
          {DNDN_FACTS.province}. Host Bishop: {DNDN_FACTS.hostBishop}. Cathedral: {DNDN_FACTS.cathedral}.
        </p>
      </div>
      <div className="surface-soft p-5 sm:p-6">
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

function PreviewView({ delegates, onEdit, onBack, onSubmit, loading, error }) {
  return (
    <PublicLayout>
      <div className="page-shell relative">
        <main className="relative z-10 pt-6 sm:pt-10 lg:pt-12">
          <div className="shell-container max-w-5xl">
            <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
              <Ornament />
              <p className="eyebrow mt-7">Step 2 of 2</p>
              <h1 className="display-heading mt-3 text-[2.25rem] leading-[0.95] sm:text-[4rem]">
                Review your <span className="display-accent">delegation.</span>
              </h1>
              <p className="mt-4 max-w-md text-[15px] leading-7 text-[var(--muted)]">
                {delegates.length === 1
                  ? 'One delegate. Confirm the details below, then submit.'
                  : `${delegates.length} delegates in this batch. Confirm each card, then submit them all under one reference.`}
              </p>
            </div>

            {error ? (
              <div className="mt-6 flex items-start gap-2.5 rounded-xl border border-[rgba(229,119,135,0.32)] bg-[rgba(229,119,135,0.10)] p-4 text-sm text-[var(--err)]">
                <CircleAlert className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            ) : null}

            <div className="mt-10 grid gap-4">
              {delegates.map((d, i) => (
                <PreviewCard key={i} index={i} delegate={d} onEdit={() => onEdit(i)} />
              ))}
            </div>

            <div className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-end">
              <button type="button" onClick={onBack} className="secondary-button">Edit</button>
              <button type="button" onClick={onSubmit} disabled={loading} className="primary-button">
                {loading ? 'Submitting…' : 'Submit registration'}
                {!loading ? <CheckCircle2 className="h-4 w-4" /> : null}
              </button>
            </div>
          </div>
        </main>
      </div>
    </PublicLayout>
  );
}

function PreviewCard({ delegate, index, onEdit }) {
  /* Honorific — "Other (specify)" resolves to the typed-in text. */
  const titleValue =
    delegate.title === HONORIFIC_OTHER ? delegate.titleOther || '—' : delegate.title || '—';

  /* Diocese display — province cascade. */
  const dioceseValue =
    delegate.province === PROVINCE_OTHER
      ? delegate.body === HONORIFIC_OTHER
        ? delegate.dioceseOther || '—'
        : delegate.body || '—'
      : delegate.diocese || '—';

  const rows = [
    ['Honorific', titleValue],
    ['Name', [delegate.firstName, delegate.lastName].filter(Boolean).join(' ') || '—'],
    ['Position', delegate.position || '—'],
    ['Province', delegate.province || '—'],
    ['Diocese / Body', dioceseValue],
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
            <h2 className="display-heading mt-1 text-2xl text-[var(--text-bright)]">
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
            <dd className="mt-1 text-sm text-[var(--text-bright)]">{v || '—'}</dd>
          </div>
        ))}
        {delegate.comingWithDriverEscort === 'Yes' ? (
          <>
            <PreviewRow k="Driver" v={delegate.driverName} />
            <PreviewRow k="Driver phone" v={delegate.driverPhoneNumber} />
            <PreviewRow k="Escort" v={delegate.escortName} />
            <PreviewRow k="Escort phone" v={delegate.escortPhoneNumber} />
          </>
        ) : null}
      </dl>
    </article>
  );
}

function PreviewRow({ k, v }) {
  return (
    <div className="rounded-xl border border-[var(--line)] bg-[rgba(12,6,8,0.4)] p-3.5">
      <dt className="eyebrow">{k}</dt>
      <dd className="mt-1 text-sm text-[var(--text-bright)]">{v || '—'}</dd>
    </div>
  );
}

function SuccessView({ batch, onAnother }) {
  const isBatch = batch.batchId && batch.batchId !== 'SINGLE';
  const reference = isBatch
    ? batch.batchId
    : batch.registrations?.[0]?.id
      ? `DNDN-${batch.registrations[0].id.slice(0, 8).toUpperCase()}`
      : '—';

  return (
    <PublicLayout>
      <div className="page-shell relative">
        <span
          className="hero-blob"
          style={{ top: '-10%', left: '50%', transform: 'translateX(-50%)', width: 640, height: 640, background: 'radial-gradient(circle, rgba(95,185,138,0.16), transparent 65%)' }}
          aria-hidden
        />
        <span
          className="hero-blob"
          style={{ bottom: '-15%', right: '-8%', width: 480, height: 480, background: 'radial-gradient(circle, rgba(224,178,90,0.12), transparent 70%)' }}
          aria-hidden
        />

        <main className="relative z-10 pt-6 sm:pt-10 lg:pt-12">
          <div className="shell-container max-w-3xl">
            {/* Hero — confirmation */}
            <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
            <Ornament />
            <div className="mt-7 inline-flex items-center gap-2 rounded-full border border-[rgba(95,185,138,0.32)] bg-[rgba(95,185,138,0.10)] px-4 py-1.5">
              <CheckCircle2 className="h-4 w-4 text-[var(--ok)]" />
              <span className="font-mono text-[0.6rem] font-bold uppercase tracking-[0.24em] text-[var(--ok)]">
                {batch.count === 1 ? 'Registration submitted' : `${batch.count} delegates submitted`}
              </span>
            </div>
            <h1 className="display-heading mt-5 text-[2.5rem] leading-[0.95] sm:text-[4.5rem]">
              Your registration<br /><span className="display-accent">is in.</span>
            </h1>
            <p className="mt-4 inline-flex items-center gap-2 rounded-full border border-[var(--line-strong)] bg-[rgba(224,178,90,0.06)] px-3.5 py-1.5 font-mono text-[0.58rem] font-bold uppercase tracking-[0.24em] text-[var(--accent)]">
              <Calendar className="h-3.5 w-3.5" />
              {PROGRAMME_DATES.displayUpper}
            </p>
          </div>

          {/* Reference card — copyable */}
          <div className="mt-8">
            <CopyableReference
              label={isBatch ? 'Batch reference' : 'Submission reference'}
              value={reference}
              hint={isBatch
                ? `${batch.count} delegates under one reference. Keep this for your records.`
                : 'Keep this for your records. Use it when you look up your status.'}
            />
          </div>

          {/* Thank-you letter — formatted as a letter */}
          <article className="surface-glass mt-6 overflow-hidden">
            <header className="flex items-center gap-3 border-b border-[var(--line)] bg-[rgba(12,6,8,0.4)] px-6 py-4 sm:px-8">
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border border-[var(--line-strong)] bg-[rgba(95,185,138,0.10)] text-[var(--ok)]">
                <Mail className="h-4 w-4" />
              </div>
              <div>
                <p className="eyebrow">A note from the secretariat</p>
                <p className="mt-0.5 text-[13px] font-semibold text-[var(--text-bright)]">Episcopal Consultation Planning Committee</p>
              </div>
            </header>

            <div className="space-y-4 px-6 py-6 text-[15px] leading-7 text-[var(--muted)] sm:px-8 sm:py-8">
              <p>Your Grace / Your Lordship,</p>
              <p>
                Thank you so much for taking the time to share your details for the Church of Nigeria Episcopal
                Consultation. We truly appreciate your quick response and cooperation. Your information has been
                received with gratitude and will help us a lot as we prepare for the Consultation.
              </p>
              <p>
                We will share more details soon about accreditation, accommodation, transportation, protocol
                arrangements, and other logistics.
              </p>
              <p>If you need any help or further information, please feel free to reach out to:</p>

              <div className="grid gap-3 sm:grid-cols-2">
                <ContactCard
                  name="Rev. Canon Gideon Genka"
                  role="Secretariat"
                  phone="08060821822"
                  dial="tel:+2348060821822"
                  whatsapp="https://wa.me/2348060821822"
                />
                <ContactCard
                  name="Engr. Edwin Amadi"
                  role="Logistics"
                  phone="08036716352"
                  dial="tel:+2348036716352"
                  whatsapp="https://wa.me/2348036716352"
                />
              </div>

              <p>
                We&apos;re excited to welcome Your Grace/Your Lordship to the {DNDN_FACTS.name}. May the Lord
                continue to strengthen and bless your ministry.
              </p>

              <div className="pt-2">
                <p>Warmest regards,</p>
                <p className="mt-1 font-semibold text-[var(--text-bright)]">Episcopal Consultation Planning Committee</p>
                <p>{DNDN_FACTS.name} (DNDN)</p>
              </div>
            </div>
          </article>

          {/* What's next — three small cards */}
          <section className="mt-8">
            <p className="eyebrow">What happens next</p>
            <h2 className="display-heading mt-1.5 text-2xl text-[var(--text-bright)] sm:text-3xl">We&apos;ll be in touch.</h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <NextStep
                no="01"
                title="Approval"
                copy="The secretariat reviews your details and confirms your accreditation."
              />
              <NextStep
                no="02"
                title="Logistics"
                copy="Accommodation, airport pickup and protocol briefing are scheduled from your travel info."
              />
              <NextStep
                no="03"
                title="Arrival"
                copy="Arrive on your travel date — your badge, room and pickup are ready."
              />
            </div>
          </section>

          {/* CTAs */}
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link to="/dashboard" className="primary-button justify-center">
              Look up status by email
              <ArrowRight className="h-4 w-4" />
            </Link>
            <button type="button" onClick={onAnother} className="secondary-button justify-center">
              <Plus className="h-4 w-4" /> Submit another registration
            </button>
          </div>
        </div>
      </main>
      </div>
    </PublicLayout>
  );
}

/* Copyable reference — tap/click to copy the batch or submission ID. */
function CopyableReference({ label, value, hint }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (copyError) {
      console.warn('Clipboard write failed', copyError);
    }
  };
  return (
    <div className="surface-glass p-5 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="eyebrow">{label}</p>
          <p className="mt-2 break-all font-mono text-lg font-semibold text-[var(--accent)] sm:text-xl">{value}</p>
          {hint ? <p className="mt-1.5 text-[12px] text-[var(--muted-2)]">{hint}</p> : null}
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="secondary-button justify-center px-4 py-2.5 text-xs sm:text-sm"
          aria-label="Copy reference"
        >
          {copied ? (
            <>
              <CheckCircle2 className="h-4 w-4 text-[var(--ok)]" /> Copied
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" /> Copy reference
            </>
          )}
        </button>
      </div>
    </div>
  );
}

function ContactCard({ name, role, phone, dial, whatsapp }) {
  return (
    <div className="rounded-xl border border-[var(--line)] bg-[rgba(12,6,8,0.4)] p-4 transition hover:border-[var(--line-strong)]">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border border-[var(--line-strong)] bg-[rgba(224,178,90,0.08)] text-[var(--accent)]">
          <Phone className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-[var(--text-bright)]">{name}</p>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--muted-2)]">{role}</p>
          <p className="mt-1 font-mono text-sm text-[var(--accent)]">{phone}</p>
        </div>
      </div>
      <div className="mt-3 flex gap-2">
        <a href={dial} className="btn-outline flex-1 justify-center px-3 py-2 text-xs">
          <Phone className="h-3.5 w-3.5" /> Call
        </a>
        <a
          href={whatsapp}
          target="_blank"
          rel="noreferrer"
          className="btn-primary flex-1 justify-center px-3 py-2 text-xs"
        >
          <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
        </a>
      </div>
    </div>
  );
}

function NextStep({ no, title, copy }) {
  return (
    <div className="rounded-xl border border-[var(--line)] bg-[var(--bg-3)] p-4 sm:p-5">
      <div className="flex items-center justify-between gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--line-strong)] bg-[rgba(224,178,90,0.08)] text-[var(--accent)]">
          <CheckCircle2 className="h-4 w-4" />
        </div>
        <span className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--muted-2)]">
          STEP {no}
        </span>
      </div>
      <p className="mt-3 text-[15px] font-semibold text-[var(--text-bright)]">{title}.</p>
      <p className="mt-1.5 text-[12.5px] leading-6 text-[var(--muted)]">{copy}</p>
    </div>
  );
}
