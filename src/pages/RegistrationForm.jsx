import { useState } from 'react';
import { ArrowRight, Bus, CalendarDays, CheckCircle2, CircleAlert, Mail, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import { saveRegistration } from '../db';
import { DNDN_FACTS } from '../lib/registrations';

const initialForm = {
  title: '',
  fullName: '',
  position: '',
  diocese: '',
  province: '',
  whatsappNumber: '',
  emailAddress: '',
  dateOfArrival: '',
  modeOfTravel: '',
  requireInternalTransport: 'No',
  comingWithDriverEscort: 'No',
  driverName: '',
  escortName: '',
};

const fieldGroups = [
  {
    title: 'Identity',
    description: 'Tell us who is attending and the diocesan office you represent.',
    fields: ['title', 'fullName', 'position', 'diocese', 'province'],
  },
  {
    title: 'Contact',
    description: 'We use these details for confirmation, logistics, and follow-up communication.',
    fields: ['whatsappNumber', 'emailAddress'],
  },
  {
    title: 'Travel Logistics',
    description: 'These details help the host team coordinate arrivals and any transport support.',
    fields: ['dateOfArrival', 'modeOfTravel', 'requireInternalTransport', 'comingWithDriverEscort'],
  },
];

export default function RegistrationForm() {
  const [formData, setFormData] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === 'comingWithDriverEscort' && value === 'No'
        ? { driverName: '', escortName: '' }
        : {}),
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      await saveRegistration(formData);
      setSubmitted(true);
      setFormData(initialForm);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (submitError) {
      console.error('Error saving registration', submitError);
      setError('We could not submit your registration right now. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="page-shell px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="glass-panel overflow-hidden p-8 sm:p-10">
            <div className="inline-flex rounded-full bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-800">
              Submission received
            </div>
            <h1 className="mt-6 font-serif text-4xl text-slate-950 sm:text-5xl">Registration completed successfully.</h1>
            <p className="mt-4 max-w-2xl text-base leading-8 text-slate-600">
              Thank you for completing the Episcopal Consultation registration. Your details are now in the DNDN host
              queue and your record is currently marked <strong className="font-semibold text-amber-700">Pending</strong>
              {' '}until the admin team reviews it.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl border border-emerald-100 bg-emerald-50 p-5">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                  <p className="font-semibold text-emerald-900">Next step</p>
                </div>
                <p className="mt-3 text-sm leading-7 text-emerald-900/80">
                  Use the user dashboard to check approval status, travel updates, and your submitted arrival details.
                </p>
              </div>
              <div className="rounded-3xl border border-amber-100 bg-amber-50 p-5">
                <div className="flex items-center gap-3">
                  <CircleAlert className="h-6 w-6 text-amber-600" />
                  <p className="font-semibold text-amber-900">Keep handy</p>
                </div>
                <p className="mt-3 text-sm leading-7 text-amber-900/80">
                  You will need the same email address you just used here when you check your status later.
                </p>
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to="/dashboard" className="primary-button">
                Go to user dashboard
                <ArrowRight className="h-4 w-4" />
              </Link>
              <button type="button" onClick={() => setSubmitted(false)} className="secondary-button">
                Submit another registration
              </button>
            </div>
          </section>

          <aside className="glass-panel p-8">
            <p className="section-label">Host diocese</p>
            <h2 className="mt-3 font-serif text-3xl text-slate-950">{DNDN_FACTS.name}</h2>
            <ul className="mt-6 space-y-4 text-sm leading-7 text-slate-600">
              <li><strong className="text-slate-900">Province:</strong> {DNDN_FACTS.province}</li>
              <li><strong className="text-slate-900">Bishop:</strong> {DNDN_FACTS.bishop}</li>
              <li><strong className="text-slate-900">Cathedral seat:</strong> {DNDN_FACTS.cathedral}</li>
              <li><strong className="text-slate-900">Established:</strong> {DNDN_FACTS.founded}</li>
            </ul>
          </aside>
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
        <section className="relative overflow-hidden rounded-[2rem] border border-white/70 bg-[linear-gradient(135deg,rgba(74,49,93,0.96),rgba(34,26,49,0.94))] px-6 py-8 text-white shadow-[0_32px_90px_-36px_rgba(15,23,42,0.7)] sm:px-8 lg:px-12 lg:py-12">
          <div className="absolute inset-y-0 right-0 hidden w-1/2 bg-[radial-gradient(circle_at_top,rgba(197,158,43,0.34),transparent_55%)] lg:block" />
          <div className="relative grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
            <div>
              <div className="flex items-center gap-4">
                <img src="/logo.png" alt="DNDN Logo" className="h-16 w-16 rounded-full bg-white p-2 shadow-lg" />
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.28em] text-amber-300">Church of Nigeria</p>
                  <p className="text-sm text-white/70">Anglican Communion</p>
                </div>
              </div>
              <h1 className="mt-8 max-w-3xl font-serif text-4xl leading-tight sm:text-5xl lg:text-6xl">
                Episcopal Consultation registration for the Diocese of Niger Delta North.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-white/78 sm:text-lg">
                Hosted in Port Harcourt under the leadership of {DNDN_FACTS.bishop}, this portal helps the DNDN team
                coordinate attendance, travel details, and status updates for delegates across the province.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <span className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium">
                  Founded {DNDN_FACTS.founded}
                </span>
                <span className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium">
                  {DNDN_FACTS.cathedral}
                </span>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
              <div className="rounded-3xl border border-white/15 bg-white/10 p-5 backdrop-blur">
                <Phone className="h-5 w-5 text-amber-300" />
                <p className="mt-3 text-sm font-semibold">Quick form flow</p>
                <p className="mt-2 text-sm leading-7 text-white/72">Complete the form once. The host team receives it instantly.</p>
              </div>
              <div className="rounded-3xl border border-white/15 bg-white/10 p-5 backdrop-blur">
                <CalendarDays className="h-5 w-5 text-amber-300" />
                <p className="mt-3 text-sm font-semibold">Arrival planning</p>
                <p className="mt-2 text-sm leading-7 text-white/72">Share arrival date, travel mode, and any transport support request.</p>
              </div>
              <div className="rounded-3xl border border-white/15 bg-white/10 p-5 backdrop-blur">
                <Mail className="h-5 w-5 text-amber-300" />
                <p className="mt-3 text-sm font-semibold">Status tracking</p>
                <p className="mt-2 text-sm leading-7 text-white/72">Use your email later in the public dashboard to check review status.</p>
              </div>
            </div>
          </div>
        </section>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <main className="glass-panel p-5 sm:p-8 lg:p-10">
            <div className="flex flex-col gap-3 border-b border-slate-100 pb-6 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="section-label">Registration form</p>
                <h2 className="mt-3 font-serif text-3xl text-slate-950 sm:text-4xl">Delegate details and travel logistics</h2>
              </div>
              <Link to="/dashboard" className="text-sm font-semibold text-amber-700 transition hover:text-amber-800">
                Already registered? Check status
              </Link>
            </div>

            {error ? (
              <div className="mt-6 rounded-3xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">{error}</div>
            ) : null}

            <form onSubmit={handleSubmit} className="mt-8 space-y-10">
              {fieldGroups.map((group) => (
                <section key={group.title}>
                  <div className="mb-5">
                    <h3 className="font-serif text-2xl text-slate-950">{group.title}</h3>
                    <p className="mt-2 text-sm leading-7 text-slate-500">{group.description}</p>
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    {group.fields.map((field) => {
                      const fullWidth = field === 'province';
                      if (field === 'modeOfTravel') {
                        return (
                          <label key={field} className={fullWidth ? 'sm:col-span-2' : ''}>
                            <span className="field-label">Mode of Travel</span>
                            <select name={field} required value={formData[field]} onChange={handleChange} className="field-input">
                              <option value="">Select your travel mode</option>
                              <option value="Air">Air</option>
                              <option value="Road">Road</option>
                            </select>
                          </label>
                        );
                      }

                      if (field === 'requireInternalTransport' || field === 'comingWithDriverEscort') {
                        const label = field === 'requireInternalTransport' ? 'Require Internal Transport?' : 'Coming with Driver/Escort?';
                        const hint =
                          field === 'requireInternalTransport'
                            ? 'Choose Yes if you need local pickup or movement support.'
                            : 'Choose Yes if another person will accompany you.';
                        return (
                          <label key={field} className={fullWidth ? 'sm:col-span-2' : ''}>
                            <span className="field-label">{label}</span>
                            <select name={field} value={formData[field]} onChange={handleChange} className="field-input">
                              <option value="No">No</option>
                              <option value="Yes">Yes</option>
                            </select>
                            <span className="field-hint">{hint}</span>
                          </label>
                        );
                      }

                      const labelMap = {
                        title: 'Title',
                        fullName: 'Full Name',
                        position: 'Position',
                        diocese: 'Diocese',
                        province: 'Province',
                        whatsappNumber: 'WhatsApp Number',
                        emailAddress: 'Email Address',
                        dateOfArrival: 'Date of Arrival',
                      };

                      const placeholderMap = {
                        title: 'Ven., Rt. Rev., Canon...',
                        fullName: 'Full delegate name',
                        position: 'Archdeacon, clergy, coordinator...',
                        diocese: 'Niger Delta North',
                        province: 'Niger Delta',
                        whatsappNumber: '+234...',
                        emailAddress: 'name@example.com',
                      };

                      const typeMap = {
                        whatsappNumber: 'tel',
                        emailAddress: 'email',
                        dateOfArrival: 'date',
                      };

                      return (
                        <label key={field} className={fullWidth ? 'sm:col-span-2' : ''}>
                          <span className="field-label">{labelMap[field]}</span>
                          <input
                            type={typeMap[field] || 'text'}
                            name={field}
                            required
                            value={formData[field]}
                            onChange={handleChange}
                            placeholder={placeholderMap[field]}
                            className="field-input"
                          />
                        </label>
                      );
                    })}
                  </div>

                  {group.title === 'Travel Logistics' && formData.comingWithDriverEscort === 'Yes' ? (
                    <div className="mt-5 grid gap-5 rounded-[1.75rem] border border-amber-100 bg-amber-50/70 p-5 sm:grid-cols-2">
                      <label>
                        <span className="field-label">Driver's Name</span>
                        <input
                          type="text"
                          name="driverName"
                          value={formData.driverName}
                          onChange={handleChange}
                          placeholder="Driver's full name"
                          className="field-input"
                        />
                      </label>
                      <label>
                        <span className="field-label">Escort's Name</span>
                        <input
                          type="text"
                          name="escortName"
                          value={formData.escortName}
                          onChange={handleChange}
                          placeholder="Escort's full name"
                          className="field-input"
                        />
                      </label>
                    </div>
                  ) : null}
                </section>
              ))}

              <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50/70 p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-semibold text-slate-900">Ready to send your details?</p>
                    <p className="mt-1 text-sm leading-7 text-slate-500">
                      Submission goes directly to the DNDN registration dashboard for review and logistics planning.
                    </p>
                  </div>
                  <button type="submit" disabled={loading} className="primary-button sm:min-w-52">
                    {loading ? 'Submitting...' : 'Complete registration'}
                    {!loading ? <ArrowRight className="h-4 w-4" /> : null}
                  </button>
                </div>
              </div>
            </form>
          </main>

          <aside className="space-y-6">
            <section className="glass-panel p-6 sm:p-7">
              <p className="section-label">About DNDN</p>
              <h2 className="mt-3 font-serif text-3xl text-slate-950">Institutional context for this consultation</h2>
              <p className="mt-4 text-sm leading-8 text-slate-600">
                {DNDN_FACTS.name} is part of the {DNDN_FACTS.province}. The diocese was inaugurated in {DNDN_FACTS.founded}
                {' '}and is associated with {DNDN_FACTS.cathedral}. This consultation workflow is designed to help the host
                team receive delegate information in a consistent, reviewable format.
              </p>
            </section>

            <section className="glass-panel p-6 sm:p-7">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
                  <Bus className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-serif text-2xl text-slate-950">Before you submit</h3>
                  <p className="text-sm text-slate-500">A quick final check keeps logistics clean.</p>
                </div>
              </div>
              <ul className="mt-5 space-y-3 text-sm leading-7 text-slate-600">
                <li>Use the same email address you want to check later on the status dashboard.</li>
                <li>Choose your arrival date carefully so transport planning reflects the right day.</li>
                <li>If you are coming with a driver or escort, include those names for host coordination.</li>
              </ul>
            </section>
          </aside>
        </div>

        <footer className="px-2 py-8 text-center text-sm text-slate-500">
          Episcopal Consult DNDN · Diocese of Niger Delta North · All rights reserved.
        </footer>
      </div>
    </div>
  );
}
