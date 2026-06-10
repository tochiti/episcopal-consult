import { ArrowRight, Calendar, ClipboardList, Plane, BedDouble, Phone, ShieldCheck, Building2, Crown, Mail, MapPin, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { DNDN_FACTS, PROGRAMME_DATES } from '../lib/registrations';
import PublicLayout from '../components/PublicLayout';

const steps = [
  {
    no: '01',
    icon: ClipboardList,
    title: 'Submit your details',
    copy: 'Title, full name, province, diocese, position, travel logistics and a passport photo. Cascading province / diocese so you only see the right options.',
  },
  {
    no: '02',
    icon: Plane,
    title: 'We plan around you',
    copy: 'The host secretariat uses your details to schedule airport pickups, assign rooms, print your badge and brief the protocol team.',
  },
  {
    no: '03',
    icon: ShieldCheck,
    title: 'Look up any time',
    copy: 'Return with the same email and check your accreditation status, room and pickup time. No login required.',
  },
];

const hostFacts = [
  { lbl: 'Programme', value: PROGRAMME_DATES.short, Icon: Calendar },
  { lbl: 'Diocese', value: DNDN_FACTS.name, Icon: Building2 },
  { lbl: 'Host Bishop', value: DNDN_FACTS.hostBishop, Icon: User },
  { lbl: 'City', value: `${DNDN_FACTS.city}, ${DNDN_FACTS.state}`, Icon: MapPin },
];

const capabilities = [
  { icon: Crown, title: 'Accreditation', copy: 'Badges and ID cards printed for every approved delegate.' },
  { icon: BedDouble, title: 'Accommodation', copy: 'Hotels and rooms allocated to your stay, with check-in support.' },
  { icon: Plane, title: 'Airport pickup', copy: 'Vehicle and driver assigned to your arrival date and time.' },
  { icon: Building2, title: 'Protocol briefing', copy: 'VIP flags, dietary needs and special requirements captured early.' },
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

/* Small ornamental rule with a centred cross/dot — used between editorial blocks. */
function Ornament({ tone = 'gold' }) {
  const color = tone === 'gold' ? 'var(--accent)' : 'rgba(224,178,90,0.35)';
  return (
    <div className="flex items-center justify-center gap-3" aria-hidden>
      <span className="h-px w-16 sm:w-28" style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }} />
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
        <path d="M7 0v14M0 7h14" stroke={color} strokeWidth="1" />
      </svg>
      <span className="h-px w-16 sm:w-28" style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }} />
    </div>
  );
}

export default function LandingPage() {
  return (
    <PublicLayout>
      {/* ──────────────  HERO  ────────────── */}
      <section className="relative overflow-hidden pt-10 sm:pt-14 lg:pt-20">
        {/* Backdrop gradient + soft halo behind the seal */}
        <span
          className="hero-blob"
          style={{ top: '-15%', left: '50%', transform: 'translateX(-50%)', width: 720, height: 720, background: 'radial-gradient(circle, rgba(224,178,90,0.18), transparent 65%)' }}
          aria-hidden
        />
        <span
          className="hero-blob"
          style={{ bottom: '-30%', left: '-8%', width: 480, height: 480, background: 'radial-gradient(circle, rgba(110,29,42,0.45), transparent 70%)' }}
          aria-hidden
        />
        <span
          className="hero-blob"
          style={{ top: '20%', right: '-8%', width: 420, height: 420, background: 'radial-gradient(circle, rgba(110,29,42,0.30), transparent 70%)' }}
          aria-hidden
        />

        <div className="shell-container relative">
          <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
            <Ornament />

            <p className="mt-7 inline-flex items-center gap-2 rounded-full border border-[var(--line-strong)] bg-[rgba(224,178,90,0.06)] px-4 py-1.5 text-[11px]">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--accent)]" />
              <span className="eyebrow" style={{ fontSize: '0.6rem' }}>
                Hosted by the {DNDN_FACTS.name}
              </span>
            </p>

            {/* The seal — large, centred, with a soft gold halo. */}
            <div className="relative mt-9 sm:mt-12">
              <div
                className="absolute inset-0 -z-10 mx-auto rounded-full blur-3xl"
                style={{ background: 'radial-gradient(circle, rgba(224,178,90,0.30), transparent 65%)', width: '90%', height: '90%', top: '5%', left: '5%' }}
                aria-hidden
              />
              <img
                src="/logo.png"
                alt="Diocese of Niger Delta North seal"
                className="relative mx-auto h-44 w-44 sm:h-56 sm:w-56 lg:h-64 lg:w-64"
                style={{ objectFit: 'contain', filter: 'drop-shadow(0 12px 30px rgba(224,178,90,0.18))' }}
              />
            </div>

            <h1 className="display-heading mt-8 text-[3.25rem] leading-[0.95] sm:text-[5rem] lg:text-[6.25rem]">
              Episcopal<br />
              <span className="display-accent">Consultation</span>
            </h1>

            <p className="mt-4 inline-flex items-center gap-2 rounded-full border border-[var(--line-strong)] bg-[rgba(224,178,90,0.06)] px-3.5 py-1.5 font-mono text-[0.6rem] font-bold uppercase tracking-[0.24em] text-[var(--accent)]">
              <Calendar className="h-3.5 w-3.5" />
              {PROGRAMME_DATES.displayUpper}
            </p>

            <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.4em] text-[var(--muted-2)] sm:text-[11px]">
              Registration Portal · 2026
            </p>

            <p className="mt-6 max-w-xl text-[15px] leading-7 text-[var(--muted)] sm:text-base">
              Registration portal for delegates attending the Episcopal Consultation of the Church of Nigeria
              (Anglican Communion). Submit your details and the host diocese will plan around you.
            </p>

            <div className="mt-9 flex flex-col items-center gap-3 sm:flex-row">
              <Link to="/register" className="btn-primary px-7 py-3.5 text-[15px]">
                Start a registration
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/dashboard" className="btn-outline px-7 py-3.5 text-[15px]">
                Look up an existing record
              </Link>
            </div>

            <Ornament tone="muted" />
          </div>
        </div>

        {/* Host facts strip — sits below the hero, full bleed */}
        <div className="shell-container relative mt-10 sm:mt-14">
          <div className="card overflow-hidden">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 lg:divide-x lg:divide-[var(--line)]">
              {hostFacts.map(({ lbl, value, Icon }, i) => (
                <div
                  key={lbl}
                  className={`flex items-start gap-3 p-5 sm:p-6 ${i !== 0 ? 'border-t border-[var(--line)] sm:border-t-0 lg:border-t-0' : ''}`}
                >
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md border border-[var(--line-strong)] bg-[rgba(224,178,90,0.06)] text-[var(--accent)]">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="eyebrow-muted">{lbl}</p>
                    <p className="mt-1 text-[13.5px] font-semibold leading-snug text-[var(--text-bright)]">{value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────  HOW IT WORKS  ────────────── */}
      <section className="section">
        <div className="shell-container">
          <div className="mx-auto max-w-2xl text-center">
            <p className="eyebrow">How it works</p>
            <h2 className="display-heading mt-3 text-[2.5rem] leading-[0.95] sm:text-5xl">
              Three steps, one form.
            </h2>
            <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-[var(--muted)]">
              Each step takes less than a minute. Your record is stored against your email — the secretariat
              picks it up from there.
            </p>
          </div>

          <div className="relative mt-10 grid gap-4 lg:grid-cols-3">
            {steps.map(({ icon: Icon, no, title, copy }, idx) => (
              <article key={title} className="card relative flex h-full flex-col p-6 sm:p-7">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-[var(--line-strong)] bg-[rgba(224,178,90,0.08)] text-[var(--accent)]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="font-mono text-xs font-semibold tracking-[0.18em] text-[var(--muted-2)]">
                    STEP {no}
                  </span>
                </div>
                <h3 className="display-heading mt-6 text-2xl text-[var(--text-bright)]">
                  {title}.
                </h3>
                <p className="mt-3 text-sm leading-7 text-[var(--muted)]">{copy}</p>
                {idx < steps.length - 1 && (
                  <span
                    aria-hidden
                    className="absolute right-4 top-1/2 hidden h-px w-8 -translate-y-1/2 bg-[var(--line)] lg:block"
                  />
                )}
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ──────────────  CAPABILITIES  ────────────── */}
      <section className="section">
        <div className="shell-container">
          <div className="card p-7 sm:p-10 lg:p-12">
            <div className="grid items-start gap-8 lg:grid-cols-[1fr_1.4fr]">
              <div>
                <p className="eyebrow">What the host secretariat uses this for</p>
                <h2 className="display-heading mt-3 text-[2.25rem] leading-[0.95] sm:text-4xl">
                  Planning,<br />not paperwork.
                </h2>
                <p className="mt-4 max-w-md text-sm leading-7 text-[var(--muted)]">
                  Submissions go straight to the secretariat of the host diocese. Nothing is shared outside the
                  planning team. The information you give is used for accreditation, accommodation, transport and
                  protocol — the four operational systems of the host.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {capabilities.map(({ icon: Icon, title, copy }) => (
                  <div key={title} className="rounded-xl border border-[var(--line)] bg-[var(--bg-3)] p-5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--line-strong)] bg-[rgba(224,178,90,0.08)] text-[var(--accent)]">
                      <Icon className="h-4 w-4" />
                    </div>
                    <p className="mt-4 text-[15px] font-semibold text-[var(--text-bright)]">{title}</p>
                    <p className="mt-1.5 text-[13px] leading-6 text-[var(--muted)]">{copy}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────  STATUS LOOKUP + CONTACTS  ────────────── */}
      <section className="section">
        <div className="shell-container">
          <div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
            {/* Status lookup */}
            <div className="card relative overflow-hidden p-7 sm:p-8">
              <span
                aria-hidden
                className="absolute -right-12 -top-12 h-44 w-44 rounded-full opacity-30 blur-2xl"
                style={{ background: 'radial-gradient(circle, rgba(224,178,90,0.6), transparent 70%)' }}
              />
              <div className="relative flex items-start gap-4">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-[var(--accent)] text-[#1a0c10]">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="eyebrow">Already submitted</p>
                  <h2 className="display-heading mt-2 text-2xl sm:text-3xl text-[var(--text-bright)]">
                    Look up your record by email.
                  </h2>
                  <p className="mt-2 text-sm leading-7 text-[var(--muted)]">
                    The status dashboard returns your latest record. No account or login needed.
                  </p>
                  <div className="mt-5">
                    <Link to="/dashboard" className="btn-primary">
                      Open status dashboard
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Contacts */}
            <div className="card p-7 sm:p-8">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-[var(--wine)] text-white">
                  <Phone className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="eyebrow">Secretariat contacts</p>
                  <h2 className="display-heading mt-2 text-2xl sm:text-3xl text-[var(--text-bright)]">
                    Talk to a person.
                  </h2>
                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    {contacts.map((c) => (
                      <div key={c.phone} className="rounded-xl border border-[var(--line)] bg-[var(--bg-3)] p-4">
                        <p className="text-sm font-semibold text-[var(--text-bright)]">{c.name}</p>
                        <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--muted-2)]">{c.role}</p>
                        <p className="mt-2 font-mono text-xs text-[var(--muted)]">{c.phone}</p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <a href={c.dial} className="btn-outline px-3 py-1.5 text-xs">Call</a>
                          <a href={c.whatsapp} target="_blank" rel="noreferrer" className="btn-primary px-3 py-1.5 text-xs">WhatsApp</a>
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="mt-4 flex items-center gap-1.5 text-[11px] text-[var(--muted-2)]">
                    <Mail className="h-3 w-3" />
                    For privacy or data queries, contact the secretariat.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
