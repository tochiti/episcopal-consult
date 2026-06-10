import {
  ArrowRight,
  CalendarRange,
  CheckCircle2,
  ClipboardList,
  Phone,
  ShieldCheck,
  MapPin,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { DNDN_FACTS } from '../lib/registrations';
import PublicFooter from '../components/PublicFooter';

const steps = [
  {
    icon: ClipboardList,
    no: '01',
    title: 'Enter delegate details',
    copy: 'Title, name, province, diocese, position and any other affiliation. Each diocese is locked to its province.',
  },
  {
    icon: CalendarRange,
    no: '02',
    title: 'Travel and arrival',
    copy: 'Mode of travel, expected date of arrival, and whether the delegate needs internal transport or is travelling with a driver or escort.',
  },
  {
    icon: CheckCircle2,
    no: '03',
    title: 'Preview and submit',
    copy: 'Review every entry before submission. Add more delegates in one batch, then submit the whole group at once.',
  },
];

const contacts = [
  {
    name: 'Rev Canon Gideon Genka',
    role: 'Secretariat',
    phone: '08060821822',
    dial: 'tel:+2348060821822',
    whatsapp: 'https://wa.me/2348060821822',
  },
  {
    name: 'Engr. Edwin Amadi',
    role: 'Logistics',
    phone: '08036716352',
    dial: 'tel:+2348036716352',
    whatsapp: 'https://wa.me/2348036716352',
  },
];

const stats = [
  { lbl: 'Diocese', value: DNDN_FACTS.name },
  { lbl: 'Host Bishop', value: 'Rt Revd W. B. Ihunwo' },
  { lbl: 'Cathedral', value: "St Paul's, Diobu" },
  { lbl: 'City', value: 'Port Harcourt' },
];

export default function LandingPage() {
  return (
    <div className="page-shell relative overflow-hidden">
      <div className="shell-container relative z-10 pt-6 sm:pt-8 lg:pt-10">
        <header className="flex items-center justify-between gap-3">
          <Link to="/" className="flex items-center gap-3">
            <img src="/logo.png" alt="DNDN" className="brand-logo" />
            <div>
              <p className="eyebrow">Episcopal Consultation</p>
              <p className="text-sm font-semibold text-[var(--text)]">Registration Portal</p>
            </div>
          </Link>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link to="/dashboard" className="ghost-link hidden sm:inline-flex">Look up status</Link>
            <Link to="/register" className="primary-button px-4 py-2.5 text-sm sm:px-5 sm:py-3">
              Register
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </header>
      </div>

      <main className="shell-container relative z-10 mt-8 sm:mt-12">
        {/* HERO */}
        <section className="surface-glass relative overflow-hidden px-6 py-10 sm:px-10 sm:py-14 lg:px-14 lg:py-16">
          <span className="hero-blob" style={{ top: '-20%', right: '-8%', width: 480, height: 480, background: 'radial-gradient(circle, rgba(224,178,90,0.20), transparent 70%)' }} aria-hidden />
          <span className="hero-blob" style={{ bottom: '-30%', left: '-12%', width: 460, height: 460, background: 'radial-gradient(circle, rgba(110,29,42,0.55), transparent 70%)' }} aria-hidden />

          <div className="relative grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[var(--line-strong)] bg-[rgba(224,178,90,0.07)] px-3.5 py-1.5">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--accent)]" />
                <span className="font-mono text-[0.6rem] font-bold uppercase tracking-[0.28em] text-[var(--accent)]">
                  Hosted by the {DNDN_FACTS.name}
                </span>
              </div>

              <h1 className="display-heading mt-6 text-[2.6rem] sm:text-[4rem] lg:text-[5.4rem]">
                Episcopal Consultation <span className="display-yellow">registration</span>
              </h1>

              <p className="mt-6 max-w-2xl text-base leading-8 text-[var(--muted)] sm:text-lg">
                Registration portal for delegates attending the Episcopal Consultation of the Church of Nigeria (Anglican Communion).
                Submit your details so the host diocese can plan accreditation, transport, accommodation and protocol.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link to="/register" className="primary-button">
                  Start a registration
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link to="/dashboard" className="secondary-button">
                  Look up an existing record
                </Link>
              </div>

              <dl className="mt-10 grid max-w-2xl grid-cols-2 gap-x-6 gap-y-4 border-t border-[var(--line)] pt-6 sm:grid-cols-4">
                {stats.map((item) => (
                  <div key={item.lbl}>
                    <dt className="eyebrow-muted">{item.lbl}</dt>
                    <dd className="display-heading mt-1.5 text-base text-[var(--text)]">{item.value}</dd>
                  </div>
                ))}
              </dl>
            </div>

            {/* Right column */}
            <div className="grid gap-3">
              <div className="surface-glass p-6">
                <div className="flex items-center gap-3">
                  <span className="icon-chip bg-[var(--accent)] text-[#1a0c10]">
                    <MapPin className="h-5 w-5" />
                  </span>
                  <p className="eyebrow">Who is this for</p>
                </div>
                <p className="display-heading mt-4 text-2xl">
                  Archbishops, bishops, diocesan officials, faculty and secretariat staff attending the consultation.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="surface-soft p-5">
                  <p className="text-sm font-semibold text-[var(--text)]">Submit one at a time</p>
                  <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                    Use the standard form for a single delegate. Review and submit when ready.
                  </p>
                </div>
                <div className="surface-soft p-5">
                  <p className="text-sm font-semibold text-[var(--text)]">Or add a whole delegation</p>
                  <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                    Add several delegates in one session and submit them together under a single batch reference.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* STEPS */}
        <section className="page-section grid gap-4 lg:grid-cols-3">
          {steps.map(({ icon: Icon, no, title, copy }) => (
            <article key={title} className="surface-glass p-6">
              <div className="flex items-start justify-between">
                <div className="icon-chip bg-[rgba(224,178,90,0.10)] text-[var(--accent)]">
                  <Icon className="h-5 w-5" />
                </div>
                <span className="font-display text-3xl leading-none text-[rgba(224,178,90,0.32)]">{no}</span>
              </div>
              <h2 className="display-heading mt-6 text-2xl">{title}.</h2>
              <p className="mt-3 text-sm leading-7 text-[var(--muted)]">{copy}</p>
            </article>
          ))}
        </section>

        {/* INFO + CONTACTS */}
        <section className="page-section grid gap-6 lg:grid-cols-[1fr_0.95fr]">
          <div className="surface-glass p-7 sm:p-8">
            <p className="eyebrow">What the host diocese uses this for</p>
            <h2 className="display-heading mt-3 text-3xl sm:text-4xl">Planning, not marketing.</h2>
            <p className="mt-3 max-w-xl text-sm leading-7 text-[var(--muted)]">
              The information you submit goes to the secretariat of the host diocese. It is used to print badges, allocate
              accommodation, schedule airport pickups, and brief the protocol team. Nothing is sent to third parties.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {['Accreditation', 'Accommodation', 'Airport pickup', 'Protocol briefing', 'Dietary needs', 'Special assistance'].map(
                (tag) => (
                  <span key={tag} className="tag">
                    {tag}
                  </span>
                )
              )}
            </div>
          </div>

          <div className="grid gap-4">
            <div className="surface-glass p-7">
              <div className="flex items-start gap-4">
                <div className="icon-chip bg-[var(--accent)] text-[#1a0c10]">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <p className="eyebrow">Already submitted</p>
                  <h2 className="display-heading mt-3 text-2xl">Look up your record by email.</h2>
                  <p className="mt-2 text-sm leading-7 text-[var(--muted)]">
                    The status dashboard returns the latest record matching the email you used at registration. No login required.
                  </p>
                  <div className="mt-5">
                    <Link to="/dashboard" className="primary-button">
                      Open status dashboard
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            <div className="surface-soft p-6">
              <div className="flex items-start gap-4">
                <div className="icon-chip" style={{ background: 'rgba(110,29,42,0.7)', color: 'white' }}>
                  <Phone className="h-5 w-5" />
                </div>
                <div className="w-full">
                  <p className="eyebrow">Secretariat contacts</p>
                  <h2 className="display-heading mt-3 text-2xl">Talk to a person.</h2>
                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    {contacts.map((contact) => (
                      <div key={contact.phone} className="rounded-xl border border-[var(--line)] bg-[rgba(12,6,8,0.5)] p-4">
                        <p className="font-semibold text-[var(--text)]">{contact.name}</p>
                        <p className="mt-0.5 text-[11px] uppercase tracking-[0.18em] text-[var(--muted-2)]">{contact.role}</p>
                        <p className="mt-1.5 font-mono text-xs text-[var(--muted)]">{contact.phone}</p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <a href={contact.dial} className="secondary-button px-3.5 py-2 text-xs">Call</a>
                          <a href={contact.whatsapp} target="_blank" rel="noreferrer" className="primary-button px-3.5 py-2 text-xs">WhatsApp</a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
