import { useState } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle2, CircleAlert } from 'lucide-react';
import { Link } from 'react-router-dom';
import { saveRegistration } from '../db';
import PublicFooter from '../components/PublicFooter';

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

const sections = [
  {
    title: 'Identity',
    description: 'Your title, name, office, and diocesan context.',
    fields: ['title', 'fullName', 'position', 'diocese', 'province'],
  },
  {
    title: 'Contact',
    description: 'The details the host team will use for communication.',
    fields: ['whatsappNumber', 'emailAddress'],
  },
  {
    title: 'Travel',
    description: 'Arrival and movement details for planning purposes.',
    fields: ['dateOfArrival', 'modeOfTravel', 'requireInternalTransport', 'comingWithDriverEscort'],
  },
];

const labels = {
  title: 'Title',
  fullName: 'Full Name',
  position: 'Position',
  diocese: 'Diocese',
  province: 'Province',
  whatsappNumber: 'WhatsApp Number',
  emailAddress: 'Email Address',
  dateOfArrival: 'Date of Arrival',
};

const placeholders = {
  title: 'Ven., Rt. Rev., Canon...',
  fullName: 'Delegate full name',
  position: 'Office or role',
  diocese: 'Diocese name',
  province: 'Province',
  whatsappNumber: '+234...',
  emailAddress: 'name@example.com',
};

const types = {
  whatsappNumber: 'tel',
  emailAddress: 'email',
  dateOfArrival: 'date',
};

export default function RegistrationForm() {
  const [formData, setFormData] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: value,
      ...(name === 'comingWithDriverEscort' && value === 'No' ? { driverName: '', escortName: '' } : {}),
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
      console.error(submitError);
      setError('We could not submit your registration right now. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="page-shell py-6 sm:py-8 lg:py-10">
        <div className="shell-container max-w-5xl">
          <div className="surface-card grid gap-6 p-6 sm:p-8 lg:grid-cols-[1.15fr_0.85fr] lg:p-10">
            <section>
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-800">
                <CheckCircle2 className="h-4 w-4" />
                Registration submitted
              </div>
              <h1 className="mt-6 font-serif text-5xl leading-none text-slate-950">You’re in the queue.</h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600">
                Your registration has been received and is now available to the consultation host team for review. Your current
                public status will show as <strong className="text-slate-950">Pending</strong> until it is updated.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link to="/dashboard" className="primary-button">
                  Check status
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <button type="button" onClick={() => setSubmitted(false)} className="secondary-button">
                  Submit another registration
                </button>
              </div>
            </section>

            <aside className="surface-soft p-6">
              <p className="eyebrow">Keep in mind</p>
              <ul className="mt-4 space-y-4 text-sm leading-7 text-slate-600">
                <li>Use the same email address on the status dashboard later.</li>
                <li>Travel details can affect transport planning and host coordination.</li>
              </ul>
            </aside>
          </div>
        </div>
        <PublicFooter />
      </div>
    );
  }

  return (
    <div className="page-shell py-6 sm:py-8 lg:py-10">
      <div className="shell-container max-w-6xl">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link to="/" className="ghost-link">
              <ArrowLeft className="h-4 w-4" />
              Back to homepage
            </Link>
            <p className="eyebrow mt-6">Registration</p>
            <h1 className="mt-3 font-serif text-5xl leading-none text-slate-950 sm:text-6xl">Delegate registration form</h1>
            <p className="mt-4 max-w-2xl text-sm leading-8 text-slate-600 sm:text-base">
              Complete the registration in one sitting with your identity, contact details, and travel logistics.
            </p>
          </div>
          <div className="surface-soft p-4 sm:max-w-xs">
            <p className="text-sm font-semibold text-slate-900">Need to check an existing record?</p>
            <p className="mt-2 text-sm leading-7 text-slate-600">Use the public dashboard instead of submitting a second form.</p>
            <Link to="/dashboard" className="ghost-link mt-3">
              Open status dashboard
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </header>

        <div className="page-section grid gap-8 lg:grid-cols-[1fr_0.34fr]">
          <main className="surface-card p-6 sm:p-8 lg:p-10">
            {error ? (
              <div className="mb-6 rounded-[1.25rem] border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">{error}</div>
            ) : null}

            <form onSubmit={handleSubmit} className="space-y-10">
              {sections.map((section) => (
                <section key={section.title} className="border-b border-slate-100 pb-8 last:border-b-0 last:pb-0">
                  <div className="mb-5">
                    <p className="eyebrow">{section.title}</p>
                    <p className="mt-2 text-sm leading-7 text-slate-500">{section.description}</p>
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    {section.fields.map((field) => {
                      const fullWidth = field === 'province';

                      if (field === 'modeOfTravel') {
                        return (
                          <label key={field} className={fullWidth ? 'sm:col-span-2' : ''}>
                            <span className="field-label">Mode of Travel</span>
                            <select name={field} required value={formData[field]} onChange={handleChange} className="field-input">
                              <option value="">Select mode</option>
                              <option value="Air">Air</option>
                              <option value="Road">Road</option>
                            </select>
                          </label>
                        );
                      }

                      if (field === 'requireInternalTransport' || field === 'comingWithDriverEscort') {
                        return (
                          <label key={field}>
                            <span className="field-label">
                              {field === 'requireInternalTransport' ? 'Require Internal Transport?' : 'Coming with Driver/Escort?'}
                            </span>
                            <select name={field} value={formData[field]} onChange={handleChange} className="field-input">
                              <option value="No">No</option>
                              <option value="Yes">Yes</option>
                            </select>
                          </label>
                        );
                      }

                      return (
                        <label key={field} className={fullWidth ? 'sm:col-span-2' : ''}>
                          <span className="field-label">{labels[field]}</span>
                          <input
                            type={types[field] || 'text'}
                            name={field}
                            required
                            value={formData[field]}
                            onChange={handleChange}
                            placeholder={placeholders[field]}
                            className="field-input"
                          />
                        </label>
                      );
                    })}
                  </div>

                  {section.title === 'Travel' && formData.comingWithDriverEscort === 'Yes' ? (
                    <div className="mt-5 grid gap-5 rounded-[1.5rem] border border-slate-200 bg-slate-50/80 p-5 sm:grid-cols-2">
                      <label>
                        <span className="field-label">Driver&apos;s Name</span>
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
                        <span className="field-label">Escort&apos;s Name</span>
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

              <div className="flex flex-col gap-4 rounded-[1.5rem] border border-slate-200 bg-slate-50/70 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-900">Ready to submit?</p>
                  <p className="mt-1 text-sm leading-7 text-slate-600">Your details go directly into the consultation registration queue.</p>
                </div>
                <button type="submit" disabled={loading} className="primary-button sm:min-w-52">
                  {loading ? 'Submitting...' : 'Complete registration'}
                  {!loading ? <ArrowRight className="h-4 w-4" /> : null}
                </button>
              </div>
            </form>
          </main>

          <aside className="space-y-4">
            <div className="surface-soft p-6">
              <p className="eyebrow">Need before you start</p>
              <ul className="mt-4 space-y-3 text-sm leading-7 text-slate-600">
                <li>Your full name and official role.</li>
                <li>Your email and WhatsApp contact.</li>
                <li>Your date of arrival and mode of travel.</li>
              </ul>
            </div>
            <div className="surface-soft p-6">
              <div className="flex items-start gap-3">
                <CircleAlert className="mt-0.5 h-5 w-5 text-orange-500" />
                <div>
                  <p className="text-sm font-semibold text-slate-900">Travel note</p>
                  <p className="mt-2 text-sm leading-7 text-slate-600">
                    If you need internal transport or are coming with a driver or escort, include that now so the host team can plan accordingly.
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
      <PublicFooter />
    </div>
  );
}
