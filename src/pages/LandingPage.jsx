import { ArrowRight, CalendarRange, CheckCircle2, ClipboardList, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { DNDN_FACTS } from '../lib/registrations';

const steps = [
  {
    icon: ClipboardList,
    title: 'Submit your details',
    copy: 'Register once with your delegate details, contact information, and travel logistics.',
  },
  {
    icon: CalendarRange,
    title: 'Host review and planning',
    copy: 'The host team uses your submission to coordinate arrivals, internal transport, and status review.',
  },
  {
    icon: CheckCircle2,
    title: 'Track your status',
    copy: 'Return with the same email address to check the current registration status at any time.',
  },
];

export default function LandingPage() {
  return (
    <div className="page-shell py-6 sm:py-8 lg:py-10">
      <div className="shell-container">
        <header className="flex items-center justify-between gap-4 py-2">
          <Link to="/" className="flex items-center gap-3">
            <img src="/logo.png" alt="DNDN logo" className="h-11 w-11 rounded-full bg-white p-1.5 shadow-sm" />
            <div>
              <p className="eyebrow">Episcopal Consult</p>
              <p className="text-sm font-semibold text-slate-900">Registration Portal</p>
            </div>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/dashboard" className="ghost-link">Check status</Link>
            <Link to="/register" className="primary-button">Register now</Link>
          </div>
        </header>

        <main className="mt-6">
          <section className="surface-card overflow-hidden px-6 py-8 sm:px-8 lg:px-12 lg:py-12">
            <div className="grid gap-10 lg:grid-cols-[1.08fr_0.92fr] lg:items-end">
              <div>
                <p className="eyebrow">Episcopal consultation</p>
                <h1 className="mt-4 max-w-4xl font-serif text-[3.1rem] leading-[0.95] text-slate-950 sm:text-[4.2rem] lg:text-[5.5rem]">
                  A cleaner way to coordinate registration for a high-trust gathering.
                </h1>
                <p className="mt-6 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
                  This portal supports Episcopal Consultation registration for delegates connected with {DNDN_FACTS.name}.
                  Register quickly, submit arrival details cleanly, and check your status later without unnecessary friction.
                </p>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Link to="/register" className="primary-button">
                    Start registration
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link to="/dashboard" className="secondary-button">
                    Check registration status
                  </Link>
                </div>
              </div>

              <div className="grid gap-4">
                <div className="surface-soft p-6">
                  <p className="eyebrow">For delegates</p>
                  <p className="mt-3 text-2xl font-semibold leading-tight text-slate-950">
                    One focused form. One review flow. One place to check progress.
                  </p>
                  <p className="mt-4 text-sm leading-7 text-slate-600">
                    Designed to keep registration clear, fast, and consistent across attendance, travel planning, and follow-up.
                  </p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="surface-soft p-5">
                    <p className="text-sm font-semibold text-slate-900">Who should use this</p>
                    <p className="mt-3 text-sm leading-7 text-slate-600">
                      Clergy, coordinators, bishops, and official delegates expected at the consultation.
                    </p>
                  </div>
                  <div className="surface-soft p-5">
                    <p className="text-sm font-semibold text-slate-900">What you will need</p>
                    <p className="mt-3 text-sm leading-7 text-slate-600">
                      Your diocesan identity, contact details, arrival date, and travel arrangement information.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="mt-8 grid gap-4 lg:grid-cols-3">
            {steps.map(({ icon: Icon, title, copy }) => (
              <article key={title} className="surface-soft p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white">
                  <Icon className="h-5 w-5" />
                </div>
                <h2 className="mt-5 text-xl font-semibold text-slate-950">{title}</h2>
                <p className="mt-3 text-sm leading-7 text-slate-600">{copy}</p>
              </article>
            ))}
          </section>

          <section className="mt-8 grid gap-8 lg:grid-cols-[1fr_0.95fr]">
            <div className="surface-soft p-6 sm:p-8">
              <p className="eyebrow">What happens on the form</p>
              <h2 className="mt-4 font-serif text-4xl text-slate-950">Registration is separated from browsing on purpose.</h2>
              <p className="mt-4 max-w-2xl text-sm leading-8 text-slate-600">
                Instead of putting a long form on the homepage, the experience now starts with a clear landing page and routes
                users into a focused registration task. That keeps the public face clean while preserving the same backend-compatible flow.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <span className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700">
                  Delegate details
                </span>
                <span className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700">
                  Contact details
                </span>
                <span className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700">
                  Arrival logistics
                </span>
              </div>
            </div>

            <div className="surface-card overflow-hidden p-6 sm:p-8">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-600 text-white">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <p className="eyebrow">Status access</p>
                  <h2 className="mt-4 font-serif text-3xl text-slate-950">Already submitted your registration?</h2>
                  <p className="mt-4 text-sm leading-8 text-slate-600">
                    The public dashboard remains available for registrants who want to check approval status, travel review progress,
                    or whether their details have already been recorded.
                  </p>
                  <div className="mt-6">
                    <Link to="/dashboard" className="primary-button">
                      Open status dashboard
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
